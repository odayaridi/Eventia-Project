import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  LoaderCircle,
  Ticket,
  X,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import "./EventTickets.css";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";
import {
  createEventTicket,
  getUpcomingEventNamesHelper,
  getEventTickets,
  getTicketTypes,
  updateEventTicket,
  type EventNameItem,
  type EventTicketItem,
  type TicketTypeItem,
} from "../../api/eventApi";

type TicketFormState = {
  eventName: string;
  type: string;
  perks: string;
  price: string;
  quantityAvailable: string;
};

type EditFormState = {
  eventTicketId: number | null;
  type: string;
  perks: string;
  price: string;
  quantityAvailable: string;
};

type GroupedEventTickets = {
  eventId: number;
  eventName: string;
  eventStatus: string;
  tickets: EventTicketItem[];
};

const initialCreateForm: TicketFormState = {
  eventName: "",
  type: "",
  perks: "",
  price: "",
  quantityAvailable: "",
};

const initialEditForm: EditFormState = {
  eventTicketId: null,
  type: "",
  perks: "",
  price: "",
  quantityAvailable: "",
};

const EventTickets: React.FC = () => {
  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const [tickets, setTickets] = useState<EventTicketItem[]>([]);
  const [eventNames, setEventNames] = useState<EventNameItem[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isNamesLoading, setIsNamesLoading] = useState(false);
  const [isTicketTypesLoading, setIsTicketTypesLoading] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<EventTicketItem | null>(null);

  const [createForm, setCreateForm] = useState<TicketFormState>(initialCreateForm);
  const [editForm, setEditForm] = useState<EditFormState>(initialEditForm);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const groupedTickets = useMemo<GroupedEventTickets[]>(() => {
    const groups = new Map<string, GroupedEventTickets>();

    tickets.forEach((ticket) => {
      const key = `${ticket.eventId}-${ticket.eventName}`;
      if (!groups.has(key)) {
        groups.set(key, {
          eventId: ticket.eventId,
          eventName: ticket.eventName,
          eventStatus: ticket.eventStatus,
          tickets: [],
        });
      }

      groups.get(key)?.tickets.push(ticket);
    });

    return Array.from(groups.values());
  }, [tickets]);

  useEffect(() => {
    const hasOpenModal = isCreateModalOpen || !!editingTicket;

    if (hasOpenModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isCreateModalOpen, editingTicket]);

  const loadTickets = async () => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      setIsPageLoading(false);
      return;
    }

    try {
      setIsPageLoading(true);
      const data = await getEventTickets(organizerId);
      setTickets(data);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load event tickets.";
      showAlert(msg, "error");
    } finally {
      setIsPageLoading(false);
    }
  };

  const loadEventNames = async () => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      return;
    }

    try {
      setIsNamesLoading(true);
      const data = await getUpcomingEventNamesHelper(organizerId);
      setEventNames(data);

      if (data.length > 0) {
        setCreateForm((prev) => ({
          ...prev,
          eventName: prev.eventName || data[0].name,
        }));
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load event names.";
      showAlert(msg, "error");
    } finally {
      setIsNamesLoading(false);
    }
  };

  const loadTicketTypes = async () => {
    try {
      setIsTicketTypesLoading(true);
      const data = await getTicketTypes();
      setTicketTypes(data);

      const firstType = data[0]?.name || "";

      setCreateForm((prev) => ({
        ...prev,
        type: prev.type || firstType,
      }));

      setEditForm((prev) => ({
        ...prev,
        type: prev.type || firstType,
      }));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load ticket types.";
      showAlert(msg, "error");
    } finally {
      setIsTicketTypesLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    loadEventNames();
    loadTicketTypes();
  }, []);

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    const firstEventName = eventNames[0]?.name || "";
    const firstTicketType = ticketTypes[0]?.name || "";

    setCreateForm({
      eventName: firstEventName,
      type: firstTicketType,
      perks: "",
      price: "",
      quantityAvailable: "",
    });

    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isSubmittingCreate) return;
    setIsCreateModalOpen(false);
  };

  const openEditModal = (ticket: EventTicketItem) => {
    setEditingTicket(ticket);
    setEditForm({
      eventTicketId: ticket.eventTicketId,
      type: ticket.ticketType,
      perks: ticket.perks,
      price: String(ticket.price),
      quantityAvailable: String(ticket.quantityAvailable),
    });
  };

  const closeEditModal = () => {
    if (isSubmittingEdit) return;
    setEditingTicket(null);
    setEditForm(initialEditForm);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.eventName) {
      showAlert("Please select an event name.", "error");
      return;
    }

    if (!createForm.type) {
      showAlert("Please select a ticket type.", "error");
      return;
    }

    try {
      setIsSubmittingCreate(true);

      await createEventTicket({
        eventName: createForm.eventName,
        type: createForm.type,
        perks: createForm.perks.trim(),
        price: Number(createForm.price),
        quantityAvailable: Number(createForm.quantityAvailable),
      });

      showAlert("Event ticket created successfully.", "success");
      setIsCreateModalOpen(false);
      await loadTickets();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to create event ticket.";
      showAlert(msg, "error");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.eventTicketId) {
      showAlert("Event ticket ID was not found.", "error");
      return;
    }

    if (!editForm.type) {
      showAlert("Please select a ticket type.", "error");
      return;
    }

    try {
      setIsSubmittingEdit(true);

      await updateEventTicket({
        eventTicketId: editForm.eventTicketId,
        type: editForm.type,
        perks: editForm.perks.trim(),
        price: Number(editForm.price),
        quantityAvailable: Number(editForm.quantityAvailable),
      });

      showAlert("Event ticket updated successfully.", "success");
      setEditingTicket(null);
      setEditForm(initialEditForm);
      await loadTickets();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to update event ticket.";
      showAlert(msg, "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const getSoldPercentage = (ticket: EventTicketItem) => {
    const total = ticket.quantitySold + ticket.quantityAvailable;
    if (total === 0) return 0;
    return Math.round((ticket.quantitySold / total) * 100);
  };

  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "upcoming") return "upcoming";
    if (normalized === "completed") return "completed";
    if (normalized === "cancelled") return "cancelled";
    return "default";
  };

  const isCreateDisabled =
    isNamesLoading ||
    isTicketTypesLoading ||
    eventNames.length === 0 ||
    ticketTypes.length === 0;

  return (
    <>
      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />

      <div className="page-shell">
        <div className="page-header event-tickets-header-row">
          <div>
            <h2 className="page-title">Event Tickets</h2>
            <p className="page-subtitle">
              Manage ticket pricing, perks, and quantities for your events.
            </p>
          </div>

          <button
            type="button"
            className="event-tickets-primary-btn"
            onClick={openCreateModal}
            disabled={isCreateDisabled}
          >
            <Plus size={19} />
            <span>Add Event Ticket</span>
          </button>
        </div>

        {isPageLoading ? (
          <div className="surface-card event-tickets-state-card">
            <div className="event-tickets-loading">
              <LoaderCircle size={22} className="spin-icon" />
              <span>Loading event tickets...</span>
            </div>
          </div>
        ) : groupedTickets.length === 0 ? (
          <div className="surface-card event-tickets-empty-card">
            <div className="event-tickets-empty-icon">
              <Ticket size={28} />
            </div>
            <h3>No event tickets found</h3>
            <p>You have not created any tickets for your events yet.</p>
          </div>
        ) : (
          groupedTickets.map((group) => (
            <div className="event-tickets-event-section" key={`${group.eventId}-${group.eventName}`}>
              <div className="page-header event-tickets-group-header">
                <div className="event-tickets-group-title-wrap">
                  <h3 className="event-tickets-group-title">{group.eventName}</h3>
                  <span className={`event-tickets-event-status ${getStatusClass(group.eventStatus)}`}>
                    {group.eventStatus}
                  </span>
                </div>
              </div>

              <div className="event-tickets-grid">
                {group.tickets.map((ticket) => {
                  const soldPercentage = getSoldPercentage(ticket);

                  return (
                    <div className="surface-card event-ticket-card" key={ticket.eventTicketId}>
                      <div className="event-ticket-card-top">
                        <span className="event-ticket-type">{ticket.ticketType}</span>
                        <span className="event-ticket-price">${Number(ticket.price).toFixed(2)}</span>
                      </div>

                      <p className="event-ticket-event-name">{ticket.eventName}</p>

                      <p className="event-ticket-perks">
                        <strong>Perks:</strong> {ticket.perks}
                      </p>

                      <div className="event-ticket-stats-grid">
                        <div className="event-ticket-stat-box">
                          <span className="event-ticket-stat-label">Sold</span>
                          <span className="event-ticket-stat-value">{ticket.quantitySold}</span>
                        </div>

                        <div className="event-ticket-stat-box">
                          <span className="event-ticket-stat-label">Available</span>
                          <span className="event-ticket-stat-value">{ticket.quantityAvailable}</span>
                        </div>
                      </div>

                      <div className="event-ticket-progress-wrap">
                        <div className="event-ticket-progress-bar">
                          <div
                            className="event-ticket-progress-fill"
                            style={{ width: `${soldPercentage}%` }}
                          />
                        </div>
                        <div className="event-ticket-progress-text">{soldPercentage}% sold</div>
                      </div>

                      <button
                        type="button"
                        className="event-ticket-edit-btn"
                        onClick={() => openEditModal(ticket)}
                      >
                        <Pencil size={16} />
                        <span>Edit</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {isCreateModalOpen && (
        <div className="event-tickets-modal-overlay" onClick={closeCreateModal}>
          <div className="event-tickets-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-tickets-modal-header">
              <div>
                <h3>Create Event Ticket</h3>
                <p>Add a new ticket for one of your events.</p>
              </div>

              <button
                type="button"
                className="event-tickets-close-btn"
                onClick={closeCreateModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="event-tickets-form" onSubmit={handleCreateTicket}>
              <div className="event-tickets-form-grid">
                <div className="event-tickets-field">
                  <label htmlFor="eventName">Event Name</label>
                  <select
                    id="eventName"
                    name="eventName"
                    value={createForm.eventName}
                    onChange={handleCreateChange}
                    required
                  >
                    {eventNames.map((eventItem) => (
                      <option key={eventItem.name} value={eventItem.name}>
                        {eventItem.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="event-tickets-field">
                  <label htmlFor="type">Ticket Type</label>
                  <select
                    id="type"
                    name="type"
                    value={createForm.type}
                    onChange={handleCreateChange}
                    required
                  >
                    {ticketTypes.map((ticketType) => (
                      <option key={ticketType.name} value={ticketType.name}>
                        {ticketType.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="event-tickets-field">
                  <label htmlFor="price">Price</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={createForm.price}
                    onChange={handleCreateChange}
                    placeholder="Enter ticket price"
                    required
                  />
                </div>

                <div className="event-tickets-field">
                  <label htmlFor="quantityAvailable">Quantity Available</label>
                  <input
                    id="quantityAvailable"
                    name="quantityAvailable"
                    type="number"
                    min="0"
                    step="1"
                    value={createForm.quantityAvailable}
                    onChange={handleCreateChange}
                    placeholder="Enter available quantity"
                    required
                  />
                </div>

                <div className="event-tickets-field event-tickets-field-full">
                  <label htmlFor="perks">Perks</label>
                  <textarea
                    id="perks"
                    name="perks"
                    rows={4}
                    value={createForm.perks}
                    onChange={handleCreateChange}
                    placeholder="Describe ticket perks"
                    required
                  />
                </div>
              </div>

              <div className="event-tickets-modal-actions">
                <button
                  type="button"
                  className="event-tickets-cancel-btn"
                  onClick={closeCreateModal}
                  disabled={isSubmittingCreate}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="event-tickets-primary-btn"
                  disabled={isSubmittingCreate}
                >
                  {isSubmittingCreate ? (
                    <>
                      <LoaderCircle size={18} className="spin-icon" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Create</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTicket && (
        <div className="event-tickets-modal-overlay" onClick={closeEditModal}>
          <div className="event-tickets-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-tickets-modal-header">
              <div>
                <h3>Edit Event Ticket</h3>
                <p>Update ticket information for {editingTicket.eventName}.</p>
              </div>

              <button
                type="button"
                className="event-tickets-close-btn"
                onClick={closeEditModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="event-tickets-form" onSubmit={handleUpdateTicket}>
              <div className="event-tickets-form-grid">
                <div className="event-tickets-field">
                  <label htmlFor="edit-type">Ticket Type</label>
                  <select
                    id="edit-type"
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    required
                  >
                    {ticketTypes.map((ticketType) => (
                      <option key={ticketType.name} value={ticketType.name}>
                        {ticketType.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="event-tickets-field">
                  <label htmlFor="edit-price">Price</label>
                  <input
                    id="edit-price"
                    name="price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={editForm.price}
                    onChange={handleEditChange}
                    placeholder="Enter ticket price"
                    required
                  />
                </div>

                <div className="event-tickets-field">
                  <label htmlFor="edit-quantityAvailable">Quantity Available</label>
                  <input
                    id="edit-quantityAvailable"
                    name="quantityAvailable"
                    type="number"
                    min="0"
                    step="1"
                    value={editForm.quantityAvailable}
                    onChange={handleEditChange}
                    placeholder="Enter available quantity"
                    required
                  />
                </div>

                <div className="event-tickets-field event-tickets-field-full">
                  <label htmlFor="edit-perks">Perks</label>
                  <textarea
                    id="edit-perks"
                    name="perks"
                    rows={4}
                    value={editForm.perks}
                    onChange={handleEditChange}
                    placeholder="Describe ticket perks"
                    required
                  />
                </div>
              </div>

              <div className="event-tickets-modal-actions">
                <button
                  type="button"
                  className="event-tickets-cancel-btn"
                  onClick={closeEditModal}
                  disabled={isSubmittingEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="event-tickets-primary-btn"
                  disabled={isSubmittingEdit}
                >
                  {isSubmittingEdit ? (
                    <>
                      <LoaderCircle size={18} className="spin-icon" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Update</span>
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

export default EventTickets;