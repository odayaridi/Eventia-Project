// import React, { useState } from "react";
// import type { ChangeEvent, FormEvent } from "react";
// import "./Login.css";
// import {
//   CalendarDays,
//   Lock,
//   ArrowRight,
//   CheckCircle2,
//   User,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { loginUser } from "../../api/authApi";
// import { useAuth } from "../../context/AuthContext";
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";

// interface LoginFormData {
//   username: string;
//   password: string;
// }

// const initialFormData: LoginFormData = {
//   username: "",
//   password: "",
// };

// const Login: React.FC = () => {
//   const [formData, setFormData] = useState<LoginFormData>(initialFormData);

//   const navigate = useNavigate();
//   const { login } = useAuth();


// const { open, message, severity, showAlert, handleClose } = useAlert();

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     try {
//       const response = await loginUser({
//         username: formData.username,
//         password: formData.password,
//       });

//       login(response);

//       showAlert("Login successful!", "success");

//       setTimeout(() => {
//         if (response.user.role === "admin") navigate("/admin");
//         else if (response.user.role === "eventOrganizer") navigate("/organizer");
//         else if (response.user.role === "venueManager") navigate("/venue");
//         else if (response.user.role === "attendee") navigate("/attendee");
//         else navigate("/home");
//       }, 1000);
//     } catch (error: any) {
//       showAlert(error.message, "error");
//     }
//   };

//   const handleSignUp = () => {
//     navigate("/signup");
//   };

//   return (
//     <div className="login-page">
//       <div className="login-shell">
//         <section className="login-brand-panel">
//           <div className="login-brand-content">
//             <div className="login-logo-container">
//               <div className="login-logo-box">
//                 <CalendarDays size={28} />
//               </div>
//               <span className="login-logo-text">Eventia</span>
//             </div>

//             <h1>Secure access to your event operations.</h1>
//             <p className="login-brand-subtitle">
//               Sign in to manage events, venues, analytics, and attendee
//               experiences through a trusted enterprise-grade platform.
//             </p>

//             <div className="login-brand-points">
//               <div className="brand-point">
//                 <CheckCircle2 size={20} className="brand-icon" />
//                 <span>Protected authentication workflow</span>
//               </div>
//               <div className="brand-point">
//                 <CheckCircle2 size={20} className="brand-icon" />
//                 <span>Centralized event and venue management</span>
//               </div>
//               <div className="brand-point">
//                 <CheckCircle2 size={20} className="brand-icon" />
//                 <span>Fast access to dashboards and operations</span>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="login-form-panel">
//           <div className="login-form-container">
//             <div className="login-form-header">
//               <h2>Welcome back</h2>
//               <p>Log in to continue to your account.</p>
//             </div>

//             <form className="login-form" onSubmit={handleSubmit}>
//               <div className="login-input-group">
//                 <label htmlFor="login-username">Username</label>
//                 <div className="login-input-wrapper">
//                   <User size={18} />
//                   <input
//                     id="login-username"
//                     type="text"
//                     name="username"
//                     placeholder="Enter your username"
//                     value={formData.username}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="login-input-group">
//                 <label htmlFor="login-password">Password</label>
//                 <div className="login-input-wrapper">
//                   <Lock size={18} />
//                   <input
//                     id="login-password"
//                     type="password"
//                     name="password"
//                     placeholder="Enter your password"
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <button type="submit" className="login-submit-btn">
//                 Log In
//                 <ArrowRight size={18} />
//               </button>
//             </form>

//             <div className="login-footer-note">
//               <span>Don’t have an account?</span>
//               <button
//                 onClick={handleSignUp}
//                 type="button"
//                 className="login-signup-link"
//               >
//                 Sign up
//               </button>
//             </div>
//           </div>
//         </section>
//       </div>

//   <AlertSnackbar
//   open={open}
//   message={message}
//   severity={severity}
//   onClose={handleClose}
// />
//     </div>
//   );
// };

// export default Login;



import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./Login.css";
import {
  Lock,
  ArrowRight,
  User,
  CalendarCheck,
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
        username: formData.username,
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
      }, 1000);
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
          <div className="login-input-group">
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
              />
            </div>
          </div>

  <div className="login-input-group">
  <label htmlFor="login-password">Password</label>


            <div className="login-input-wrapper">
              <Lock size={18} />
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
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
                   
          <a href="/forget-password" className="login-forgot-link-below">
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