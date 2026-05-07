







// import React, { useEffect, useRef, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Users,
//   MapPin,
//   Calendar,
//   Settings,
//   LogOut,
//   Ticket,
//   MessageSquare,
//   BarChart3,
//   Bell,
//   Sparkles,
//   Plus,
//   Package,
//   Star,
//   ShoppingCart,
//   User,
//   ClipboardList,
//   LifeBuoy,
//   MessageCircle,
//   HelpCircle,
// } from "lucide-react";
// import { CalendarCheck } from "lucide-react";
// import { io, Socket } from "socket.io-client";

// import "./Sidebar.css";
// import { useAuth } from "../../context/AuthContext";

// type MenuItem = {
//   icon: React.ComponentType<{ size?: number }>;
//   label: string;
//   path: string;
//   badge?: boolean; // marks items that can show a live badge
// };

// const menuConfig: Record<string, MenuItem[]> = {
//   admin: [
//     { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
//       { icon: User, label: "Pending Approvals", path: "/admin/pending-approvals", badge: true },
//     { icon: Users, label: "Manage Attendees", path: "/admin/attendees" },
//     { icon: MapPin, label: "Manage Venues Managers", path: "/admin/venue-managers" },
//     { icon: Calendar, label: "Manage Event Organizers", path: "/admin/event-organizers" },
//     { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
//      { icon: MessageSquare, label: "Contact Requests", path: "/admin/contact-requests" },
//     { icon: Settings, label: "Platform Settings", path: "/admin/platform-settings" },
//   ],

//   eventOrganizer: [
//     { icon: LayoutDashboard, label: "Dashboard", path: "/organizer/dashboard" },
//     { icon: Calendar, label: "My Events", path: "/organizer/events" },
//     { icon: Ticket, label: "Event Tickets", path: "/organizer/event-tickets" },
//     { icon: Package, label: "Venue Requests", path: "/organizer/venue-requests" },
//     { icon: MapPin, label: "Browse Venues", path: "/organizer/browse-venues" },
//     { icon: Bell, label: "My Announcements", path: "/organizer/my-announcements" },
//     { icon: BarChart3, label: "Analytics", path: "/organizer/analytics" },
//     { icon: ClipboardList, label: "Attendance", path: "/organizer/attendance" },
//     { icon: HelpCircle, label: "Contact Support", path: "/organizer/support" },
//     { icon: Star, label: "Feedbacks", path: "/organizer/feedbacks" },
//       { icon: MessageSquare, label: "AI Assistant", path: "/organizer/chatbot" },
//        { icon: User, label: "My Profile", path: "/organizer/profile" },
//          { icon: MessageCircle, label: "Chat room", path: "/organizer/chat-room" },
//   ],

//   venueManager: [
//     { icon: LayoutDashboard, label: "Dashboard", path: "/venue/dashboard" },
//     { icon: MapPin, label: "My Venue", path: "/venue/my-venue" },
//     { icon: Calendar, label: "Availability", path: "/venue/availability" },
//     { icon: Package, label: "Event Requests", path: "/venue/event-requests" },
//      { icon: User, label: "My Profile", path: "/venue/profile" },
//     { icon: HelpCircle, label: "Contact Support", path: "/venue/support" },
//     { icon: BarChart3, label: "Reports", path: "/venue/reports" },
//      { icon: MessageSquare, label: "AI Assistant", path: "/venue/chatbot" },
//         { icon: MessageCircle, label: "Message Organizers", path: "/venue/message-organizers" },
//   ],

//   attendee: [
//     { icon: LayoutDashboard, label: "Dashboard", path: "/attendee/dashboard" },
//     { icon: Calendar, label: "Browse Events", path: "/attendee/browse" },
//     { icon: Package, label: "My Bookings", path: "/attendee/bookings" },
//     { icon: Ticket, label: "My Tickets", path: "/attendee/tickets" },
//     // badge: true marks this item as receiving live notification count
//     { icon: Bell, label: "Announcements", path: "/attendee/announcements", badge: true },
//      { icon: User, label: "My Profile", path: "/attendee/profile" },
//     { icon: Star, label: "My Feedbacks", path: "/attendee/myfeedbacks" },
//     { icon: HelpCircle, label: "Contact Support", path: "/attendee/support" },
//     { icon: MessageSquare, label: "AI Assistant", path: "/attendee/chatbot" },
//   ],
// };

// const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:3010";

// const Sidebar: React.FC = () => {
//   const location = useLocation();
//   const { user, logout } = useAuth();

//   // Unread announcement count for attendees
//   const [unreadCount, setUnreadCount] = useState(0);
//   const socketRef = useRef<Socket | null>(null);

//   useEffect(() => {
//     if (!user || user.role !== "attendee") return;

//     const attendeeId = localStorage.getItem("attendeeId");
//     if (!attendeeId) return;

//     // Connect socket with attendeeId so server can find this socket
//     const socket = io(SOCKET_URL, {
//       query: { attendeeId },
//       transports: ["websocket"],
//     });

//     socketRef.current = socket;

//     socket.on("newAnnouncement", () => {
//       // Only increment if not already on the announcements page
//       setUnreadCount((prev) => prev + 1);
//     });

//     return () => {
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [user]);

//   // Clear badge when user navigates to announcements page
//   useEffect(() => {
//     if (location.pathname === "/attendee/announcements") {
//       setUnreadCount(0);
//     }
//   }, [location.pathname]);

//   if (!user) return null;

//   const role = user.role;
//   const items = menuConfig[role] || [];

//   return (
//     <aside className="eventia-sidebar">
//       <div className="sidebar-brand">
//         {/* <div className="brand-icon">
//           <Sparkles size={20} fill="white" />
//         </div> */}

// <div className="brand-icon">
//   <CalendarCheck size={20} />
// </div>
//         <span className="brand-text">Eventia</span>
//       </div>

//       <nav className="sidebar-nav">
//         {items.map((item) => {
//           const Icon = item.icon;
//           // const active = location.pathname === item.path;
//           const active = location.pathname.startsWith(item.path + "/") || location.pathname === item.path;
//           const showBadge = item.badge && unreadCount > 0;

//           return (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`nav-link ${active ? "active" : ""}`}
//             >
//               <span className="nav-link-icon-wrap">
//                 <Icon size={18} />
//                 {showBadge && (
//                   <span className="nav-badge">
//                     {unreadCount > 99 ? "99+" : unreadCount}
//                   </span>
//                 )}
//               </span>
//               <span>{item.label}</span>
//             </Link>
//           );
//         })}
//       </nav>

//       <div className="sidebar-footer">
//         <button className="logout-btn" onClick={logout} type="button">
//           <LogOut size={18} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;




// import React, { useEffect, useRef, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Users,
//   MapPin,
//   Calendar,
//   Settings,
//   LogOut,
//   Ticket,
//   MessageSquare,
//   BarChart3,
//   Bell,
//   Package,
//   Star,
//   User,
//   ClipboardList,
//   MessageCircle,
//   HelpCircle,
// } from "lucide-react";
// import { CalendarCheck } from "lucide-react";
// import { io, Socket } from "socket.io-client";

// import "./Sidebar.css";
// import { useAuth } from "../../context/AuthContext";
// import { getOrganizerUnreadSummary } from "../../api/eventApi";
// import { getManagerUnreadSummary } from "../../api/venueApi";

// type MenuItem = {
//   icon: React.ComponentType<{ size?: number }>;
//   label: string;
//   path: string;
//   badge?: boolean;
//   chatBadge?: boolean;
// };

// const menuConfig: Record<string, MenuItem[]> = {
//   admin: [
//     { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
//     { icon: User, label: "Pending Approvals", path: "/admin/pending-approvals", badge: true },
//     { icon: Users, label: "Manage Attendees", path: "/admin/attendees" },
//     { icon: MapPin, label: "Manage Venue Owners", path: "/admin/venue-managers" },
//     { icon: Calendar, label: "Manage Organizers", path: "/admin/event-organizers" },
//     // { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
//     { icon: MessageSquare, label: "Contact Requests", path: "/admin/contact-requests" },
//     { icon: Settings, label: "Platform Settings", path: "/admin/platform-settings" },
//   ],

//   eventOrganizer: [
//     { icon: LayoutDashboard, label: "Dashboard", path: "/organizer/dashboard" },
//         { icon: BarChart3, label: "Analytics", path: "/organizer/analytics" },
//     { icon: Calendar, label: "My Events", path: "/organizer/events" },
//         { icon: MapPin, label: "Browse Venues", path: "/organizer/browse-venues" },
//             { icon: Package, label: "Venue Requests", path: "/organizer/venue-requests" },
//                 { icon: MessageCircle, label: "Chat room", path: "/organizer/chat-room", chatBadge: true },
//     { icon: Ticket, label: "Event Tickets", path: "/organizer/event-tickets" },
//     { icon: Bell, label: "My Announcements", path: "/organizer/my-announcements" },
//     // { icon: ClipboardList, label: "Attendance", path: "/organizer/attendance" },
//     { icon: Star, label: "Feedbacks", path: "/organizer/feedbacks" },
//      { icon: HelpCircle, label: "Contact Support", path: "/organizer/support" },
//     { icon: MessageSquare, label: "AI Assistant", path: "/organizer/chatbot" },
//     { icon: User, label: "My Profile", path: "/organizer/profile" },

//   ],

//   venueManager: [
//     { icon: LayoutDashboard, label: "Dashboard", path: "/venue/dashboard" },
//     { icon: MapPin, label: "My Venue", path: "/venue/my-venue" },
//     { icon: Calendar, label: "Availability", path: "/venue/availability" },
//     { icon: Package, label: "Event Requests", path: "/venue/event-requests" },
//     { icon: MessageCircle, label: "Message Organizers", path: "/venue/message-organizers", chatBadge: true },
//     { icon: HelpCircle, label: "Contact Support", path: "/venue/support" },
//         { icon: MessageSquare, label: "AI Assistant", path: "/venue/chatbot" },
//           { icon: User, label: "My Profile", path: "/venue/profile" },
//   ],

//   attendee: [
//    { icon: Package, label: "My Bookings", path: "/attendee/bookings" },
//     { icon: Calendar, label: "Browse Events", path: "/attendee/browse" },
//     { icon: Ticket, label: "My Tickets", path: "/attendee/tickets" },
//     { icon: Bell, label: "Announcements", path: "/attendee/announcements", badge: true },
//     { icon: Star, label: "My Feedbacks", path: "/attendee/myfeedbacks" },
//     { icon: HelpCircle, label: "Contact Support", path: "/attendee/support" },
//     { icon: MessageSquare, label: "AI Assistant", path: "/attendee/chatbot" },
//         { icon: User, label: "My Profile", path: "/attendee/profile" },
//   ],
// };

// const SOCKET_URL =
//   import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:3010";

// const Sidebar: React.FC = () => {
//   const location = useLocation();
//   const { user, logout } = useAuth();

//   const [announcementUnreadCount, setAnnouncementUnreadCount] = useState(0);
//   const [chatUnreadCount, setChatUnreadCount] = useState(0);

//   const socketRef = useRef<Socket | null>(null);

//   const loadChatUnreadCount = async () => {
//     if (!user) return;

//     try {
//       if (user.role === "eventOrganizer") {
//         const rawOrganizerId = localStorage.getItem("organizerId");
//         const organizerId = rawOrganizerId ? Number(rawOrganizerId) : null;

//         if (!organizerId || Number.isNaN(organizerId)) return;

//         const data = await getOrganizerUnreadSummary(organizerId);
//         setChatUnreadCount(Number(data.totalUnread || 0));
//       }

//       if (user.role === "venueManager") {
//         const rawManagerId = localStorage.getItem("managerId");
//         const managerId = rawManagerId ? Number(rawManagerId) : null;

//         if (!managerId || Number.isNaN(managerId)) return;

//         const data = await getManagerUnreadSummary(managerId);
//         setChatUnreadCount(Number(data.totalUnread || 0));
//       }
//     } catch {
//       setChatUnreadCount(0);
//     }
//   };

//   useEffect(() => {
//     if (!user) return;

//     loadChatUnreadCount();

//     const attendeeId = localStorage.getItem("attendeeId");
//     const userId = localStorage.getItem("userId");

//     const query: Record<string, string> = {};

//     if (user.role === "attendee" && attendeeId) {
//       query.attendeeId = attendeeId;
//     }

//     if (
//       (user.role === "eventOrganizer" || user.role === "venueManager") &&
//       userId
//     ) {
//       query.userId = userId;
//     }

//     if (Object.keys(query).length === 0) return;

//     const socket = io(SOCKET_URL, {
//       query,
//       transports: ["websocket"],
//     });

//     socketRef.current = socket;

//     socket.on("newAnnouncement", () => {
//       if (user.role === "attendee") {
//         setAnnouncementUnreadCount((prev) => prev + 1);
//       }
//     });

//     socket.on("unread_messages_updated", (payload: { totalUnread?: number }) => {
//       if (user.role === "eventOrganizer" || user.role === "venueManager") {
//         setChatUnreadCount(Number(payload.totalUnread || 0));
//       }
//     });

//     return () => {
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [user]);

//   useEffect(() => {
//     if (location.pathname === "/attendee/announcements") {
//       setAnnouncementUnreadCount(0);
//     }
//   }, [location.pathname]);

//   useEffect(() => {
//     if (
//       location.pathname.startsWith("/organizer/chat-room") ||
//       location.pathname.startsWith("/venue/message-organizers")
//     ) {
//       loadChatUnreadCount();
//     }
//   }, [location.pathname]);

//   if (!user) return null;

//   const role = user.role;
//   const items = menuConfig[role] || [];

//   return (
//     <aside className="eventia-sidebar">
//       <div className="sidebar-brand">
//         <div className="brand-icon">
//           <CalendarCheck size={20} />
//         </div>
//         <span className="brand-text">Eventia</span>
//       </div>

//       <nav className="sidebar-nav">
//         {items.map((item) => {
//           const Icon = item.icon;
//           const active =
//             location.pathname.startsWith(item.path + "/") ||
//             location.pathname === item.path;

//           const normalBadgeCount =
//             item.badge && announcementUnreadCount > 0
//               ? announcementUnreadCount
//               : 0;

//           const chatBadgeCount =
//             item.chatBadge && chatUnreadCount > 0 ? chatUnreadCount : 0;

//           const displayedBadge = chatBadgeCount || normalBadgeCount;

//           return (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`nav-link ${active ? "active" : ""}`}
//             >
//               <span className="nav-link-icon-wrap">
//                 <Icon size={18} />
//                 {displayedBadge > 0 && (
//                   <span className="nav-badge">
//                     {displayedBadge > 99 ? "99+" : displayedBadge}
//                   </span>
//                 )}
//               </span>
//               <span>{item.label}</span>
//             </Link>
//           );
//         })}
//       </nav>

//       <div className="sidebar-footer">
//         <button className="logout-btn" onClick={logout} type="button">
//           <LogOut size={18} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;







import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Calendar,
  Settings,
  LogOut,
  Ticket,
  MessageSquare,
  BarChart3,
  Bell,
  Package,
  Star,
  User,
  MessageCircle,
  HelpCircle,
  X,
} from "lucide-react";
import { CalendarCheck } from "lucide-react";
import { io, Socket } from "socket.io-client";

import "./Sidebar.css";
import { useAuth } from "../../context/AuthContext";
import { getOrganizerUnreadSummary } from "../../api/eventApi";
import { getManagerUnreadSummary } from "../../api/venueApi";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuItem = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  path: string;
  badge?: boolean;
  chatBadge?: boolean;
};

const menuConfig: Record<string, MenuItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: User, label: "Pending Approvals", path: "/admin/pending-approvals", badge: true },
    { icon: Users, label: "Manage Attendees", path: "/admin/attendees" },
    { icon: MapPin, label: "Manage Venue Owners", path: "/admin/venue-managers" },
    { icon: Calendar, label: "Manage Organizers", path: "/admin/event-organizers" },
    { icon: MessageSquare, label: "Contact Requests", path: "/admin/contact-requests" },
    { icon: Settings, label: "Platform Settings", path: "/admin/platform-settings" },
  ],

  eventOrganizer: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/organizer/dashboard" },
    { icon: BarChart3, label: "Analytics", path: "/organizer/analytics" },
    { icon: Calendar, label: "My Events", path: "/organizer/events" },
    { icon: MapPin, label: "Browse Venues", path: "/organizer/browse-venues" },
    { icon: Package, label: "Venue Requests", path: "/organizer/venue-requests" },
    { icon: MessageCircle, label: "Chat room", path: "/organizer/chat-room", chatBadge: true },
    { icon: Ticket, label: "Event Tickets", path: "/organizer/event-tickets" },
    { icon: Bell, label: "My Announcements", path: "/organizer/my-announcements" },
    { icon: Star, label: "Feedbacks", path: "/organizer/feedbacks" },
    { icon: HelpCircle, label: "Contact Support", path: "/organizer/support" },
    { icon: MessageSquare, label: "AI Assistant", path: "/organizer/chatbot" },
    { icon: User, label: "My Profile", path: "/organizer/profile" },
  ],

  venueManager: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/venue/dashboard" },
    { icon: MapPin, label: "My Venue", path: "/venue/my-venue" },
    { icon: Calendar, label: "Availability", path: "/venue/availability" },
    { icon: Package, label: "Event Requests", path: "/venue/event-requests" },
    { icon: MessageCircle, label: "Message Organizers", path: "/venue/message-organizers", chatBadge: true },
    { icon: HelpCircle, label: "Contact Support", path: "/venue/support" },
    { icon: MessageSquare, label: "AI Assistant", path: "/venue/chatbot" },
    { icon: User, label: "My Profile", path: "/venue/profile" },
  ],

  attendee: [
    { icon: Package, label: "My Bookings", path: "/attendee/bookings" },
    { icon: Calendar, label: "Browse Events", path: "/attendee/browse" },
    { icon: Ticket, label: "My Tickets", path: "/attendee/tickets" },
    { icon: Bell, label: "Announcements", path: "/attendee/announcements", badge: true },
    { icon: Star, label: "My Feedbacks", path: "/attendee/myfeedbacks" },
    { icon: HelpCircle, label: "Contact Support", path: "/attendee/support" },
    { icon: MessageSquare, label: "AI Assistant", path: "/attendee/chatbot" },
    { icon: User, label: "My Profile", path: "/attendee/profile" },
  ],
};

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:3010";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [announcementUnreadCount, setAnnouncementUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const socketRef = useRef<Socket | null>(null);

  const loadChatUnreadCount = async () => {
    if (!user) return;

    try {
      if (user.role === "eventOrganizer") {
        const rawOrganizerId = localStorage.getItem("organizerId");
        const organizerId = rawOrganizerId ? Number(rawOrganizerId) : null;

        if (!organizerId || Number.isNaN(organizerId)) return;

        const data = await getOrganizerUnreadSummary(organizerId);
        setChatUnreadCount(Number(data.totalUnread || 0));
      }

      if (user.role === "venueManager") {
        const rawManagerId = localStorage.getItem("managerId");
        const managerId = rawManagerId ? Number(rawManagerId) : null;

        if (!managerId || Number.isNaN(managerId)) return;

        const data = await getManagerUnreadSummary(managerId);
        setChatUnreadCount(Number(data.totalUnread || 0));
      }
    } catch {
      setChatUnreadCount(0);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadChatUnreadCount();

    const attendeeId = localStorage.getItem("attendeeId");
    const userId = localStorage.getItem("userId");

    const query: Record<string, string> = {};

    if (user.role === "attendee" && attendeeId) {
      query.attendeeId = attendeeId;
    }

    if (
      (user.role === "eventOrganizer" || user.role === "venueManager") &&
      userId
    ) {
      query.userId = userId;
    }

    if (Object.keys(query).length === 0) return;

    const socket = io(SOCKET_URL, {
      query,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("newAnnouncement", () => {
      if (user.role === "attendee") {
        setAnnouncementUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("unread_messages_updated", (payload: { totalUnread?: number }) => {
      if (user.role === "eventOrganizer" || user.role === "venueManager") {
        setChatUnreadCount(Number(payload.totalUnread || 0));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (location.pathname === "/attendee/announcements") {
      setAnnouncementUnreadCount(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (
      location.pathname.startsWith("/organizer/chat-room") ||
      location.pathname.startsWith("/venue/message-organizers")
    ) {
      loadChatUnreadCount();
    }
  }, [location.pathname]);

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  if (!user) return null;

  const role = user.role;
  const items = menuConfig[role] || [];

  return (
    <>
      <button
        className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
      />

      <aside className={`eventia-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-left">
            <div className="brand-icon">
              <CalendarCheck size={20} />
            </div>
            <span className="brand-text">Eventia</span>
          </div>

          <button
            className="sidebar-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname.startsWith(item.path + "/") ||
              location.pathname === item.path;

            const normalBadgeCount =
              item.badge && announcementUnreadCount > 0
                ? announcementUnreadCount
                : 0;

            const chatBadgeCount =
              item.chatBadge && chatUnreadCount > 0 ? chatUnreadCount : 0;

            const displayedBadge = chatBadgeCount || normalBadgeCount;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <span className="nav-link-icon-wrap">
                  <Icon size={18} />
                  {displayedBadge > 0 && (
                    <span className="nav-badge">
                      {displayedBadge > 99 ? "99+" : displayedBadge}
                    </span>
                  )}
                </span>
                <span className="nav-link-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout} type="button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;