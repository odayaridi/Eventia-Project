import React, { useEffect, useState, useMemo } from "react";
import "./ResetPassword.css";
import {
  Lock,
  ArrowRight,
  Loader2,
  CalendarCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyResetToken, resetPassword } from "../../api/authApi";
import { useAlert } from "../../hooks/useAlert";
import AlertSnackbar from "../../components/common/AlertSnackbar";

/* ─── Password strength helpers (identical to SignUp) ───────── */

const getPasswordChecks = (password: string) => ({
  minLength: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  specialChar: /[^A-Za-z0-9]/.test(password),
});

const getPasswordStrength = (password: string) => {
  const checks = getPasswordChecks(password);
  const passedCount = Object.values(checks).filter(Boolean).length;

  if (!password) {
    return { score: 0, label: "Password strength", className: "empty", isStrong: false, checks };
  }
  if (passedCount <= 2) {
    return { score: 33, label: "Weak password", className: "weak", isStrong: false, checks };
  }
  if (passedCount <= 4) {
    return { score: 66, label: "Medium password", className: "medium", isStrong: false, checks };
  }
  return { score: 100, label: "Strong password", className: "strong", isStrong: true, checks };
};

/* ─── Component ─────────────────────────────────────────────── */

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const navigate = useNavigate();
  const { alertInfo, showAlert, handleClose } = useAlert();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const showPasswordValidation = passwordTouched || password.length > 0;

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched(true);

    if (!passwordStrength.isStrong) {
      showAlert("Please create a stronger password before resetting.", "error");
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
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      showAlert(err.message || "Failed to reset password. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordRequirement = (passed: boolean, text: string) => (
    <li className={passed ? "valid" : "invalid"}>
      {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      <span>{text}</span>
    </li>
  );

  return (
    <div className="reset-page">
      <div className="reset-card">

        {/* Brand */}
        <header className="reset-brand">
          <div className="reset-brand-logo">
            <CalendarCheck size={18} />
          </div>
          <span className="reset-brand-name">Eventia</span>
        </header>

        {/* Validating */}
        {isValidating ? (
          <div className="reset-state reset-animated-field delay-1">
            <Loader2 className="reset-spinner" size={32} />
            <p>Validating your secure link...</p>
          </div>

        /* Expired */
        ) : !valid ? (
          <div className="reset-state reset-animated-field delay-1">
            <h2>Link Expired</h2>
            <p>Your password reset link is invalid or has expired.</p>
            <button
              className="reset-submit-btn"
              type="button"
              onClick={() => navigate("/forget-password")}
            >
              Request New Link
              <ArrowRight size={18} />
            </button>
          </div>

        /* Valid form */
        ) : (
          <>
            <div className="reset-form-header">
              <h2>Create New Password</h2>
              <p>Enter and confirm your new password below.</p>
            </div>

            <form className="reset-form" onSubmit={handleSubmit}>

              {/* New Password */}
              <div className="reset-input-group reset-animated-field delay-1">
                <div className="reset-label-row">
                  <label htmlFor="reset-new-password">New Password</label>
                  {showPasswordValidation && (
                    <span className={`password-strength-label ${passwordStrength.className}`}>
                      {passwordStrength.label}
                    </span>
                  )}
                </div>

                <div
                  className={`reset-input-wrapper ${
                    showPasswordValidation && !passwordStrength.isStrong ? "input-error" : ""
                  } ${
                    showPasswordValidation && passwordStrength.isStrong ? "input-success" : ""
                  }`}
                >
                  <Lock size={18} />
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength meter */}
                <div className={`password-strength-meter ${showPasswordValidation ? "visible" : ""}`}>
                  <div className="password-strength-track">
                    <span
                      className={`password-strength-fill ${passwordStrength.className}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>

                {/* Requirements checklist */}
                {showPasswordValidation && (
                  <div className="password-rules-box">
                    <p>Enterprise password requirements:</p>
                    <ul>
                      {renderPasswordRequirement(passwordStrength.checks.minLength, "At least 8 characters")}
                      {renderPasswordRequirement(passwordStrength.checks.uppercase, "At least one uppercase letter")}
                      {renderPasswordRequirement(passwordStrength.checks.lowercase, "At least one lowercase letter")}
                      {renderPasswordRequirement(passwordStrength.checks.number, "At least one number")}
                      {renderPasswordRequirement(passwordStrength.checks.specialChar, "At least one symbol")}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="reset-input-group reset-animated-field delay-2">
                <label htmlFor="reset-confirm-password">Confirm Password</label>
                <div className="reset-input-wrapper">
                  <Lock size={18} />
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                className="reset-submit-btn reset-animated-field delay-3"
                type="submit"
                disabled={loading || !passwordStrength.isStrong}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" />
                    Resetting Password...
                  </span>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {!passwordStrength.isStrong && showPasswordValidation && (
                <span className="reset-submit-helper">
                  Complete all password requirements to continue.
                </span>
              )}
            </form>

            {/* Footer */}
            <div className="reset-footer-note reset-animated-field delay-4">
              <span>Remembered your password?</span>
              <button
                type="button"
                className="reset-login-link"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </div>
          </>
        )}
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




