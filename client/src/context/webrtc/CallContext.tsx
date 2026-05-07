import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

export type CallStatus = "idle" | "calling" | "incoming" | "connecting" | "active";
export type CallKind = "video";

export type ToastSeverity = "success" | "error" | "info" | "warning";

export type IncomingCallPayload = {
  conversationId: number;
  callerUserId: number;
  receiverUserId: number;
  callerUsername: string;
  callType: CallKind;
  offer: RTCSessionDescriptionInit;
};

export type CallState = {
  status: CallStatus;
  conversationId: number | null;
  remoteUserId: number | null;
  remoteName: string;
  incomingOffer: RTCSessionDescriptionInit | null;
};

export type StartCallPayload = {
  conversationId: number;
  remoteName: string;
};

export type ToastState = {
  open: boolean;
  message: string;
  severity: ToastSeverity;
};

export type CallContextValue = {
  socketRef: React.MutableRefObject<Socket | null>;
  socketVersion: number;
  callState: CallState;
  userId: number | null;

  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;

  toast: ToastState;
  closeToast: () => void;
  showCallAlert: (message: string, severity: ToastSeverity) => void;

  startCall: (payload: StartCallPayload) => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  rejectIncomingCall: () => Promise<void>;
  endCall: () => Promise<void>;

  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;

  handleIncomingCall: (payload: IncomingCallPayload) => void;
  handleCallAnswered: (payload: {
    conversationId: number;
    callerUserId: number;
    receiverUserId: number;
    answer: RTCSessionDescriptionInit;
  }) => Promise<void>;
  handleIceCandidate: (payload: {
    conversationId: number;
    senderUserId: number;
    receiverUserId: number;
    candidate: RTCIceCandidateInit;
  }) => Promise<void>;
  handleCallRejected: () => void;
  handleCallEnded: () => void;
};

export const CallContext = createContext<CallContextValue | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used inside CallProvider");
  }

  return context;
};