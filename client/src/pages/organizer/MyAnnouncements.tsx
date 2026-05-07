// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Bell,
//   Plus,
//   X,
//   LoaderCircle,
//   Send,
//   CalendarDays,
//   ChevronDown,
// } from "lucide-react";
// import "./MyAnnouncements.css";
// import {
//   getOrganizerAnnouncements,
//   createAnnouncement,
//   type OrganizerAnnouncementItem,
// } from "../../api/eventApi";
// import { getEventNamesHelper, type EventNameItem } from "../../api/eventApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";

// type FormState = {
//   eventName: string;
//   title: string;
//   message: string;
// };

// const initialForm: FormState = { eventName: "", title: "", message: "" };

// const formatPostedDate = (raw: string): string => {
//   const d = new Date(raw);
//   return d.toLocaleDateString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// const MyAnnouncements: React.FC = () => {
//   const [announcements, setAnnouncements] = useState<OrganizerAnnouncementItem[]>([]);
//   const [eventNames, setEventNames] = useState<EventNameItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [form, setForm] = useState<FormState>(initialForm);

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const organizerId = useMemo(() => {
//     const raw = localStorage.getItem("organizerId");
//     return raw ? Number(raw) : null;
//   }, []);

//   // ── Load announcements ───────────────────────────────────────────────────

//   const loadAnnouncements = async () => {
//     if (!organizerId) {
//       showAlert("Organizer ID not found. Please log in again.", "error");
//       setIsLoading(false);
//       return;
//     }
//     try {
//       setIsLoading(true);
//       const data = await getOrganizerAnnouncements(organizerId);
//       setAnnouncements(data);
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : "Failed to load announcements.";
//       showAlert(msg, "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ── Load event names for dropdown ────────────────────────────────────────

//   const loadEventNames = async () => {
//     if (!organizerId) return;
//     try {
//       const data = await getEventNamesHelper(organizerId);
//       setEventNames(data);
//     } catch {
//       // non-fatal — dropdown just stays empty
//     }
//   };

//   useEffect(() => {
//     loadAnnouncements();
//     loadEventNames();
//   }, []);

//   // ── Modal body lock ──────────────────────────────────────────────────────

//   useEffect(() => {
//     if (isModalOpen) {
//       document.body.classList.add("modal-open");
//     } else {
//       document.body.classList.remove("modal-open");
//     }
//     return () => document.body.classList.remove("modal-open");
//   }, [isModalOpen]);

//   // ── Handlers ─────────────────────────────────────────────────────────────

//   const openModal = () => {
//     setForm(initialForm);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     if (isSubmitting) return;
//     setIsModalOpen(false);
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!organizerId) {
//       showAlert("Organizer ID not found. Please log in again.", "error");
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       await createAnnouncement({
//         organizerId,
//         eventName: form.eventName,
//         title: form.title.trim(),
//         message: form.message.trim(),
//       });
//       showAlert("Announcement sent successfully.", "success");
//       setIsModalOpen(false);
//       setForm(initialForm);
//       await loadAnnouncements();
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : "Failed to send announcement.";
//       showAlert(msg, "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ── Render ───────────────────────────────────────────────────────────────

//   return (
//     <>
//       <AlertSnackbar open={open} message={message} severity={severity} onClose={handleClose} />

//       <div className="page-shell">
//         {/* Page header */}
//         <div className="page-header ma-header-row">
//           <div>
//             <h2 className="page-title">My Announcements</h2>
//             <p className="page-subtitle">
//               Send updates and important information to your event attendees.
//             </p>
//           </div>

//         </div>

//         {/* Content */}
//         {isLoading ? (
//           <div className="surface-card ma-state-card">
//             <div className="ma-state-inner">
//               <LoaderCircle size={22} className="ma-spin" />
//               <span>Loading announcements...</span>
//             </div>
//           </div>
//         ) : announcements.length === 0 ? (
//           <div className="surface-card ma-state-card">
//             <div className="ma-empty">
//               <div className="ma-empty-icon">
//                 <Bell size={26} />
//               </div>
//               <h3>No announcements yet</h3>
//               <p>
//                 You haven't sent any announcements. Create one to notify your attendees
//                 instantly.
//               </p>
//               <button type="button" className="ma-create-btn" onClick={openModal}>
//                 <Plus size={16} />
//                 <span>New Announcement</span>
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="ma-list">
//             {announcements.map((ann, idx) => (
//               <div
//                 className="surface-card ma-item"
//                 key={ann.announcementId}
//                 style={{ animationDelay: `${idx * 40}ms` }}
//               >
//                 <div className="ma-item-left">
//                   <div className="ma-item-bell">
//                     <Bell size={18} strokeWidth={2.5} />
//                   </div>
//                 </div>

//                 <div className="ma-item-body">
//                   <div className="ma-item-header">
//                     <span className="ma-item-event">{ann.eventName}</span>
//                   </div>
//                   <h4 className="ma-item-title">{ann.title}</h4>
//                   <p className="ma-item-message">{ann.message}</p>
                  
//                   {/* Enterprise Divider */}
//                   <div className="ma-divider"></div>

//                   <div className="ma-item-footer">
//                     <CalendarDays size={14} className="ma-footer-icon" />
//                     <span>Posted: {formatPostedDate(ann.createdAt)}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ── Create Announcement Modal ── */}
//       {isModalOpen && (
//         <div className="ma-overlay" onClick={closeModal}>
//           <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="ma-modal-header">
//               <div>
//                 <h3>New Announcement</h3>
//                 <p>Notify all attendees of a specific event instantly.</p>
//               </div>
//               <button
//                 type="button"
//                 className="ma-close-btn"
//                 onClick={closeModal}
//                 aria-label="Close"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <form className="ma-form" onSubmit={handleSubmit}>
//               {/* Event dropdown */}
//               <div className="ma-field">
//                 <label htmlFor="ma-eventName">Event</label>
//                 <div className="ma-select-wrap">
//                   <select
//                     id="ma-eventName"
//                     name="eventName"
//                     value={form.eventName}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="" disabled>
//                       Select an event…
//                     </option>
//                     {eventNames.map((e) => (
//                       <option key={e.name} value={e.name}>
//                         {e.name}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown size={15} className="ma-select-chevron" />
//                 </div>
//               </div>

//               {/* Title */}
//               <div className="ma-field">
//                 <label htmlFor="ma-title">Title</label>
//                 <input
//                   id="ma-title"
//                   name="title"
//                   type="text"
//                   value={form.title}
//                   onChange={handleChange}
//                   placeholder="e.g. Gate opens at 5PM"
//                   required
//                   minLength={3}
//                 />
//               </div>

//               {/* Message */}
//               <div className="ma-field">
//                 <label htmlFor="ma-message">Message</label>
//                 <textarea
//                   id="ma-message"
//                   name="message"
//                   rows={5}
//                   value={form.message}
//                   onChange={handleChange}
//                   placeholder="Write your announcement here…"
//                   required
//                   minLength={3}
//                 />
//               </div>

//               <div className="ma-modal-actions">
//                 <button
//                   type="button"
//                   className="ma-cancel-btn"
//                   onClick={closeModal}
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </button>

//                 <button type="submit" className="ma-send-btn" disabled={isSubmitting}>
//                   {isSubmitting ? (
//                     <>
//                       <LoaderCircle size={16} className="ma-spin" />
//                       <span>Sending…</span>
//                     </>
//                   ) : (
//                     <>
//                       <Send size={16} />
//                       <span>Send Announcement</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default MyAnnouncements;






import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Plus,
  X,
  LoaderCircle,
  Send,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import "./MyAnnouncements.css";
import {
  getOrganizerAnnouncements,
  createAnnouncement,
  type OrganizerAnnouncementItem,
} from "../../api/eventApi";
import { getEventNamesHelper, type EventNameItem } from "../../api/eventApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

type FormState = {
  eventName: string;
  title: string;
  message: string;
};

const initialForm: FormState = {
  eventName: "",
  title: "",
  message: "",
};

const formatPostedDate = (raw: string): string => {
  const d = new Date(raw);

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MyAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<OrganizerAnnouncementItem[]>([]);
  const [eventNames, setEventNames] = useState<EventNameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const loadAnnouncements = async () => {
    if (!organizerId) {
      showAlert("Organizer ID not found. Please log in again.", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getOrganizerAnnouncements(organizerId);
      setAnnouncements(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load announcements.";
      showAlert(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventNames = async () => {
    if (!organizerId) return;

    try {
      const data = await getEventNamesHelper(organizerId);
      setEventNames(data);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    loadAnnouncements();
    loadEventNames();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => document.body.classList.remove("modal-open");
  }, [isModalOpen]);

  const openModal = () => {
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizerId) {
      showAlert("Organizer ID not found. Please log in again.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      await createAnnouncement({
        organizerId,
        eventName: form.eventName,
        title: form.title.trim(),
        message: form.message.trim(),
      });

      showAlert("Announcement sent successfully.", "success");
      setIsModalOpen(false);
      setForm(initialForm);
      await loadAnnouncements();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send announcement.";
      showAlert(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AlertSnackbar open={open} message={message} severity={severity} onClose={handleClose} />

      <div className="page-shell">
        <div className="page-header ma-header-row">
          <div>
            <h2 className="page-title">My Announcements</h2>
            <p className="page-subtitle">
              Send updates and important information to your event attendees.
            </p>
          </div>

          {/* ✅ Always visible button */}
          <button type="button" className="ma-create-btn" onClick={openModal}>
            <Plus size={16} />
            <span>New Announcement</span>
          </button>
        </div>

        {isLoading ? (
          <div className="surface-card ma-state-card">
            <div className="ma-state-inner">
              <LoaderCircle size={22} className="ma-spin" />
              <span>Loading announcements...</span>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="surface-card ma-state-card">
            <div className="ma-empty">
              <div className="ma-empty-icon">
                <Bell size={26} />
              </div>

              <h3>No announcements yet</h3>

              <p>
                You haven't sent any announcements. Create one to notify your attendees
                instantly.
              </p>
            </div>
          </div>
        ) : (
          <div className="ma-list">
            {announcements.map((ann, idx) => (
              <div
                className="surface-card ma-item"
                key={ann.announcementId}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="ma-item-left">
                  <div className="ma-item-bell">
                    <Bell size={18} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="ma-item-body">
                  <div className="ma-item-header">
                    <span className="ma-item-event">{ann.eventName}</span>
                  </div>

                  <h4 className="ma-item-title">{ann.title}</h4>
                  <p className="ma-item-message">{ann.message}</p>

                  <div className="ma-divider"></div>

                  <div className="ma-item-footer">
                    <CalendarDays size={14} className="ma-footer-icon" />
                    <span>Posted: {formatPostedDate(ann.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="ma-overlay" onClick={closeModal}>
          <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ma-modal-header">
              <div>
                <h3>New Announcement</h3>
                <p>Notify all attendees of a specific event instantly.</p>
              </div>

              <button
                type="button"
                className="ma-close-btn"
                onClick={closeModal}
                aria-label="Close"
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            <form className="ma-form" onSubmit={handleSubmit}>
              <div className="ma-field">
                <label htmlFor="ma-eventName">Event</label>

                <div className="ma-select-wrap">
                  <select
                    id="ma-eventName"
                    name="eventName"
                    value={form.eventName}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select an event…
                    </option>

                    {eventNames.map((e) => (
                      <option key={e.name} value={e.name}>
                        {e.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={15} className="ma-select-chevron" />
                </div>
              </div>

              <div className="ma-field">
                <label htmlFor="ma-title">Title</label>

                <input
                  id="ma-title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Gate opens at 5PM"
                  required
                  minLength={3}
                />
              </div>

              <div className="ma-field">
                <label htmlFor="ma-message">Message</label>

                <textarea
                  id="ma-message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your announcement here…"
                  required
                  minLength={3}
                />
              </div>

              <div className="ma-modal-actions">
                <button
                  type="button"
                  className="ma-cancel-btn"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button type="submit" className="ma-send-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={16} className="ma-spin" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Announcement</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyAnnouncements;
