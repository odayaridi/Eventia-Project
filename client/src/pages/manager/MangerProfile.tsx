import React, { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  BadgeCheck,
  CircleAlert,
  IdCard,
} from "lucide-react";
import "./ManagerProfile.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getVenueManagerProfile,
  type ManagerProfileItem,
} from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

const ManagerProfile: React.FC = () => {
  const managerId = useMemo(() => {
    const raw = localStorage.getItem("managerId");
    return raw ? Number(raw) : null;
  }, []);

  const { open, message, severity, showAlert, handleClose } = useAlert();
  const [profile, setProfile] = useState<ManagerProfileItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "";

  const fetchProfile = async () => {
    if (!managerId) {
      setLoading(false);
      showAlert("Manager id was not found. Please login again.", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await getVenueManagerProfile(managerId);
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
      <div className="page-shell manager-profile-page-shell">
        <div className="page-header">
          <h1 className="page-title">Manager Profile</h1>
          <p className="page-subtitle">
            Review your venue manager account details in a clear and enterprise-grade layout.
          </p>
        </div>

        <section className="surface-card manager-profile-section-card">
          {loading ? (
            <div className="manager-profile-state-box">
              <div className="manager-profile-loader" />
              <h3>Loading profile...</h3>
              <p>Please wait while we fetch your manager profile details.</p>
            </div>
          ) : !profile ? (
            <div className="manager-profile-state-box empty">
              <div className="manager-profile-empty-icon">
                <CircleAlert size={22} />
              </div>
              <h3>Profile not found</h3>
              <p>We could not find your venue manager profile details.</p>
            </div>
          ) : (
            <>
              <div className="manager-profile-top-card">
                <div className="manager-profile-avatar-wrap">
                  <UserRound size={32} />
                </div>

                <div className="manager-profile-main-info">
                  <h2>{fullName || profile.username}</h2>
                  <div className="manager-profile-role-badge">
                    <BadgeCheck size={15} />
                    <span>Venue Manager Account</span>
                  </div>
                </div>
              </div>

              <div className="manager-profile-grid">
                <div className="manager-profile-detail-card">
                  <div className="manager-profile-detail-icon">
                    <IdCard size={18} />
                  </div>
                  <div>
                    <span className="manager-profile-detail-label">First Name</span>
                    <p className="manager-profile-detail-value">
                      {profile.firstName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="manager-profile-detail-card">
                  <div className="manager-profile-detail-icon">
                    <IdCard size={18} />
                  </div>
                  <div>
                    <span className="manager-profile-detail-label">Last Name</span>
                    <p className="manager-profile-detail-value">
                      {profile.lastName || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="manager-profile-detail-card">
                  <div className="manager-profile-detail-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="manager-profile-detail-label">Email Address</span>
                    <p className="manager-profile-detail-value">{profile.email}</p>
                  </div>
                </div>

                <div className="manager-profile-detail-card">
                  <div className="manager-profile-detail-icon">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <span className="manager-profile-detail-label">Username</span>
                    <p className="manager-profile-detail-value">{profile.username}</p>
                  </div>
                </div>

                <div className="manager-profile-detail-card manager-profile-detail-card-full">
                  <div className="manager-profile-detail-icon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="manager-profile-detail-label">Phone Number</span>
                    <p className="manager-profile-detail-value">
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
    </>
  );
};

export default ManagerProfile;