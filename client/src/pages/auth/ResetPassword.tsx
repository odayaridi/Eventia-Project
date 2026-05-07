import React, { useEffect, useState } from "react";
import "./ResetPassword.css";
import { Lock, ArrowRight, Loader2, CalendarCheck } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyResetToken, resetPassword } from "../../api/authApi";
import { useAlert } from "../../hooks/useAlert";
import AlertSnackbar from "../../components/common/AlertSnackbar";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const navigate = useNavigate();
  const { alertInfo, showAlert, handleClose } = useAlert();

  useEffect(() => {
    const checkToken = async () => {
      try {
        if (!token) throw new Error("Invalid or missing reset link.");
        await verifyResetToken(token);
        setValid(true);
      } catch (err: any) {
        showAlert(
          err.message || "This password reset link is invalid or has expired.",
          "error"
        );
        setValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [token, showAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showAlert("Password must be at least 6 characters long.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Passwords do not match.", "error");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token!, password);

      showAlert("Password reset successful! Redirecting to login...", "success");

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err: any) {
      showAlert(err.message || "Failed to reset password. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo">
            <div className="brand-icon">
              <CalendarCheck size={20} />
            </div>
            <span className="brand-text">Eventia</span>
          </div>
        </div>

        <div className="auth-content">
          {isValidating ? (
            <div className="validating-state">
              <Loader2 className="spinner input-icon" size={32} />
              <p className="auth-subtitle validating-text">
                Validating your secure link...
              </p>
            </div>
          ) : !valid ? (
            <div className="validating-state expired-state">
              <h2>Link Expired</h2>
              <p className="auth-subtitle">
                Your password reset link is invalid or has expired.
              </p>
              <button
                className="auth-btn"
                type="button"
                onClick={() => navigate("/forget-password")}
              >
                Request New Link
              </button>
            </div>
          ) : (
            <>
              <h2>Create New Password</h2>
              <p className="auth-subtitle">
                Please enter and confirm your new password below.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      placeholder="Enter new password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group form-group-last">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? "Resetting Password..." : "Reset Password"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </>
          )}
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

export default ResetPassword;