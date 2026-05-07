import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  CalendarDays,
  Ticket,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import "./PaymentSuccess.css";

const REDIRECT_SECONDS = 5;

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  // Auto-redirect to orders / my-tickets after countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/attendee/bookings");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="ps-shell">
      <div className="ps-card">
        {/* Animated check icon */}
        <div className="ps-icon-wrap">
          <div className="ps-icon-ring" />
          <CheckCircle2 size={48} className="ps-check-icon" />
        </div>

        {/* Heading */}
        <h1 className="ps-title">Payment Successful!</h1>
        <p className="ps-subtitle">
          Your booking is being confirmed. Your tickets will be ready shortly.
        </p>

        {/* Info cards */}
        <div className="ps-info-grid">
          <div className="ps-info-item">
            <div className="ps-info-icon">
              <Ticket size={20} />
            </div>
            <div>
              <p className="ps-info-label">Your Tickets</p>
              <p className="ps-info-value">Check My Tickets for QR codes</p>
            </div>
          </div>

          <div className="ps-info-item">
            <div className="ps-info-icon">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="ps-info-label">Booking Processing</p>
              <p className="ps-info-value">Usually confirmed within seconds</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="ps-divider" />

        {/* Actions */}
        <div className="ps-actions">
          <button
            type="button"
            className="ps-btn-primary"
            onClick={() => navigate("/attendee/bookings")}
          >
            <span>Go to Bookings</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="ps-btn-secondary"
            onClick={() => navigate("/attendee/browse")}
          >
            <span>Browse More Events</span>
          </button>
        </div>

        {/* Auto-redirect notice */}
        <div className="ps-redirect-notice">
          <LoaderCircle size={14} className="ps-redirect-spin" />
          <span>
            Redirecting to your bookings in{" "}
            <strong>{countdown}</strong> second{countdown !== 1 ? "s" : ""}…
          </span>
        </div>

        {/* Optional: show session id for reference */}
        {sessionId && (
          <p className="ps-session-id">
            Reference: <span>{sessionId}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;