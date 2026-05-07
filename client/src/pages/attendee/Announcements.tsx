import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  X,
  LoaderCircle,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import "./Announcements.css";
import {
  getAttendeeAnnouncements,
  type AnnouncementItem,
} from "../../api/attendeeApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:3010";

const formatDate = (raw: string): string => {
  const d = new Date(raw);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [selected, setSelected] = useState<AnnouncementItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const socketRef = useRef<Socket | null>(null);

  const attendeeId = useMemo(() => {
    const raw = localStorage.getItem("attendeeId");
    return raw ? Number(raw) : null;
  }, []);

  // ── Load announcements ───────────────────────────────────────────────────

  const loadAnnouncements = async () => {
    if (!attendeeId) {
      showAlert("Attendee ID not found. Please log in again.", "error");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await getAttendeeAnnouncements(attendeeId);
      setAnnouncements(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load announcements.";
      showAlert(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // ── Socket — receive live announcements ──────────────────────────────────

  useEffect(() => {
    if (!attendeeId) return;

    const socket = io(SOCKET_URL, {
      query: { attendeeId: String(attendeeId) },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("newAnnouncement", (ann: AnnouncementItem) => {
      // Prepend the live announcement to the top of the list
      setAnnouncements((prev) => {
        // avoid duplicates (socket may fire twice in dev strict mode)
        if (prev.some((a) => a.announcementId === ann.announcementId)) return prev;
        return [ann, ...prev];
      });
      showAlert(`New announcement: ${ann.title}`, "info");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [attendeeId]);

  // ── Modal body lock ──────────────────────────────────────────────────────

  useEffect(() => {
    if (selected) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [selected]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <AlertSnackbar open={open} message={message} severity={severity} onClose={handleClose} />

      <div className="page-shell">
        {/* Page header */}
        <div className="page-header">
          <h2 className="page-title">Announcements</h2>
          <p className="page-subtitle">
            Stay up to date with the latest updates from your booked events.
          </p>
        </div>

        {isLoading ? (
          <div className="surface-card ann-state-card">
            <div className="ann-state-inner">
              <LoaderCircle size={22} className="ann-spin" />
              <span>Loading announcements…</span>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="surface-card ann-state-card">
            <div className="ann-empty">
              <div className="ann-empty-icon">
                <Megaphone size={26} />
              </div>
              <h3>No announcements yet</h3>
              <p>
                When organizers post updates for events you've booked, they'll appear
                here in real time.
              </p>
            </div>
          </div>
        ) : (
          <div className="ann-list">
            {announcements.map((ann, idx) => (
              <button
                key={ann.announcementId}
                type="button"
                className="surface-card ann-item"
                onClick={() => setSelected(ann)}
                style={{ animationDelay: `${idx * 35}ms` }}
              >
                <div className="ann-item-left">
                  <div className="ann-item-bell">
                    <Bell size={18} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="ann-item-body">
                  <div className="ann-item-header">
                    <span className="ann-item-event">{ann.eventName}</span>
                  </div>
                  <h4 className="ann-item-title">{ann.title}</h4>
                  <p className="ann-item-preview">{ann.message}</p>
                  
                  {/* Enterprise Divider */}
                  <div className="ann-divider"></div>

                  <div className="ann-item-date">
                    <CalendarDays size={13} className="ann-date-icon" />
                    <span>Posted: {formatDate(ann.createdAt)}</span>
                  </div>
                </div>

                <div className="ann-item-chevron">
                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="ann-overlay" onClick={() => setSelected(null)}>
          <div className="ann-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ann-modal-header">
              <div className="ann-modal-header-left">
                <div className="ann-modal-bell">
                  <Bell size={18} />
                </div>
                <div>
                  <span className="ann-modal-event">{selected.eventName}</span>
                  <h3 className="ann-modal-title">{selected.title}</h3>
                </div>
              </div>
              <button
                type="button"
                className="ann-close-btn"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="ann-modal-body">
              <p className="ann-modal-message">{selected.message}</p>
              <div className="ann-modal-date">
                <CalendarDays size={14} />
                <span>Posted: {formatDate(selected.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Announcements;