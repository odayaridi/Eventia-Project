import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./Login.css";
import {
  Lock,
  ArrowRight,
  User,
  CalendarCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

interface LoginFormData {
  username: string;
  password: string;
}

const initialFormData: LoginFormData = {
  username: "",
  password: "",
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser({
        username: formData.username.trim(),
        password: formData.password,
      });

      login(response);
      showAlert("Login successful!", "success");

      setTimeout(() => {
        if (response.user.role === "admin") navigate("/admin");
        else if (response.user.role === "eventOrganizer") navigate("/organizer");
        else if (response.user.role === "venueManager") navigate("/venue");
        else if (response.user.role === "attendee") navigate("/attendee");
        else navigate("/home");
      }, 900);
    } catch (error: any) {
      showAlert(error.message || "Login failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-brand">
          <div className="login-brand-logo">
            <CalendarCheck size={18} />
          </div>
          <span className="login-brand-name">Eventia</span>
        </header>

        <div className="login-form-header">
          <h2>Welcome back</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group login-animated-field delay-1">
            <label htmlFor="login-username">Username</label>
            <div className="login-input-wrapper">
              <User size={18} />
              <input
                id="login-username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-input-group login-animated-field delay-2">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrapper">
              <Lock size={18} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn login-animated-field delay-3"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                Signing in...
              </span>
            ) : (
              <>
                Log In
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <a
            href="/forget-password"
            className="login-forgot-link-below login-animated-field delay-4"
          >
            Forgot password?
          </a>
        </form>

        <div className="login-footer-note">
          <span>Don't have an account?</span>
          <button
            onClick={handleSignUp}
            type="button"
            className="login-signup-link"
          >
            Sign up
          </button>
        </div>
      </div>

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </div>
  );
};

export default Login;