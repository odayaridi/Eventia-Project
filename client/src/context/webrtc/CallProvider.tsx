import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "../AuthContext";
import { CallContext } from "./CallContext";
import type {
  CallState,
  IncomingCallPayload,
  StartCallPayload,
  ToastSeverity,
  ToastState,
} from "./CallContext";
import GlobalCallListener from "./GlobalCallListener";
import IncomingCallModal from "./IncomingCallModal";
import "./Call.css";

const SOCKET_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:3010";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const initialCallState: CallState = {
  status: "idle",
  conversationId: null,
  remoteUserId: null,
  remoteName: "",
  incomingOffer: null,
};

const initialToast: ToastState = {
  open: false,
  message: "",
  severity: "info",
};

type Props = {
  children: React.ReactNode;
};

const CallProvider: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();

  const userId = useMemo(() => {
    const raw = localStorage.getItem("userId");
    return raw ? Number(raw) : null;
  }, [user]);

  const [socketVersion, setSocketVersion] = useState(0);
  const [callState, setCallState] = useState<CallState>(initialCallState);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [toast, setToast] = useState<ToastState>(initialToast);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const pendingLocalIceRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingRemoteIceRef = useRef<RTCIceCandidateInit[]>([]);

  const remoteUserIdRef = useRef<number | null>(null);
  const callConversationIdRef = useRef<number | null>(null);
  const callStateRef = useRef<CallState>(initialCallState);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const showCallAlert = useCallback(
    (message: string, severity: ToastSeverity) => {
      setToast({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const closeToast = () => {
    setToast((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const emitWithAck = <T,>(
    eventName: string,
    payload: Record<string, unknown>
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit(
        eventName,
        payload,
        (response: T & { success: boolean; message: string }) => {
          if (!response?.success) {
            reject(new Error(response?.message || "Socket request failed."));
            return;
          }

          resolve(response);
        }
      );
    });
  };

  const stopStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const cleanupCall = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    stopStream(cameraStreamRef.current);
    stopStream(screenStreamRef.current);

    cameraStreamRef.current = null;
    screenStreamRef.current = null;

    pendingLocalIceRef.current = [];
    pendingRemoteIceRef.current = [];

    remoteUserIdRef.current = null;
    callConversationIdRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
    setCallState(initialCallState);
  }, []);

  const flushLocalIceCandidates = async () => {
    const socket = socketRef.current;
    const conversationId = callConversationIdRef.current;
    const receiverUserId = remoteUserIdRef.current;

    if (!socket || !conversationId || !receiverUserId || !userId) return;

    const queued = [...pendingLocalIceRef.current];
    pendingLocalIceRef.current = [];

    queued.forEach((candidate) => {
      socket.emit("webrtc_ice_candidate", {
        conversationId,
        senderUserId: userId,
        receiverUserId,
        candidate,
      });
    });
  };

  const flushRemoteIceCandidates = async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;

    const queued = [...pendingRemoteIceRef.current];
    pendingRemoteIceRef.current = [];

    for (const candidate of queued) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const createPeerConnection = (conversationId: number) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (!event.candidate || !userId) return;

      const candidate = event.candidate.toJSON();
      const receiverUserId = remoteUserIdRef.current;

      if (!receiverUserId) {
        pendingLocalIceRef.current.push(candidate);
        return;
      }

      socketRef.current?.emit("webrtc_ice_candidate", {
        conversationId,
        senderUserId: userId,
        receiverUserId,
        candidate,
      });
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;

      if (stream) {
        setRemoteStream(stream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        if (callStateRef.current.status === "active") {
          showCallAlert("Call connection ended.", "info");
          cleanupCall();
        }
      }
    };

    peerConnectionRef.current = pc;
    callConversationIdRef.current = conversationId;

    return pc;
  };

  const getCameraStream = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Your browser does not support camera or microphone calls.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    cameraStreamRef.current = stream;
    setLocalStream(stream);

    return stream;
  };

  const replaceVideoTrack = async (newTrack: MediaStreamTrack) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    const sender = pc
      .getSenders()
      .find((item) => item.track && item.track.kind === "video");

    if (sender) {
      await sender.replaceTrack(newTrack);
    }
  };

  const restoreCameraAfterScreenShare = async () => {
    const cameraStream = cameraStreamRef.current;
    const cameraVideoTrack = cameraStream?.getVideoTracks()[0];

    if (!cameraVideoTrack) {
      setIsScreenSharing(false);
      return;
    }

    await replaceVideoTrack(cameraVideoTrack);

    stopStream(screenStreamRef.current);
    screenStreamRef.current = null;

    setLocalStream(cameraStream);
    setIsScreenSharing(false);
  };

  const startCall = async ({ conversationId, remoteName }: StartCallPayload) => {
    if (!userId) {
      showCallAlert("User ID was not found. Please log in again.", "error");
      return;
    }

    if (!conversationId) {
      showCallAlert("Conversation is not ready yet.", "error");
      return;
    }

    if (!socketRef.current) {
      showCallAlert("Socket connection is not ready.", "error");
      return;
    }

    if (callStateRef.current.status !== "idle") {
      showCallAlert("You already have a call in progress.", "error");
      return;
    }

    try {
      setCallState({
        status: "calling",
        conversationId,
        remoteUserId: null,
        remoteName,
        incomingOffer: null,
      });

      const stream = await getCameraStream();
      const pc = createPeerConnection(conversationId);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await emitWithAck<{
        success: boolean;
        message: string;
        receiverUserId: number;
      }>("webrtc_call_user", {
        conversationId,
        callerUserId: userId,
        callType: "video",
        offer,
      });

      remoteUserIdRef.current = Number(response.receiverUserId);

      setCallState((prev) => ({
        ...prev,
        remoteUserId: Number(response.receiverUserId),
      }));

      await flushLocalIceCandidates();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start call.";
      showCallAlert(message, "error");
      cleanupCall();
    }
  };

  const acceptIncomingCall = async () => {
    if (
      !userId ||
      !callState.incomingOffer ||
      !callState.conversationId ||
      !callState.remoteUserId
    ) {
      showCallAlert("Invalid incoming call.", "error");
      cleanupCall();
      return;
    }

    try {
      setCallState((prev) => ({
        ...prev,
        status: "connecting",
      }));

      remoteUserIdRef.current = callState.remoteUserId;

      const stream = await getCameraStream();
      const pc = createPeerConnection(callState.conversationId);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(callState.incomingOffer));
      await flushRemoteIceCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await emitWithAck("webrtc_answer_call", {
        conversationId: callState.conversationId,
        callerUserId: callState.remoteUserId,
        receiverUserId: userId,
        answer,
      });

      setCallState((prev) => ({
        ...prev,
        status: "active",
        incomingOffer: null,
      }));

      await flushLocalIceCandidates();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to accept call.";
      showCallAlert(message, "error");
      cleanupCall();
    }
  };

  const rejectIncomingCall = async () => {
    if (callState.conversationId && callState.remoteUserId && userId) {
      socketRef.current?.emit("webrtc_reject_call", {
        conversationId: callState.conversationId,
        callerUserId: callState.remoteUserId,
        receiverUserId: userId,
      });
    }

    cleanupCall();
  };

  const endCall = async () => {
    const conversationId = callConversationIdRef.current || callState.conversationId;
    const receiverUserId = remoteUserIdRef.current || callState.remoteUserId;

    if (conversationId && receiverUserId && userId) {
      socketRef.current?.emit("webrtc_end_call", {
        conversationId,
        senderUserId: userId,
        receiverUserId,
      });
    }

    cleanupCall();
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;

    cameraStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });

    screenStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });

    setIsMuted(nextMuted);
  };

  const toggleCamera = () => {
    const nextCameraOff = !isCameraOff;

    cameraStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });

    setIsCameraOff(nextCameraOff);
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await restoreCameraAfterScreenShare();
        return;
      }

      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Screen sharing is not supported by this browser.");
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        throw new Error("No screen video track was selected.");
      }

      screenStreamRef.current = screenStream;
      setLocalStream(screenStream);
      setIsScreenSharing(true);

      await replaceVideoTrack(screenTrack);

      screenTrack.onended = () => {
        restoreCameraAfterScreenShare().catch(() => undefined);
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to share screen.";
      showCallAlert(message, "error");
    }
  };

  const handleIncomingCall = (payload: IncomingCallPayload) => {
    if (callStateRef.current.status !== "idle") {
      socketRef.current?.emit("webrtc_reject_call", {
        conversationId: payload.conversationId,
        callerUserId: payload.callerUserId,
        receiverUserId: userId,
      });
      return;
    }

    remoteUserIdRef.current = payload.callerUserId;
    callConversationIdRef.current = payload.conversationId;

    setCallState({
      status: "incoming",
      conversationId: payload.conversationId,
      remoteUserId: payload.callerUserId,
      remoteName: payload.callerUsername || "User",
      incomingOffer: payload.offer,
    });
  };

  const handleCallAnswered = async (payload: {
    conversationId: number;
    callerUserId: number;
    receiverUserId: number;
    answer: RTCSessionDescriptionInit;
  }) => {
    try {
      if (Number(payload.conversationId) !== Number(callConversationIdRef.current)) {
        return;
      }

      await peerConnectionRef.current?.setRemoteDescription(
        new RTCSessionDescription(payload.answer)
      );

      await flushRemoteIceCandidates();

      setCallState((prev) => ({
        ...prev,
        status: "active",
        incomingOffer: null,
      }));
    } catch {
      showCallAlert("Failed to connect the call.", "error");
      cleanupCall();
    }
  };

  const handleIceCandidate = async (payload: {
    conversationId: number;
    senderUserId: number;
    receiverUserId: number;
    candidate: RTCIceCandidateInit;
  }) => {
    const pc = peerConnectionRef.current;

    if (!pc || !pc.remoteDescription) {
      pendingRemoteIceRef.current.push(payload.candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
    } catch {
      // ignore invalid late ICE candidate
    }
  };

  const handleCallRejected = () => {
    showCallAlert("Call was rejected.", "info");
    cleanupCall();
  };

  const handleCallEnded = () => {
    showCallAlert("Call ended.", "info");
    cleanupCall();
  };

  useEffect(() => {
    if (!user) return;

    if (user.role !== "eventOrganizer" && user.role !== "venueManager") {
      return;
    }

    if (!userId || Number.isNaN(userId)) return;

    const socket = io(SOCKET_BASE_URL, {
      query: { userId },
      transports: ["websocket"],
    });

    socketRef.current = socket;
    setSocketVersion((prev) => prev + 1);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketVersion((prev) => prev + 1);
      cleanupCall();
    };
  }, [user, userId, cleanupCall]);

  return (
    <CallContext.Provider
      value={{
        socketRef,
        socketVersion,
        callState,
        userId,

        localStream,
        remoteStream,

        isMuted,
        isCameraOff,
        isScreenSharing,

        toast,
        closeToast,
        showCallAlert,

        startCall,
        acceptIncomingCall,
        rejectIncomingCall,
        endCall,

        toggleMute,
        toggleCamera,
        toggleScreenShare,

        handleIncomingCall,
        handleCallAnswered,
        handleIceCandidate,
        handleCallRejected,
        handleCallEnded,
      }}
    >
      {children}
      <GlobalCallListener />
      <IncomingCallModal />
    </CallContext.Provider>
  );
};

export default CallProvider;