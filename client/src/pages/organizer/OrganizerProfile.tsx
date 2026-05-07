import React, { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  BadgeCheck,
  CircleAlert,
  IdCard,
} from "lucide-react";
import "./OrganizerProfile.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getEventOrganizerProfile,
  type OrganizerProfileItem,
} from "../../api/eventApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

const OrgananizerProfile: React.FC = () => {
  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const { open, message, severity, showAlert, handleClose } = useAlert();
  const [profile, setProfile] = useState<OrganizerProfileItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "";

  const fetchProfile = async () => {
    if (!organizerId) {
      setLoading(false);
      showAlert("Organizer id was not found. Please login again.", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await getEventOrganizerProfile(organizerId);
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

  return (
    <>
      <div className="page-shell organizer-profile-page-shell">
        <div className="page-header">
          <h1 className="page-title">Organizer Profile</h1>
          <p className="page-subtitle">
            Review your event organizer account details in a consistent and professional view.
          </p>
        </div>

        <section className="surface-card organizer-profile-section-card">
          {loading ? (
            <div className="organizer-profile-state-box">
              <div className="organizer-profile-loader" />
              <h3>Loading profile...</h3>
              <p>Please wait while we fetch your organizer profile details.</p>
            </div>
          ) : !profile ? (
            <div className="organizer-profile-state-box empty">
              <div className="organizer-profile-empty-icon">
                <CircleAlert size={22} />
              </div>
              <h3>Profile not found</h3>
              <p>We could not find your organizer profile details.</p>
            </div>
          ) : (
            <>
              <div className="organizer-profile-top-card">
                <div className="organizer-profile-avatar-wrap">
                  <UserRound size={32} />
                </div>

                <div className="organizer-profile-main-info">
                  <h2>{fullName || profile.username}</h2>
                  <div className="organizer-profile-role-badge">
                    <BadgeCheck size={15} />
                    <span>Event Organizer Account</span>
                  </div>
                </div>
              </div>

              <div className="organizer-profile-grid">
                <div className="organizer-profile-detail-card">
                  <div className="organizer-profile-detail-icon">
                    <IdCard size={18} />
                  </div>
                  <div>
                    <span className="organizer-profile-detail-label">First Name</span>
                    <p className="organizer-profile-detail-value">
                      {profile.firstName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="organizer-profile-detail-card">
                  <div className="organizer-profile-detail-icon">
                    <IdCard size={18} />
                  </div>
                  <div>
                    <span className="organizer-profile-detail-label">Last Name</span>
                    <p className="organizer-profile-detail-value">
                      {profile.lastName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="organizer-profile-detail-card">
                  <div className="organizer-profile-detail-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="organizer-profile-detail-label">Email Address</span>
                    <p className="organizer-profile-detail-value">{profile.email}</p>
                  </div>
                </div>

                <div className="organizer-profile-detail-card">
                  <div className="organizer-profile-detail-icon">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <span className="organizer-profile-detail-label">Username</span>
                    <p className="organizer-profile-detail-value">{profile.username}</p>
                  </div>
                </div>

                <div className="organizer-profile-detail-card">
                  <div className="organizer-profile-detail-icon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="organizer-profile-detail-label">Phone Number</span>
                    <p className="organizer-profile-detail-value">
                      {profile.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="organizer-profile-detail-card">
                  <div className="organizer-profile-detail-icon">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <span className="organizer-profile-detail-label">Organization</span>
                    <p className="organizer-profile-detail-value">
                      {profile.organization || "Not provided"}
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
    </>
  );
};

export default OrgananizerProfile;