export type WebRTCCallType = "audio";

export type WebRTCCallStatus =
  | "idle"
  | "calling"
  | "incoming"
  | "connecting"
  | "active";

export interface WebRTCAck {
  success: boolean;
  message: string;
  receiverUserId?: number;
}

export interface WebRTCIncomingCallPayload {
  conversationId: number;
  callerUserId: number;
  receiverUserId: number;
  callerUsername: string;
  callType: WebRTCCallType;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerPayload {
  conversationId: number;
  callerUserId: number;
  receiverUserId: number;
  answer: RTCSessionDescriptionInit;
}

export interface WebRTCIceCandidatePayload {
  conversationId: number;
  senderUserId: number;
  receiverUserId: number;
  candidate: RTCIceCandidateInit;
}

export interface WebRTCStartCallPayload {
  conversationId: number;
  remoteName: string;
}

export interface WebRTCCallState {
  status: WebRTCCallStatus;
  conversationId: number | null;
  remoteUserId: number | null;
  remoteName: string;
  incomingOffer: RTCSessionDescriptionInit | null;
}