import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import "./MyEvents.css";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import EventForm, { type EventFormSubmitData } from "../../components/common/EventForm";
import { useAlert } from "../../hooks/useAlert";
import {
  createEventWithImage,
  deleteEvent,
  getOrganizerEvents,
  updateEventDetails,
  type OrganizerEventItem,
} from "../../api/eventApi";

const MyEvents: React.FC = () => {
  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [events, setEvents] = useState<OrganizerEventItem[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OrganizerEventItem | null>(null);
  const [deleteTargetEvent, setDeleteTargetEvent] =
    useState<OrganizerEventItem | null>(null);

  useEffect(() => {
    const hasOpenModal = isCreateModalOpen || !!editingEvent || !!deleteTargetEvent;

    if (hasOpenModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isCreateModalOpen, editingEvent, deleteTargetEvent]);

  const loadOrganizerEvents = async () => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      setIsPageLoading(false);
      return;
    }

    try {
      setIsPageLoading(true);
      const data = await getOrganizerEvents(organizerId);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load organizer events.";
      showAlert(msg, "error");
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerEvents();
  }, []);

  const extractImageFileName = (imageUrl?: string | null) => {
    if (!imageUrl) return "";
    const cleaned = imageUrl.split("?")[0];
    const parts = cleaned.split("/");
    return parts[parts.length - 1] || "";
  };

  const handleCreateEvent = async (data: EventFormSubmitData) => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      return;
    }

    if (!data.image) {
      showAlert("Event image is required.", "error");
      return;
    }

    const [startTime, endTime] = data.timeSlot.split("-");

    try {
      setIsSubmittingCreate(true);

      await createEventWithImage({
        image: data.image,
        name: data.name,
        description: data.description,
        organizerId,
        eventType: data.eventType,
        venueName: data.venueName,
        date: data.date,
        startTime,
        endTime,
        capacity: data.capacity,
      });

      showAlert("Event created successfully.", "success");
      setIsCreateModalOpen(false);
      await loadOrganizerEvents();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to create event.";
      showAlert(msg, "error");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleUpdateEvent = async (data: EventFormSubmitData) => {
    if (!data.eventId) {
      showAlert("Event ID was not found.", "error");
      return;
    }

    const [startTime, endTime] = data.timeSlot.split("-");

    try {
      setIsSubmittingEdit(true);

      await updateEventDetails({
        eventId: data.eventId,
        venueName: data.venueName,
        eventTypeName: data.eventType,
        name: data.name,
        description: data.description,
        image: data.image,
        imageUrl: data.image ? undefined : extractImageFileName(data.existingImageUrl),
        date: data.date,
        startTime,
        endTime,
        capacity: data.capacity,
      });

      showAlert("Event updated successfully.", "success");
      setEditingEvent(null);
      await loadOrganizerEvents();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update event.";
      showAlert(msg, "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetEvent) return;

    try {
      setIsDeleting(true);
      await deleteEvent(deleteTargetEvent.eventId);

      showAlert("Event deleted successfully.", "success");
      setDeleteTargetEvent(null);
      await loadOrganizerEvents();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete event.";
      showAlert(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours = "0", minutes = "0"] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString.slice(0, 10);

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "rejected";
    if (normalized === "pending") return "pending";
    return "default";
  };

  const canEditEvent = (status: string) => {
    const normalized = status.toLowerCase();
    return normalized === "pending" || normalized === "rejected";
  };

  // UPDATED HERE
  const canDeleteEvent = (status: string) => {
    const normalized = status.toLowerCase();
    return normalized === "pending" || normalized === "rejected";
  };

  return (
    <>
      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />

      <div className="page-shell">
        <div className="page-header my-events-header-row">
          <div>
            <h2 className="page-title">My Events</h2>
            <p className="page-subtitle">
              Create and manage your event listings, venues, and schedules.
            </p>
          </div>

          <button
            type="button"
            className="my-events-primary-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>+ Create Event</span>
          </button>
        </div>

        {isPageLoading ? (
          <div className="surface-card my-events-state-card">
            <div className="my-events-loading">
              <LoaderCircle size={22} className="spin-icon" />
              <span>Loading your events...</span>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="surface-card my-events-empty-card">
            <div className="my-events-empty-icon">
              <CalendarDays size={28} />
            </div>
            <h3>No events found</h3>
            <p>You have not created any events yet.</p>
          </div>
        ) : (
          <div className="my-events-grid">
            {events.map((event) => (
              <article
                className={`surface-card my-event-card ${getStatusClass(event.eventStatus)}`}
                key={event.eventId}
              >
                <div className="my-event-image-wrap">
                  {canDeleteEvent(event.eventStatus) && (
                    <button
                      type="button"
                      className="my-events-delete-icon-btn"
                      onClick={() => setDeleteTargetEvent(event)}
                      title="Delete event"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.name} className="my-event-image" />
                  ) : (
                    <div className="my-event-image-placeholder">
                      <ImageIcon size={30} />
                    </div>
                  )}

                  <span className={`my-event-status-badge ${getStatusClass(event.eventStatus)}`}>
                    {event.eventStatus}
                  </span>
                </div>

                <div className="my-event-content">
                  <div className="my-event-top">
                    <h3 className="my-event-title" title={event.name}>
                      {event.name}
                    </h3>

                    <span className="my-event-type-badge" title={event.eventType}>
                      {event.eventType}
                    </span>
                  </div>

                  <p
                    className={`my-event-description ${
                      canEditEvent(event.eventStatus)
                        ? "my-event-description--with-button"
                        : "my-event-description--full"
                    }`}
                    title={event.description}
                  >
                    {event.description || "No description provided."}
                  </p>

                  <div className="my-event-meta-list">
                    <div className="my-event-meta-item">
                      <CalendarDays size={15} />
                      <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="my-event-meta-item">
                      <Clock3 size={15} />
                      <span>
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </span>
                    </div>

                    <div className="my-event-meta-item">
                      <Users size={15} />
                      <span>{event.capacity} capacity</span>
                    </div>

                    <div className="my-event-meta-item">
                      <CalendarDays size={15} />
                      <span>Created at: {formatCreatedAt(event.createdAt)}</span>
                    </div>
                  </div>

                  {canEditEvent(event.eventStatus) ? (
                    <button
                      type="button"
                      className="my-events-update-btn"
                      onClick={() => setEditingEvent(event)}
                    >
                      <Pencil size={15} />
                      <span>Update</span>
                    </button>
                  ) : (
                    <div className="my-events-card-footer-spacer" />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {deleteTargetEvent && (
        <div className="my-events-dialog-backdrop" role="dialog" aria-modal="true">
          <div className="my-events-dialog">
            <h3>Delete event?</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTargetEvent.name}</strong>? This action cannot be undone.
            </p>

            <div className="my-events-dialog-actions">
              <button
                type="button"
                className="my-events-dialog-cancel-btn"
                onClick={() => setDeleteTargetEvent(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="my-events-dialog-delete-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && organizerId && (
        <EventForm
          mode="create"
          organizerId={organizerId}
          isSubmitting={isSubmittingCreate}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
          showAlert={showAlert}
        />
      )}

      {editingEvent && organizerId && (
        <EventForm
          mode="edit"
          organizerId={organizerId}
          isSubmitting={isSubmittingEdit}
          onClose={() => setEditingEvent(null)}
          onSubmit={handleUpdateEvent}
          showAlert={showAlert}
          disableVenueEditing={editingEvent.eventStatus.toLowerCase() === "pending"}
          initialValues={{
            eventId: editingEvent.eventId,
            name: editingEvent.name,
            description: editingEvent.description,
            eventType: editingEvent.eventType,
            venueName: editingEvent.venueName,
            date: editingEvent.date,
            startTime: editingEvent.startTime,
            endTime: editingEvent.endTime,
            capacity: editingEvent.capacity,
            imageUrl: editingEvent.imageUrl,
          }}
        />
      )}
    </>
  );
};

export default MyEvents;