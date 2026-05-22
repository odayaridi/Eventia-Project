import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Building2,
  Tag,
  Users,
  ImageOff,
  Ticket,
  Minus,
  Plus,
  ShoppingCart,
  LoaderCircle,
  Armchair,
} from "lucide-react";
import "./EventDetails.css";
import type { EventResult, EventTicket } from "../../api/attendeeApi";
import { createCheckoutSession } from "../../api/attendeeApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: string): string => {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time: string): string => {
  if (!time) return "";
  const [hours = "0", minutes = "0"] = time.split(":");
  const d = new Date();
  d.setHours(Number(hours), Number(minutes), 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ─── Ticket Card ──────────────────────────────────────────────────────────────

interface TicketCardProps {
  ticket: EventTicket;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  quantity,
  onIncrease,
  onDecrease,
}) => {
  const isSoldOut = ticket.remainingTickets <= 0;
  const isSelected = quantity > 0;

  return (
    <div
      className={[
        "ed-ticket-card",
        isSoldOut ? "ed-ticket-sold-out" : "",
        isSelected ? "ed-ticket-selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="ed-ticket-top">
        <div className="ed-ticket-left">
          <div className="ed-ticket-type-badge">
            <Ticket size={12} />
            <span>{ticket.ticketTypeName}</span>
          </div>
          {ticket.eventTicketPerks && (
            <p className="ed-ticket-perks">{ticket.eventTicketPerks}</p>
          )}
        </div>
        <div className="ed-ticket-right">
          <span className="ed-ticket-price">
            ${parseFloat(ticket.ticketPrice).toFixed(2)}
          </span>
          <span className="ed-ticket-per">/ ticket</span>
        </div>
      </div>

      <div className="ed-ticket-bottom">
        <span className="ed-ticket-remaining">
          {isSoldOut ? (
            <span className="ed-sold-out-label">Sold out</span>
          ) : (
            `${ticket.remainingTickets.toLocaleString()} remaining`
          )}
        </span>

        <div className="ed-qty-control">
          <button
            type="button"
            className="ed-qty-btn"
            onClick={onDecrease}
            disabled={quantity === 0 || isSoldOut}
            aria-label="Decrease"
          >
            <Minus size={13} />
          </button>
          <span className="ed-qty-value">{quantity}</span>
          <button
            type="button"
            className="ed-qty-btn"
            onClick={onIncrease}
            disabled={quantity >= ticket.remainingTickets || isSoldOut}
            aria-label="Increase"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="ed-ticket-subtotal">
          <span>
            {quantity} × ${parseFloat(ticket.ticketPrice).toFixed(2)}
          </span>
          <strong>
            ${(quantity * parseFloat(ticket.ticketPrice)).toFixed(2)}
          </strong>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EventDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const event = location.state?.event as EventResult | undefined;

  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    if (!event) return {};
    return Object.fromEntries(event.tickets.map((t) => [t.eventTicketId, 0]));
  });

  const [imgError, setImgError] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  if (!event) {
    return (
      <div className="page-shell">
        <div className="ed-not-found">
          <div className="ed-not-found-icon">
            <CalendarDays size={28} />
          </div>
          <h3>Event not found</h3>
          <p>The event details could not be loaded. Please go back and try again.</p>
          <button
            type="button"
            className="ed-back-btn"
            onClick={() => navigate("/attendee/browse")}
          >
            <ArrowLeft size={15} />
            <span>Back to Browse</span>
          </button>
        </div>
      </div>
    );
  }

  const increase = (id: number, max: number) =>
    setQuantities((p) => ({ ...p, [id]: Math.min((p[id] ?? 0) + 1, max) }));

  const decrease = (id: number) =>
    setQuantities((p) => ({ ...p, [id]: Math.max((p[id] ?? 0) - 1, 0) }));

  const totalTickets = Object.values(quantities).reduce((s, q) => s + q, 0);
  const totalPrice = event.tickets.reduce((sum, t) => {
    return sum + (quantities[t.eventTicketId] ?? 0) * parseFloat(t.ticketPrice);
  }, 0);
  const hasSelection = totalTickets > 0;

  const handleBook = async () => {
    if (!hasSelection || isCheckingOut) return;

    const raw = localStorage.getItem("attendeeId");
    const attendeeId = raw ? Number(raw) : null;

    if (!attendeeId || Number.isNaN(attendeeId)) {
      showAlert("Attendee ID not found. Please log in again.", "error");
      return;
    }

    const ticketPayload = event.tickets
      .filter((t) => (quantities[t.eventTicketId] ?? 0) > 0)
      .map((t) => ({
        eventTicketId: t.eventTicketId,
        quantity: quantities[t.eventTicketId],
        ticketTypeName: t.ticketTypeName,
        ticketPrice: t.ticketPrice,
      }));

    try {
      setIsCheckingOut(true);

      const { url } = await createCheckoutSession({
        attendeeId,
        eventId: event.eventId,
        tickets: ticketPayload,
      });

      window.location.href = url;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to start checkout. Please try again.";
      showAlert(msg, "error");
      setIsCheckingOut(false);
    }
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
        <button
          type="button"
          className="ed-back-btn"
          onClick={() => navigate("/attendee/browse")}
        >
          <ArrowLeft size={15} />
          <span>Back to Browse</span>
        </button>

        <div className="surface-card ed-hero-card">
          <div className="ed-hero-img-wrap">
            {event.imageUrl && !imgError ? (
              <img
                src={event.imageUrl}
                alt={event.eventName}
                className="ed-hero-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="ed-hero-fallback">
                <ImageOff size={28} />
              </div>
            )}
          </div>

          <div className="ed-hero-info">
            <div className="ed-event-type-badge">
              <Tag size={12} />
              <span>{event.eventType}</span>
            </div>

            <h1 className="ed-event-name">{event.eventName}</h1>

            <div className="ed-hero-meta">
              <div className="ed-hero-meta-item">
                <CalendarDays size={15} />
                <span>{formatDate(event.eventDate)}</span>
              </div>

              <div className="ed-hero-meta-item">
                <Clock size={15} />
                <span>
                  {formatTime(event.startTime)} – {formatTime(event.endTime)}
                </span>
              </div>

              <div className="ed-hero-meta-item">
                <Building2 size={15} />
                <span>{event.venueName}</span>
              </div>

              <div className="ed-hero-meta-item">
                <Users size={15} />
                <span>{event.eventCapacity.toLocaleString()} capacity</span>
              </div>

              <div className="ed-hero-meta-item ed-left-seats-item">
                <Armchair size={15} />
                <span>{Number(event.seatsLeft ?? 0).toLocaleString()} seats left</span>
              </div>
            </div>

            {event.eventDescription && (
              <p className="ed-hero-description">{event.eventDescription}</p>
            )}
          </div>
        </div>

        <div className="surface-card ed-tickets-card">
          <div className="ed-tickets-section-header">
            <div className="ed-tickets-title-group">
              <Ticket size={18} />
              <h3>
                {event.tickets.length > 0 ? "Select Tickets" : "Tickets"}
              </h3>
            </div>

            {hasSelection && (
              <div className="ed-selection-pill">
                {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} · $
                {totalPrice.toFixed(2)}
              </div>
            )}
          </div>

          {event.tickets.length === 0 ? (
            <div className="ed-no-tickets">
              <Ticket size={22} />
              <p>No tickets available for this event.</p>
            </div>
          ) : (
            <>
              <div className="ed-tickets-grid">
                {event.tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.eventTicketId}
                    ticket={ticket}
                    quantity={quantities[ticket.eventTicketId] ?? 0}
                    onIncrease={() =>
                      increase(ticket.eventTicketId, ticket.remainingTickets)
                    }
                    onDecrease={() => decrease(ticket.eventTicketId)}
                  />
                ))}
              </div>

              <div className="ed-order-footer">
                <div className="ed-order-summary">
                  <div className="ed-order-row">
                    <span className="ed-order-label">Total tickets</span>
                    <span className="ed-order-val">{totalTickets}</span>
                  </div>
                  <div className="ed-order-row ed-order-row-total">
                    <span className="ed-order-label">Total price</span>
                    <span className="ed-order-price">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="ed-book-wrap">
                  <button
                    type="button"
                    className="ed-book-btn"
                    onClick={handleBook}
                    disabled={!hasSelection || isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <LoaderCircle size={17} className="ed-btn-spin" />
                        <span>Redirecting to payment...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={17} />
                        <span>
                          {hasSelection
                            ? `Book ${totalTickets} Ticket${totalTickets !== 1 ? "s" : ""}`
                            : "Select Tickets to Book"}
                        </span>
                      </>
                    )}
                  </button>

                  {!hasSelection && (
                    <p className="ed-book-note">
                      Select at least one ticket to continue.
                    </p>
                  )}

                  {hasSelection && (
                    <p className="ed-book-note">
                      You'll be redirected to Stripe's secure payment page.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EventDetails;