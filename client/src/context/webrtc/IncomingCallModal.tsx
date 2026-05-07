import React, { useEffect, useRef } from "react";
import {
  Camera,
  CameraOff,
  Maximize2,
  Mic,
  MicOff,
  MonitorUp,
  Phone,
  PhoneCall,
  PhoneOff,
  X,
} from "lucide-react";
import { useCall } from "./CallContext";
import AlertSnackbar from "../../components/common/AlertSnackbar";

const IncomingCallModal: React.FC = () => {
  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    isScreenSharing,
    toast,
    closeToast,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const isCallVisible =
    callState.status === "incoming" ||
    callState.status === "calling" ||
    callState.status === "connecting" ||
    callState.status === "active";

  const isActiveOrConnecting =
    callState.status === "calling" ||
    callState.status === "connecting" ||
    callState.status === "active";

  return (
    <>
      {callState.status === "incoming" && (
        <div className="call-overlay">
          <div className="call-incoming-modal">
            <button
              type="button"
              className="call-close-btn"
              onClick={rejectIncomingCall}
            >
              <X size={18} />
            </button>

            <div className="call-avatar">
              <PhoneCall size={30} />
            </div>

            <h3>Incoming video call</h3>
            <p>{callState.remoteName} is calling you.</p>

            <div className="call-incoming-actions">
              <button
                type="button"
                className="call-action-btn call-decline-btn"
                onClick={rejectIncomingCall}
              >
                <PhoneOff size={18} />
                <span>Decline</span>
              </button>

              <button
                type="button"
                className="call-action-btn call-accept-btn"
                onClick={acceptIncomingCall}
              >
                <Phone size={18} />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isCallVisible && isActiveOrConnecting && (
        <div className="call-floating-window">
          <div className="call-floating-header">
            <div>
              <h4>
                {callState.status === "active"
                  ? "Video call"
                  : callState.status === "calling"
                  ? "Calling..."
                  : "Connecting..."}
              </h4>
              <span>{callState.remoteName || "User"}</span>
            </div>

            <button
              type="button"
              className="call-icon-btn"
              onClick={endCall}
              title="Close call"
            >
              <X size={17} />
            </button>
          </div>

          <div className="call-video-stage">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="call-remote-video"
              />
            ) : (
              <div className="call-video-placeholder">
                <PhoneCall size={32} />
                <span>
                  {callState.status === "calling"
                    ? "Waiting for answer..."
                    : "Connecting video..."}
                </span>
              </div>
            )}

            <div className="call-local-preview">
              {localStream && !isCameraOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="call-local-video"
                />
              ) : (
                <div className="call-local-placeholder">
                  <CameraOff size={18} />
                </div>
              )}
            </div>

            {isScreenSharing && (
              <div className="call-screen-badge">
                <MonitorUp size={13} />
                <span>Sharing screen</span>
              </div>
            )}
          </div>

          <div className="call-controls">
            <button
              type="button"
              className={`call-control-btn ${isMuted ? "is-danger" : ""}`}
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              type="button"
              className={`call-control-btn ${isCameraOff ? "is-danger" : ""}`}
              onClick={toggleCamera}
              title={isCameraOff ? "Turn camera on" : "Turn camera off"}
            >
              {isCameraOff ? <CameraOff size={18} /> : <Camera size={18} />}
            </button>

            <button
              type="button"
              className={`call-control-btn ${isScreenSharing ? "is-active" : ""}`}
              onClick={toggleScreenShare}
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              <MonitorUp size={18} />
            </button>

            <button
              type="button"
              className="call-control-btn call-end-btn"
              onClick={endCall}
              title="End call"
            >
              <PhoneOff size={18} />
            </button>

            <button
              type="button"
              className="call-control-btn"
              title="Floating call window"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      )}

      <AlertSnackbar
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={closeToast}
      />
    </>
  );
};

export default IncomingCallModal;