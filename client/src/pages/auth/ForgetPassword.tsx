import React, { useState } from "react";
import "./ForgetPassword.css";
import { Mail, ArrowRight, Sparkles, CalendarCheck } from "lucide-react";
import { forgotPassword } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert"; // Adjust import path as needed
import AlertSnackbar from "../../components/common/AlertSnackbar";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Initialize custom alert hook
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
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="brand-logo">
            {/* <div className="brand-icon">
              <Sparkles size={20} color="white" />
            </div> */}
            <div className="brand-icon">
  <CalendarCheck size={20} />
</div>
            <span className="brand-text">Eventia</span>
          </div>
        </div>

        <div className="auth-content">
          <h2>Forgot Password</h2>
          <p className="auth-subtitle">
            Enter your email and we’ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@organization.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Sending Request..." : "Send Reset Link"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-footer">
            <span className="footer-text">Remembered your password?</span>
            <button className="text-link" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Snackbar Integration */}
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