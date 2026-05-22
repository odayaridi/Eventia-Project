
// import React, { useMemo, useState } from "react";
// import type { ChangeEvent, FormEvent } from "react";
// import "./SignUp.css";
// import {
//   Mail,
//   Lock,
//   User,
//   Phone,
//   Building2,
//   ArrowRight,
//   UploadCloud,
//   CalendarCheck,
// } from "lucide-react";
// import { createUser } from "../../api/authApi";
// import { useNavigate } from "react-router-dom";
// import { useAlert } from "../../hooks/useAlert";
// import AlertSnackbar from "../../components/common/AlertSnackbar";

// type Role = "eventOrganizer" | "attendee" | "venueManager";

// interface BaseFormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   username: string;
//   phoneNumber: string;
// }

// interface EventOrganizerFormData extends BaseFormData {
//   organization: string;
//   commercialRegistrationDocument: File | null;
// }

// interface VenueManagerFormData extends BaseFormData {
//   venueAuthorizationDocument: File | null;
// }

// type FormState = {
//   attendee: BaseFormData;
//   eventOrganizer: EventOrganizerFormData;
//   venueManager: VenueManagerFormData;
// };

// const roleLabels: Record<Role, string> = {
//   eventOrganizer: "Event Organizer",
//   attendee: "Attendee",
//   venueManager: "Venue Manager",
// };

// const initialBaseForm: BaseFormData = {
//   firstName: "",
//   lastName: "",
//   email: "",
//   password: "",
//   username: "",
//   phoneNumber: "",
// };

// const initialFormState: FormState = {
//   attendee: { ...initialBaseForm },
//   eventOrganizer: {
//     ...initialBaseForm,
//     organization: "",
//     commercialRegistrationDocument: null,
//   },
//   venueManager: {
//     ...initialBaseForm,
//     venueAuthorizationDocument: null,
//   },
// };

// const SignUp: React.FC = () => {
//   const [selectedRole, setSelectedRole] = useState<Role>("eventOrganizer");
//   const [formState, setFormState] = useState<FormState>(initialFormState);
//   const [loading, setLoading] = useState(false);

//   const currentRoleLabel = useMemo(() => roleLabels[selectedRole], [selectedRole]);
//   const navigate = useNavigate();

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const handleRoleChange = (role: Role) => setSelectedRole(role);

//   const handleBaseInputChange = (
//     e: ChangeEvent<HTMLInputElement>,
//     role: Role
//   ) => {
//     const { name, value } = e.target;

//     setFormState((prev) => ({
//       ...prev,
//       [role]: {
//         ...prev[role],
//         [name]: value,
//       },
//     }));
//   };

//   const handleOrganizerInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     setFormState((prev) => ({
//       ...prev,
//       eventOrganizer: {
//         ...prev.eventOrganizer,
//         [name]: value,
//       },
//     }));
//   };

//   const handleFileChange = (
//     e: ChangeEvent<HTMLInputElement>,
//     role: "eventOrganizer" | "venueManager",
//     fieldName: "commercialRegistrationDocument" | "venueAuthorizationDocument"
//   ) => {
//     const file = e.target.files?.[0] || null;

//     setFormState((prev) => ({
//       ...prev,
//       [role]: {
//         ...prev[role],
//         [fieldName]: file,
//       },
//     }));
//   };

//   const resetCurrentForm = () => {
//     setFormState(initialFormState);
//     setSelectedRole("eventOrganizer");
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const data = new FormData();
//       const currentRoleData = formState[selectedRole];

//       data.append("firstName", currentRoleData.firstName);
//       data.append("lastName", currentRoleData.lastName);
//       data.append("email", currentRoleData.email);
//       data.append("username", currentRoleData.username);
//       data.append("password", currentRoleData.password);
//       data.append("phoneNumber", currentRoleData.phoneNumber);
//       data.append("role", roleLabels[selectedRole]);

//       if (selectedRole === "eventOrganizer") {
//         const organizerData = formState.eventOrganizer;

//         data.append("organization", organizerData.organization);

//         if (organizerData.commercialRegistrationDocument) {
//           data.append(
//             "commercialRegistrationDocument",
//             organizerData.commercialRegistrationDocument
//           );
//         }
//       } else if (selectedRole === "venueManager") {
//         const managerData = formState.venueManager;

//         if (managerData.venueAuthorizationDocument) {
//           data.append(
//             "venueAuthorizationDocument",
//             managerData.venueAuthorizationDocument
//           );
//         }
//       }

//       const result = await createUser(data);

//       showAlert(result?.message || "Registration successful.", "success");
//       resetCurrentForm();

//       setTimeout(() => navigate("/login"), 1200);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error
//           ? error.message
//           : "An error occurred during registration.";

//       showAlert(errorMessage, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = () => navigate("/login");

//   const renderCommonFields = (role: Role) => {
//     const currentData = formState[role];

//     return (
//       <>
//         <div className="signup-row">
//           <div className="signup-input-group">
//             <label htmlFor={`firstName-${role}`}>First Name</label>
//             <div className="signup-input-wrapper">
//               <User size={18} />
//               <input
//                 id={`firstName-${role}`}
//                 type="text"
//                 name="firstName"
//                 placeholder="John"
//                 value={currentData.firstName}
//                 onChange={(e) => handleBaseInputChange(e, role)}
//                 required
//               />
//             </div>
//           </div>

//           <div className="signup-input-group">
//             <label htmlFor={`lastName-${role}`}>Last Name</label>
//             <div className="signup-input-wrapper">
//               <User size={18} />
//               <input
//                 id={`lastName-${role}`}
//                 type="text"
//                 name="lastName"
//                 placeholder="Doe"
//                 value={currentData.lastName}
//                 onChange={(e) => handleBaseInputChange(e, role)}
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         <div className="signup-input-group">
//           <label htmlFor={`email-${role}`}>Email Address</label>
//           <div className="signup-input-wrapper">
//             <Mail size={18} />
//             <input
//               id={`email-${role}`}
//               type="email"
//               name="email"
//               placeholder="you@company.com"
//               value={currentData.email}
//               onChange={(e) => handleBaseInputChange(e, role)}
//               required
//             />
//           </div>
//         </div>

//         <div className="signup-row">
//           <div className="signup-input-group">
//             <label htmlFor={`username-${role}`}>Username</label>
//             <div className="signup-input-wrapper">
//               <User size={18} />
//               <input
//                 id={`username-${role}`}
//                 type="text"
//                 name="username"
//                 placeholder="johndoe"
//                 value={currentData.username}
//                 onChange={(e) => handleBaseInputChange(e, role)}
//                 required
//               />
//             </div>
//           </div>

//           <div className="signup-input-group">
//             <label htmlFor={`phone-${role}`}>Phone Number</label>
//             <div className="signup-input-wrapper">
//               <Phone size={18} />
//               <input
//                 id={`phone-${role}`}
//                 type="tel"
//                 name="phoneNumber"
//                 placeholder="+1 555 000 0000"
//                 value={currentData.phoneNumber}
//                 onChange={(e) => handleBaseInputChange(e, role)}
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         <div className="signup-input-group">
//           <label htmlFor={`password-${role}`}>Password</label>
//           <div className="signup-input-wrapper">
//             <Lock size={18} />
//             <input
//               id={`password-${role}`}
//               type="password"
//               name="password"
//               placeholder="At least 8 characters"
//               value={currentData.password}
//               onChange={(e) => handleBaseInputChange(e, role)}
//               required
//             />
//           </div>
//           <span className="signup-input-hint">
//             Use 8+ characters with letters, numbers & symbols.
//           </span>
//         </div>
//       </>
//     );
//   };

//   const renderRoleSpecificFields = () => {
//     if (selectedRole === "eventOrganizer") {
//       return (
//         <>
//           <div className="signup-section-divider">
//             <span>Organization Details</span>
//           </div>

//           <div className="signup-input-group">
//             <label htmlFor="organization">Organization Name</label>
//             <div className="signup-input-wrapper">
//               <Building2 size={18} />
//               <input
//                 id="organization"
//                 type="text"
//                 name="organization"
//                 placeholder="Acme Events Inc."
//                 value={formState.eventOrganizer.organization}
//                 onChange={handleOrganizerInputChange}
//                 required
//               />
//             </div>
//           </div>

//           <div className="signup-input-group">
//             <label>Commercial Registration</label>
//             <div className="signup-file-box">
//               <div className="signup-file-content">
//                 <UploadCloud size={22} />
//                 <span className="file-name">
//                   {formState.eventOrganizer.commercialRegistrationDocument
//                     ? formState.eventOrganizer.commercialRegistrationDocument.name
//                     : "Click to upload commercial document"}
//                 </span>
//                 <span className="file-hint">PDF, DOCX, or Image · Max 5MB</span>
//               </div>
//               <input
//                 type="file"
//                 accept=".pdf,.doc,.docx,image/*"
//                 onChange={(e) =>
//                   handleFileChange(
//                     e,
//                     "eventOrganizer",
//                     "commercialRegistrationDocument"
//                   )
//                 }
//                 required
//               />
//             </div>
//           </div>
//         </>
//       );
//     }

//     if (selectedRole === "venueManager") {
//       return (
//         <>
//           <div className="signup-section-divider">
//             <span>Venue Details</span>
//           </div>

//           <div className="signup-input-group">
//             <label>Venue Authorization</label>
//             <div className="signup-file-box">
//               <div className="signup-file-content">
//                 <UploadCloud size={22} />
//                 <span className="file-name">
//                   {formState.venueManager.venueAuthorizationDocument
//                     ? formState.venueManager.venueAuthorizationDocument.name
//                     : "Click to upload authorization document"}
//                 </span>
//                 <span className="file-hint">PDF, DOCX, or Image · Max 5MB</span>
//               </div>
//               <input
//                 type="file"
//                 accept=".pdf,.doc,.docx,image/*"
//                 onChange={(e) =>
//                   handleFileChange(
//                     e,
//                     "venueManager",
//                     "venueAuthorizationDocument"
//                   )
//                 }
//                 required
//               />
//             </div>
//           </div>
//         </>
//       );
//     }

//     return null;
//   };

//   return (
//     <>
//       <div className="signup-page">
//         <div className="signup-card">
//           <header className="signup-brand">
//             <div className="signup-brand-logo">
//               <CalendarCheck size={18} />
//             </div>
//             <span className="signup-brand-name">Eventia</span>
//           </header>

//           <div className="signup-form-header">
//             <h2>Create your account</h2>
//           </div>

//           <div className="signup-role-switcher" role="tablist">
//             <button
//               type="button"
//               role="tab"
//               aria-selected={selectedRole === "eventOrganizer"}
//               className={`role-btn ${
//                 selectedRole === "eventOrganizer" ? "active" : ""
//               }`}
//               onClick={() => handleRoleChange("eventOrganizer")}
//             >
//               Organizer
//             </button>

//             <button
//               type="button"
//               role="tab"
//               aria-selected={selectedRole === "attendee"}
//               className={`role-btn ${
//                 selectedRole === "attendee" ? "active" : ""
//               }`}
//               onClick={() => handleRoleChange("attendee")}
//             >
//               Attendee
//             </button>

//             <button
//               type="button"
//               role="tab"
//               aria-selected={selectedRole === "venueManager"}
//               className={`role-btn ${
//                 selectedRole === "venueManager" ? "active" : ""
//               }`}
//               onClick={() => handleRoleChange("venueManager")}
//             >
//               Venue Manager
//             </button>
//           </div>

//           <form className="signup-form" onSubmit={handleSubmit}>
//             {renderCommonFields(selectedRole)}
//             {renderRoleSpecificFields()}

//             <button
//               type="submit"
//               className="signup-submit-btn"
//               disabled={loading}
//             >
//               {loading ? (
//                 <span className="btn-loading">
//                   <span className="btn-spinner" />
//                   Processing...
//                 </span>
//               ) : (
//                 <>
//                   Create {currentRoleLabel} Account
//                   <ArrowRight size={18} />
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="signup-footer-note">
//             Already have an account?
//             <button
//               type="button"
//               className="signup-login-link"
//               onClick={handleLogin}
//             >
//               Sign in
//             </button>
//           </div>
//         </div>
//       </div>

//       <AlertSnackbar
//         open={open}
//         message={message}
//         severity={severity}
//         onClose={handleClose}
//       />
//     </>
//   );
// };

// export default SignUp;




import React, { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./SignUp.css";
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  ArrowRight,
  UploadCloud,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { createUser } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert";
import AlertSnackbar from "../../components/common/AlertSnackbar";

type Role = "eventOrganizer" | "attendee" | "venueManager";

interface BaseFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  phoneNumber: string;
}

interface EventOrganizerFormData extends BaseFormData {
  organization: string;
  commercialRegistrationDocument: File | null;
}

interface VenueManagerFormData extends BaseFormData {
  venueAuthorizationDocument: File | null;
}

type FormState = {
  attendee: BaseFormData;
  eventOrganizer: EventOrganizerFormData;
  venueManager: VenueManagerFormData;
};

const roleLabels: Record<Role, string> = {
  eventOrganizer: "Event Organizer",
  attendee: "Attendee",
  venueManager: "Venue Manager",
};

const initialBaseForm: BaseFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  username: "",
  phoneNumber: "",
};

const initialFormState: FormState = {
  attendee: { ...initialBaseForm },
  eventOrganizer: {
    ...initialBaseForm,
    organization: "",
    commercialRegistrationDocument: null,
  },
  venueManager: {
    ...initialBaseForm,
    venueAuthorizationDocument: null,
  },
};

const getPasswordChecks = (password: string) => {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  };
};

const getPasswordStrength = (password: string) => {
  const checks = getPasswordChecks(password);
  const passedCount = Object.values(checks).filter(Boolean).length;

  if (!password) {
    return {
      score: 0,
      label: "Password strength",
      className: "empty",
      isStrong: false,
      checks,
    };
  }

  if (passedCount <= 2) {
    return {
      score: 33,
      label: "Weak password",
      className: "weak",
      isStrong: false,
      checks,
    };
  }

  if (passedCount <= 4) {
    return {
      score: 66,
      label: "Medium password",
      className: "medium",
      isStrong: false,
      checks,
    };
  }

  return {
    score: 100,
    label: "Strong password",
    className: "strong",
    isStrong: true,
    checks,
  };
};

const SignUp: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>("eventOrganizer");
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouchedByRole, setPasswordTouchedByRole] = useState<
    Record<Role, boolean>
  >({
    eventOrganizer: false,
    attendee: false,
    venueManager: false,
  });

  const currentRoleLabel = useMemo(() => roleLabels[selectedRole], [selectedRole]);
  const currentPassword = formState[selectedRole].password;

  const passwordStrength = useMemo(
    () => getPasswordStrength(currentPassword),
    [currentPassword]
  );

  const shouldShowPasswordValidation =
    passwordTouchedByRole[selectedRole] || currentPassword.length > 0;

  const navigate = useNavigate();
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setShowPassword(false);
  };

  const handleBaseInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    role: Role
  ) => {
    const { name, value } = e.target;

    if (name === "password") {
      setPasswordTouchedByRole((prev) => ({
        ...prev,
        [role]: true,
      }));
    }

    setFormState((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [name]: value,
      },
    }));
  };

  const handleOrganizerInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormState((prev) => ({
      ...prev,
      eventOrganizer: {
        ...prev.eventOrganizer,
        [name]: value,
      },
    }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    role: "eventOrganizer" | "venueManager",
    fieldName: "commercialRegistrationDocument" | "venueAuthorizationDocument"
  ) => {
    const file = e.target.files?.[0] || null;

    setFormState((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [fieldName]: file,
      },
    }));
  };

  const resetCurrentForm = () => {
    setFormState(initialFormState);
    setSelectedRole("eventOrganizer");
    setShowPassword(false);
    setPasswordTouchedByRole({
      eventOrganizer: false,
      attendee: false,
      venueManager: false,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const currentRoleData = formState[selectedRole];
    const currentPasswordStrength = getPasswordStrength(currentRoleData.password);

    setPasswordTouchedByRole((prev) => ({
      ...prev,
      [selectedRole]: true,
    }));

    if (!currentPasswordStrength.isStrong) {
      showAlert(
        "Please create a stronger password before registering.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      data.append("firstName", currentRoleData.firstName);
      data.append("lastName", currentRoleData.lastName);
      data.append("email", currentRoleData.email);
      data.append("username", currentRoleData.username);
      data.append("password", currentRoleData.password);
      data.append("phoneNumber", currentRoleData.phoneNumber);
      data.append("role", roleLabels[selectedRole]);

      if (selectedRole === "eventOrganizer") {
        const organizerData = formState.eventOrganizer;

        data.append("organization", organizerData.organization);

        if (organizerData.commercialRegistrationDocument) {
          data.append(
            "commercialRegistrationDocument",
            organizerData.commercialRegistrationDocument
          );
        }
      } else if (selectedRole === "venueManager") {
        const managerData = formState.venueManager;

        if (managerData.venueAuthorizationDocument) {
          data.append(
            "venueAuthorizationDocument",
            managerData.venueAuthorizationDocument
          );
        }
      }

      const result = await createUser(data);

      showAlert(result?.message || "Registration successful.", "success");
      resetCurrentForm();

      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during registration.";

      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => navigate("/login");

  const renderPasswordRequirement = (passed: boolean, text: string) => {
    return (
      <li className={passed ? "valid" : "invalid"}>
        {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
        <span>{text}</span>
      </li>
    );
  };

  const renderCommonFields = (role: Role) => {
    const currentData = formState[role];
    const rolePasswordStrength = getPasswordStrength(currentData.password);
    const showPasswordValidation =
      passwordTouchedByRole[role] || currentData.password.length > 0;

    return (
      <>
        <div className="signup-row">
          <div className="signup-input-group">
            <label htmlFor={`firstName-${role}`}>First Name</label>
            <div className="signup-input-wrapper">
              <User size={18} />
              <input
                id={`firstName-${role}`}
                type="text"
                name="firstName"
                placeholder="John"
                value={currentData.firstName}
                onChange={(e) => handleBaseInputChange(e, role)}
                required
              />
            </div>
          </div>

          <div className="signup-input-group">
            <label htmlFor={`lastName-${role}`}>Last Name</label>
            <div className="signup-input-wrapper">
              <User size={18} />
              <input
                id={`lastName-${role}`}
                type="text"
                name="lastName"
                placeholder="Doe"
                value={currentData.lastName}
                onChange={(e) => handleBaseInputChange(e, role)}
                required
              />
            </div>
          </div>
        </div>

        <div className="signup-input-group">
          <label htmlFor={`email-${role}`}>Email Address</label>
          <div className="signup-input-wrapper">
            <Mail size={18} />
            <input
              id={`email-${role}`}
              type="email"
              name="email"
              placeholder="you@company.com"
              value={currentData.email}
              onChange={(e) => handleBaseInputChange(e, role)}
              required
            />
          </div>
        </div>

        <div className="signup-row">
          <div className="signup-input-group">
            <label htmlFor={`username-${role}`}>Username</label>
            <div className="signup-input-wrapper">
              <User size={18} />
              <input
                id={`username-${role}`}
                type="text"
                name="username"
                placeholder="johndoe"
                value={currentData.username}
                onChange={(e) => handleBaseInputChange(e, role)}
                required
              />
            </div>
          </div>

          <div className="signup-input-group">
            <label htmlFor={`phone-${role}`}>Phone Number</label>
            <div className="signup-input-wrapper">
              <Phone size={18} />
              <input
                id={`phone-${role}`}
                type="tel"
                name="phoneNumber"
                placeholder="+961 70 000 000"
                value={currentData.phoneNumber}
                onChange={(e) => handleBaseInputChange(e, role)}
                required
              />
            </div>
          </div>
        </div>

        <div className="signup-input-group">
          <div className="signup-label-row">
            <label htmlFor={`password-${role}`}>Password</label>

            {showPasswordValidation && (
              <span
                className={`password-strength-label ${rolePasswordStrength.className}`}
              >
                {rolePasswordStrength.label}
              </span>
            )}
          </div>

          <div
            className={`signup-input-wrapper ${
              showPasswordValidation && !rolePasswordStrength.isStrong
                ? "input-error"
                : ""
            } ${
              showPasswordValidation && rolePasswordStrength.isStrong
                ? "input-success"
                : ""
            }`}
          >
            <Lock size={18} />
            <input
              id={`password-${role}`}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a strong password"
              value={currentData.password}
              onChange={(e) => handleBaseInputChange(e, role)}
              required
              minLength={8}
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

          <div
            className={`password-strength-meter ${
              showPasswordValidation ? "visible" : ""
            }`}
          >
            <div className="password-strength-track">
              <span
                className={`password-strength-fill ${rolePasswordStrength.className}`}
                style={{ width: `${rolePasswordStrength.score}%` }}
              />
            </div>
          </div>

          {showPasswordValidation && (
            <div className="password-rules-box">
              <p>Enterprise password requirements:</p>

              <ul>
                {renderPasswordRequirement(
                  rolePasswordStrength.checks.minLength,
                  "At least 8 characters"
                )}
                {renderPasswordRequirement(
                  rolePasswordStrength.checks.uppercase,
                  "At least one uppercase letter"
                )}
                {renderPasswordRequirement(
                  rolePasswordStrength.checks.lowercase,
                  "At least one lowercase letter"
                )}
                {renderPasswordRequirement(
                  rolePasswordStrength.checks.number,
                  "At least one number"
                )}
                {renderPasswordRequirement(
                  rolePasswordStrength.checks.specialChar,
                  "At least one symbol"
                )}
              </ul>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderRoleSpecificFields = () => {
    if (selectedRole === "eventOrganizer") {
      return (
        <>
          <div className="signup-section-divider">
            <span>Organization Details</span>
          </div>

          <div className="signup-input-group">
            <label htmlFor="organization">Organization Name</label>
            <div className="signup-input-wrapper">
              <Building2 size={18} />
              <input
                id="organization"
                type="text"
                name="organization"
                placeholder="Acme Events Inc."
                value={formState.eventOrganizer.organization}
                onChange={handleOrganizerInputChange}
                required
              />
            </div>
          </div>

          <div className="signup-input-group">
            <label>Commercial Registration</label>
            <div className="signup-file-box">
              <div className="signup-file-content">
                <UploadCloud size={22} />
                <span className="file-name">
                  {formState.eventOrganizer.commercialRegistrationDocument
                    ? formState.eventOrganizer.commercialRegistrationDocument.name
                    : "Click to upload commercial document"}
                </span>
                <span className="file-hint">PDF, DOCX, or Image · Max 5MB</span>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={(e) =>
                  handleFileChange(
                    e,
                    "eventOrganizer",
                    "commercialRegistrationDocument"
                  )
                }
                required
              />
            </div>
          </div>
        </>
      );
    }

    if (selectedRole === "venueManager") {
      return (
        <>
          <div className="signup-section-divider">
            <span>Venue Details</span>
          </div>

          <div className="signup-input-group">
            <label>Venue Authorization</label>
            <div className="signup-file-box">
              <div className="signup-file-content">
                <UploadCloud size={22} />
                <span className="file-name">
                  {formState.venueManager.venueAuthorizationDocument
                    ? formState.venueManager.venueAuthorizationDocument.name
                    : "Click to upload authorization document"}
                </span>
                <span className="file-hint">PDF, DOCX, or Image · Max 5MB</span>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={(e) =>
                  handleFileChange(
                    e,
                    "venueManager",
                    "venueAuthorizationDocument"
                  )
                }
                required
              />
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <div className="signup-page">
        <div className="signup-card">
          <header className="signup-brand">
            <div className="signup-brand-logo">
              <CalendarCheck size={18} />
            </div>
            <span className="signup-brand-name">Eventia</span>
          </header>

          <div className="signup-form-header">
            <h2>Create your account</h2>
          </div>

          <div
            className={`signup-role-switcher active-${selectedRole}`}
            role="tablist"
          >
            <span className="role-slider" />

            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === "eventOrganizer"}
              className={`role-btn ${
                selectedRole === "eventOrganizer" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("eventOrganizer")}
            >
              Organizer
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === "attendee"}
              className={`role-btn ${
                selectedRole === "attendee" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("attendee")}
            >
              Attendee
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === "venueManager"}
              className={`role-btn ${
                selectedRole === "venueManager" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("venueManager")}
            >
              Venue Manager
            </button>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div key={selectedRole} className="signup-role-content">
              {renderCommonFields(selectedRole)}
              {renderRoleSpecificFields()}
            </div>

            <button
              type="submit"
              className="signup-submit-btn"
              disabled={loading || !passwordStrength.isStrong}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" />
                  Processing...
                </span>
              ) : (
                <>
                  Create {currentRoleLabel} Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {!passwordStrength.isStrong && shouldShowPasswordValidation && (
              <span className="signup-submit-helper">
                Complete all password requirements to continue.
              </span>
            )}
          </form>

          <div className="signup-footer-note">
            Already have an account?
            <button
              type="button"
              className="signup-login-link"
              onClick={handleLogin}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </>
  );
};

export default SignUp;
















