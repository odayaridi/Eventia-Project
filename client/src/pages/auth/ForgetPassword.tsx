import React, { useState } from "react";
import "./ForgetPassword.css";
import { Mail, ArrowRight, CalendarCheck } from "lucide-react";
import { forgotPassword } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert";
import AlertSnackbar from "../../components/common/AlertSnackbar";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { alertInfo, showAlert, handleClose } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showAlert("Please enter your email address.", "warning");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword(email);
      showAlert(response.message || "Reset link sent to your email.", "success");
    } catch (error: any) {
      showAlert(error.message || "Failed to send reset link.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">

        {/* Brand — identical to Login */}
        <header className="forgot-brand">
          <div className="forgot-brand-logo">
            <CalendarCheck size={18} />
          </div>
          <span className="forgot-brand-name">Eventia</span>
        </header>

        {/* Form header */}
        <div className="forgot-form-header">
          <h2>Forgot Password</h2>
          <p>Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {/* Form */}
        <form className="forgot-form" onSubmit={handleSubmit}>
          <div className="forgot-input-group forgot-animated-field delay-1">
            <label htmlFor="forgot-email">Email Address</label>
            <div className="forgot-input-wrapper">
              <Mail size={18} />
              <input
                id="forgot-email"
                type="email"
                placeholder="name@organization.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            className="forgot-submit-btn forgot-animated-field delay-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                Sending Request...
              </span>
            ) : (
              <>
                Send Reset Link
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="forgot-footer-note">
          <span>Remembered your password?</span>
          <button
            type="button"
            className="forgot-login-link"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>

      <AlertSnackbar
        open={alertInfo.open}
        message={alertInfo.message}
        severity={alertInfo.severity}
        onClose={handleClose}
      />
    </div>
  );
};

export default ForgotPassword;