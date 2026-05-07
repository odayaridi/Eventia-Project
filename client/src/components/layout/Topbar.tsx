// import React, { useMemo, useState } from "react";
// import { Bell, User, ChevronDown, Settings } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "./Topbar.css";
// import { useAuth } from "../../context/AuthContext";

// const roleLabelMap: Record<string, string> = {
//   admin: "Admin",
//   eventOrganizer: "Event Organizer",
//   venueManager: "Venue Owner",
//   attendee: "Attendee",
// };

// const profilePathMap: Record<string, string> = {
//   admin: "/admin/profile",
//   eventOrganizer: "/organizer/profile",
//   venueManager: "/venue/profile",
//   attendee: "/attendee/profile",
// };

// const Topbar: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [showDropdown, setShowDropdown] = useState(false);

//   const firstName = useMemo(() => {
//     const raw = user?.username?.trim();
//     if (!raw) return "User";
//     return raw.split(" ")[0];
//   }, [user?.username]);

//   const roleLabel = user?.role ? roleLabelMap[user.role] || user.role : "Guest";

//   const goToProfile = () => {
//     if (!user?.role) return;
//     const profilePath = profilePathMap[user.role];
//     if (profilePath) {
//       navigate(profilePath);
//       setShowDropdown(false);
//     }
//   };

//   return (
//     <header className="eventia-topbar">
//       <div className="topbar-welcome">
//         <h1>
//           Welcome back, <span>{firstName}</span>
//         </h1>
//         <p>Here&apos;s what&apos;s happening with your account today.</p>
//       </div>

//       <div className="topbar-right">
//         {/* <button className="notif-btn" type="button" aria-label="Notifications">
//           <Bell size={19} />
//           <span className="notif-badge">3</span>
//         </button> */}

//         <div className="profile-menu-wrapper">
//           <button
//             className="user-profile"
//             type="button"
//             onClick={() => setShowDropdown((prev) => !prev)}
//           >
//             <div className="avatar">
//               <User size={18} color="white" />
//             </div>

//             <div className="user-text">
//               <span className="user-name">{user?.username || "User"}</span>
//               <span className="user-role">{roleLabel}</span>
//             </div>

//             <ChevronDown
//               size={15}
//               className={`profile-chevron ${showDropdown ? "open" : ""}`}
//             />
//           </button>

//           {showDropdown && (
//             <div className="profile-dropdown">
//               <button className="dropdown-item" type="button" onClick={goToProfile}>
//                 <Settings size={14} />
//                 <span>Profile Settings</span>
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Topbar;




import React, { useMemo, useState } from "react";
import { User, ChevronDown, Settings, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";
import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

const roleLabelMap: Record<string, string> = {
  admin: "Admin",
  eventOrganizer: "Event Organizer",
  venueManager: "Venue Owner",
  attendee: "Attendee",
};

const profilePathMap: Record<string, string> = {
  admin: "/admin/profile",
  eventOrganizer: "/organizer/profile",
  venueManager: "/venue/profile",
  attendee: "/attendee/profile",
};

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const firstName = useMemo(() => {
    const raw = user?.username?.trim();
    if (!raw) return "User";
    return raw.split(" ")[0];
  }, [user?.username]);

  const roleLabel = user?.role ? roleLabelMap[user.role] || user.role : "Guest";

  const goToProfile = () => {
    if (!user?.role) return;

    const profilePath = profilePathMap[user.role];

    if (profilePath) {
      navigate(profilePath);
      setShowDropdown(false);
    }
  };

  return (
    <header className="eventia-topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-welcome">
          <h1>
            Welcome back, <span>{firstName}</span>
          </h1>
          <p>Here&apos;s what&apos;s happening with your account today.</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="profile-menu-wrapper">
          <button
            className="user-profile"
            type="button"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <div className="avatar">
              <User size={18} color="white" />
            </div>

            <div className="user-text">
              <span className="user-name">{user?.username || "User"}</span>
              <span className="user-role">{roleLabel}</span>
            </div>

            <ChevronDown
              size={15}
              className={`profile-chevron ${showDropdown ? "open" : ""}`}
            />
          </button>

           {showDropdown && (
            <div className="profile-dropdown">
              <button className="dropdown-item" type="button" onClick={goToProfile}>
                <Settings size={14} />
                <span>Profile Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;