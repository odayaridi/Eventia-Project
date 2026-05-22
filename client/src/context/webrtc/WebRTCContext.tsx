import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "../AuthContext";
import type {
  WebRTCAck,
  WebRTCCallState,
  WebRTCIncomingCallPayload,
  WebRTCIceCandidatePayload,
  WebRTCStartCallPayload,
} from "./webrtcTypes";

const SOCKET_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ??
  "http://localhost:3010";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const initialCallState: WebRTCCallState = {
  status: "idle",
  conversationId: null,
  remoteUserId: null,
  remoteName: "",
  incomingOffer: null,
};

interface WebRTCContextValue {
  callState: WebRTCCallState;
  isMuted: boolean;
  isGlobalCallBusy: boolean;
  startCall: (payload: WebRTCStartCallPayload) => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  rejectIncomingCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
}

const WebRTCContext = createContext<WebRTCContextValue | null>(null);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [callState, setCallState] =
    useState<WebRTCCallState>(initialCallState);
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const pendingLocalIceRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingRemoteIceRef = useRef<RTCIceCandidateInit[]>([]);

  const remoteUserIdRef = useRef<number | null>(null);
  const callConversationIdRef = useRef<number | null>(null);
  const callStateRef = useRef<WebRTCCallState>(initialCallState);

  const userId = (() => {
    const raw = localStorage.getItem("userId");
    return raw ? Number(raw) : null;
  })();

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const emitWithAck = <T,>(
    eventName: string,
    payload: Record<string, unknown>
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;

      if (!socket || !socket.connected) {
        reject(new Error("Call socket is not connected."));
        return;
      }

      socket.emit(
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

  const cleanupCall = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    pendingLocalIceRef.current = [];
    pendingRemoteIceRef.current = [];
    remoteUserIdRef.current = null;
    callConversationIdRef.current = null;

    setIsMuted(false);
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
      const [remoteStream] = event.streams;

      if (remoteAudioRef.current && remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(() => undefined);
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        ["failed", "disconnected", "closed"].includes(pc.connectionState) &&
        callStateRef.current.status === "active"
      ) {
        cleanupCall();
      }
    };

    peerConnectionRef.current = pc;
    callConversationIdRef.current = conversationId;

    return pc;
  };

  const getMicrophoneStream = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Your browser does not support microphone calls.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;
    return stream;
  };

  const startCall = async ({ conversationId, remoteName }: WebRTCStartCallPayload) => {
    if (!userId) {
      throw new Error("User ID was not found. Please log in again.");
    }

    if (callStateRef.current.status !== "idle") {
      throw new Error("You already have a call in progress.");
    }

    try {
      setCallState({
        status: "calling",
        conversationId,
        remoteUserId: null,
        remoteName,
        incomingOffer: null,
      });

      const stream = await getMicrophoneStream();
      const pc = createPeerConnection(conversationId);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await emitWithAck<WebRTCAck>("webrtc_call_user", {
        conversationId,
        callerUserId: userId,
        callType: "audio",
        offer,
      });

      if (!response.receiverUserId) {
        throw new Error("Receiver user ID was not returned from server.");
      }

      remoteUserIdRef.current = Number(response.receiverUserId);

      setCallState((prev) => ({
        ...prev,
        remoteUserId: Number(response.receiverUserId),
      }));

      await flushLocalIceCandidates();
    } catch (error) {
      cleanupCall();
      throw error;
    }
  };

  const acceptIncomingCall = async () => {
    const current = callStateRef.current;

    if (
      !userId ||
      !current.incomingOffer ||
      !current.conversationId ||
      !current.remoteUserId
    ) {
      cleanupCall();
      return;
    }

    try {
      setCallState((prev) => ({ ...prev, status: "connecting" }));

      remoteUserIdRef.current = current.remoteUserId;
      callConversationIdRef.current = current.conversationId;

      const stream = await getMicrophoneStream();
      const pc = createPeerConnection(current.conversationId);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(
        new RTCSessionDescription(current.incomingOffer)
      );

      await flushRemoteIceCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await emitWithAck("webrtc_answer_call", {
        conversationId: current.conversationId,
        callerUserId: current.remoteUserId,
        receiverUserId: userId,
        answer,
      });

      setCallState((prev) => ({
        ...prev,
        status: "active",
        incomingOffer: null,
      }));

      await flushLocalIceCandidates();
    } catch {
      cleanupCall();
    }
  };

  const rejectIncomingCall = () => {
    const current = callStateRef.current;

    if (current.conversationId && current.remoteUserId && userId) {
      socketRef.current?.emit("webrtc_reject_call", {
        conversationId: current.conversationId,
        callerUserId: current.remoteUserId,
        receiverUserId: userId,
      });
    }

    cleanupCall();
  };

  const endCall = () => {
    const conversationId =
      callConversationIdRef.current || callStateRef.current.conversationId;
    const receiverUserId =
      remoteUserIdRef.current || callStateRef.current.remoteUserId;

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

    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });

    setIsMuted(nextMuted);
  };

  useEffect(() => {
    if (!user) {
      cleanupCall();
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (user.role !== "eventOrganizer" && user.role !== "venueManager") {
      return;
    }

    const rawUserId = localStorage.getItem("userId");
    if (!rawUserId) return;

    const socket = io(SOCKET_BASE_URL, {
      query: { userId: rawUserId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("webrtc_incoming_call", (payload: WebRTCIncomingCallPayload) => {
      if (callStateRef.current.status !== "idle") {
        socket.emit("webrtc_reject_call", {
          conversationId: payload.conversationId,
          callerUserId: payload.callerUserId,
          receiverUserId: Number(rawUserId),
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
    });

    socket.on("webrtc_call_answered", async (payload) => {
      try {
        if (
          Number(payload.conversationId) !==
          Number(callConversationIdRef.current)
        ) {
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
        cleanupCall();
      }
    });

    socket.on(
      "webrtc_ice_candidate_received",
      async (payload: WebRTCIceCandidatePayload) => {
        if (
          Number(payload.conversationId) !==
          Number(callConversationIdRef.current)
        ) {
          return;
        }

        const pc = peerConnectionRef.current;

        if (!pc || !pc.remoteDescription) {
          pendingRemoteIceRef.current.push(payload.candidate);
          return;
        }

        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // ignore late invalid candidates
        }
      }
    );

    socket.on("webrtc_call_rejected", () => {
      cleanupCall();
    });

    socket.on("webrtc_call_ended", () => {
      cleanupCall();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      cleanupCall();
    };
  }, [user, cleanupCall]);

  return (
    <WebRTCContext.Provider
      value={{
        callState,
        isMuted,
        isGlobalCallBusy: callState.status !== "idle",
        startCall,
        acceptIncomingCall,
        rejectIncomingCall,
        endCall,
        toggleMute,
      }}
    >
      {children}
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);

  if (!context) {
    throw new Error("useWebRTC must be used inside WebRTCProvider");
  }

  return context;
};