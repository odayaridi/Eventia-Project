import React, { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  BadgeCheck,
  PencilLine,
  X,
  Save,
  CircleAlert,
  IdCard,
} from "lucide-react";
import "./AttendeeProfile.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getAttendeeProfile,
  editAttendeeProfile,
  type AttendeeProfileItem,
} from "../../api/attendeeApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

const AttendeeProfile: React.FC = () => {
  const attendeeId = useMemo(() => {
    const raw = localStorage.getItem("attendeeId");
    return raw ? Number(raw) : null;
  }, []);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [profile, setProfile] = useState<AttendeeProfileItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "";

  const fetchProfile = async () => {
    if (!attendeeId) {
      setLoading(false);
      showAlert("Attendee id was not found. Please login again.", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await getAttendeeProfile(attendeeId);
      setProfile(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load profile.";
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditModal = () => {
    if (!profile) return;

    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setEmail(profile.email || "");
    setUsername(profile.username || "");
    setPhoneNumber(profile.phoneNumber || "");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (isSubmitting) return;
    setIsEditOpen(false);
  };

  const handleSave = async () => {
    if (!attendeeId) {
      showAlert("Attendee id was not found. Please login again.", "error");
      return;
    }

    if (!firstName.trim()) {
      showAlert("First name is required.", "warning");
      return;
    }

    if (!lastName.trim()) {
      showAlert("Last name is required.", "warning");
      return;
    }

    if (!email.trim()) {
      showAlert("Email is required.", "warning");
      return;
    }

    if (!username.trim()) {
      showAlert("Username is required.", "warning");
      return;
    }

    if (!phoneNumber.trim()) {
      showAlert("Phone number is required.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);

      const updated = await editAttendeeProfile({
        attendeeId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      setProfile(updated);
      showAlert("Profile updated successfully.", "success");
      closeEditModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile.";
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-shell attendee-profile-page-shell">
        <div className="attendee-profile-header-row">
          <div className="page-header">
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">
              View and manage your attendee account details in a clean and professional layout.
            </p>
          </div>

          {!loading && profile && (
            <button
              type="button"
              className="attendee-profile-edit-btn"
              onClick={openEditModal}
            >
              <PencilLine size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <section className="surface-card attendee-profile-section-card">
          {loading ? (
            <div className="attendee-profile-state-box">
              <div className="attendee-profile-loader" />
              <h3>Loading profile...</h3>
              <p>Please wait while we fetch your attendee profile details.</p>
            </div>
          ) : !profile ? (
            <div className="attendee-profile-state-box empty">
              <div className="attendee-profile-empty-icon">
                <CircleAlert size={22} />
              </div>
              <h3>Profile not found</h3>
              <p>We could not find your attendee profile details.</p>
            </div>
          ) : (
            <>
              <div className="attendee-profile-top-card">
                <div className="attendee-profile-avatar-wrap">
                  <UserRound size={32} />
                </div>

                <div className="attendee-profile-main-info">
                  <h2>{fullName || profile.username}</h2>
                  <div className="attendee-profile-role-badge">
                    <BadgeCheck size={15} />
                    <span>Attendee Account</span>
                  </div>
                </div>
              </div>

              <div className="attendee-profile-grid">
                <div className="attendee-profile-detail-card">
                  <div className="attendee-profile-detail-icon">
                    <IdCard size={18} />
                  </div>
                  <div>
                    <span className="attendee-profile-detail-label">First Name</span>
                    <p className="attendee-profile-detail-value">
                      {profile.firstName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="attendee-profile-detail-card">
                  <div className="attendee-profile-detail-icon">
                    <IdCard size={18} />
                  </div>
                  <div>
                    <span className="attendee-profile-detail-label">Last Name</span>
                    <p className="attendee-profile-detail-value">
                      {profile.lastName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="attendee-profile-detail-card">
                  <div className="attendee-profile-detail-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="attendee-profile-detail-label">Email Address</span>
                    <p className="attendee-profile-detail-value">{profile.email}</p>
                  </div>
                </div>

                <div className="attendee-profile-detail-card">
                  <div className="attendee-profile-detail-icon">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <span className="attendee-profile-detail-label">Username</span>
                    <p className="attendee-profile-detail-value">{profile.username}</p>
                  </div>
                </div>

                <div className="attendee-profile-detail-card attendee-profile-detail-card-full">
                  <div className="attendee-profile-detail-icon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="attendee-profile-detail-label">Phone Number</span>
                    <p className="attendee-profile-detail-value">
                      {profile.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <AlertSnackbar
          open={open}
          message={message}
          severity={severity}
          onClose={handleClose}
        />
      </div>

      {isEditOpen && (
        <div className="attendee-profile-modal-overlay" onClick={closeEditModal}>
          <div
            className="attendee-profile-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="attendee-profile-modal-header">
              <div>
                <h3 className="attendee-profile-modal-title">Edit Profile</h3>
                <p className="attendee-profile-modal-subtitle">
                  Update your attendee profile details below.
                </p>
              </div>

              <button
                type="button"
                className="attendee-profile-close-btn"
                onClick={closeEditModal}
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="attendee-profile-form-row">
              <div className="attendee-profile-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="attendee-profile-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="attendee-profile-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="attendee-profile-form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="attendee-profile-form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="button"
              className="attendee-profile-save-btn"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              <Save size={16} />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendeeProfile;