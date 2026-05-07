import { useEffect } from "react";
import { useCall } from "./CallContext";
import type { IncomingCallPayload } from "./CallContext";

const GlobalCallListener = () => {
  const {
    socketRef,
    socketVersion,
    handleIncomingCall,
    handleCallAnswered,
    handleIceCandidate,
    handleCallRejected,
    handleCallEnded,
  } = useCall();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onIncomingCall = (payload: IncomingCallPayload) => {
      handleIncomingCall(payload);
    };

    const onCallAnswered = (payload: {
      conversationId: number;
      callerUserId: number;
      receiverUserId: number;
      answer: RTCSessionDescriptionInit;
    }) => {
      handleCallAnswered(payload);
    };

    const onIceCandidate = (payload: {
      conversationId: number;
      senderUserId: number;
      receiverUserId: number;
      candidate: RTCIceCandidateInit;
    }) => {
      handleIceCandidate(payload);
    };

    socket.on("webrtc_incoming_call", onIncomingCall);
    socket.on("webrtc_call_answered", onCallAnswered);
    socket.on("webrtc_ice_candidate_received", onIceCandidate);
    socket.on("webrtc_call_rejected", handleCallRejected);
    socket.on("webrtc_call_ended", handleCallEnded);

    return () => {
      socket.off("webrtc_incoming_call", onIncomingCall);
      socket.off("webrtc_call_answered", onCallAnswered);
      socket.off("webrtc_ice_candidate_received", onIceCandidate);
      socket.off("webrtc_call_rejected", handleCallRejected);
      socket.off("webrtc_call_ended", handleCallEnded);
    };
  }, [
    socketRef,
    socketVersion,
    handleIncomingCall,
    handleCallAnswered,
    handleIceCandidate,
    handleCallRejected,
    handleCallEnded,
  ]);

  return null;
};

export default GlobalCallListener;