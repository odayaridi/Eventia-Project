import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Minus,
  Phone,
  PhoneCall,
  PhoneOff,
  X,
} from "lucide-react";
import { useWebRTC } from "./WebRTCContext";
import "./WebRTCCallUI.css";

const WebRTCCallUI: React.FC = () => {
  const {
    callState,
    isMuted,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleMute,
  } = useWebRTC();

  const [isMinimized, setIsMinimized] = useState(false);

  if (callState.status === "idle") return null;

  const title =
    callState.status === "incoming"
      ? "Incoming audio call"
      : callState.status === "active"
      ? "Audio call active"
      : callState.status === "connecting"
      ? "Connecting call"
      : "Calling";

  const description =
    callState.status === "incoming"
      ? `${callState.remoteName} is calling you.`
      : callState.status === "active"
      ? `You are connected with ${callState.remoteName}.`
      : callState.status === "connecting"
      ? `Connecting with ${callState.remoteName}.`
      : `Calling ${callState.remoteName}.`;

  if (isMinimized && callState.status !== "incoming") {
    return (
      <div className="global-call-mini-window">
        <div className="global-call-mini-left">
          <div className="global-call-mini-icon">
            <PhoneCall size={18} />
          </div>
          <div>
            <h4>{callState.remoteName}</h4>
            <p>{callState.status === "active" ? "In call" : "Calling"}</p>
          </div>
        </div>

        <div className="global-call-mini-actions">
          {callState.status === "active" && (
            <button type="button" onClick={toggleMute}>
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}

          <button type="button" onClick={() => setIsMinimized(false)}>
            <PhoneCall size={16} />
          </button>

          <button type="button" className="danger" onClick={endCall}>
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="global-call-overlay">
      <div className="global-call-modal">
        {callState.status !== "incoming" && (
          <button
            type="button"
            className="global-call-minimize-btn"
            onClick={() => setIsMinimized(true)}
            title="Minimize"
          >
            <Minus size={18} />
          </button>
        )}

        <button
          type="button"
          className="global-call-close-btn"
          onClick={callState.status === "incoming" ? rejectIncomingCall : endCall}
          title="Close call"
        >
          <X size={18} />
        </button>

        <div className="global-call-avatar">
          <PhoneCall size={30} />
        </div>

        <h3>{title}</h3>
        <p>{description}</p>

        {callState.status === "incoming" ? (
          <div className="global-call-actions">
            <button
              type="button"
              className="global-call-action global-call-decline"
              onClick={rejectIncomingCall}
            >
              <PhoneOff size={18} />
              <span>Decline</span>
            </button>

            <button
              type="button"
              className="global-call-action global-call-accept"
              onClick={acceptIncomingCall}
            >
              <Phone size={18} />
              <span>Accept</span>
            </button>
          </div>
        ) : (
          <div className="global-call-actions">
            {callState.status === "active" && (
              <button
                type="button"
                className="global-call-action global-call-mute"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </button>
            )}

            <button
              type="button"
              className="global-call-action global-call-decline"
              onClick={endCall}
            >
              <PhoneOff size={18} />
              <span>End Call</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebRTCCallUI;