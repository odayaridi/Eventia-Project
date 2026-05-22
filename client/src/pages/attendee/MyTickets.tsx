
import React, { useEffect, useMemo, useState } from "react";
import {
  Ticket,
  Download,
  Wallet,
  QrCode,
  CircleAlert,
  CalendarDays,
  Clock3,
  Building2,
  LoaderCircle,
} from "lucide-react";
import "./MyTickets.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getAttendeeBookingTickets,
  type AttendeeBookingTicketItem,
  type BookingSingleTicketQrItem,
} from "../../api/attendeeApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

type GroupedTickets = Record<string, AttendeeBookingTicketItem[]>;

const formatPrice = (price: string | number) => {
  const parsed = Number(price);
  if (Number.isNaN(parsed)) return `$${price}`;
  return `$${parsed.toFixed(2)}`;
};

const sanitizeFileName = (value: string) =>
  (value || "ticket").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

const formatPurchased = (value?: string) => {
  if (!value) return "N/A";
  return value;
};

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number
) => {
  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }
};

const fitText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fallback = "..."
) => {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let trimmed = text;
  while (trimmed.length > 0 && ctx.measureText(trimmed + fallback).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed + fallback;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string
) {
  ctx.save();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  stroke: string,
  lineWidth = 1
) {
  ctx.save();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function fillTopRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string
) {
  ctx.save();
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function fillBottomRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string
) {
  ctx.save();
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

const drawInfoBox = (
  ctx: CanvasRenderingContext2D,
  options: {
    x: number;
    y: number;
    width: number;
    height?: number;
    label: string;
    value: string;
  }
) => {
  const { x, y, width, label, value } = options;
  const height = options.height ?? 72;

  fillRoundRect(ctx, x, y, width, height, 14, "#f8fafc");
  strokeRoundRect(ctx, x, y, width, height, 14, "#d7dee8", 1);

  ctx.save();
  ctx.textAlign = "left";

  ctx.font = "700 10px Inter, Arial, sans-serif";
  ctx.fillStyle = "#94a3b8";
  drawText(ctx, label, x + 14, y + 21, width - 28);

  ctx.font = "800 14px Inter, Arial, sans-serif";
  ctx.fillStyle = "#0f172a";
  const fittedValue = fitText(ctx, value || "N/A", width - 28);
  drawText(ctx, fittedValue, x + 14, y + 49, width - 28);

  ctx.restore();
};

const drawSingleTicketImage = async (
  ticketGroup: AttendeeBookingTicketItem,
  singleTicket: BookingSingleTicketQrItem,
  ticketIndex: number
): Promise<string> => {
  const W = 700;
  const H = 1080;
  const SCALE = 2;

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";

  // Page background
  ctx.fillStyle = "#eef2f7";
  ctx.fillRect(0, 0, W, H);

  // Main ticket card
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.16)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  fillRoundRect(ctx, 32, 32, W - 64, H - 64, 28, "#ffffff");
  ctx.restore();

  // Header
  fillTopRoundedRect(ctx, 32, 32, W - 64, 136, 28, "#f97316");
  ctx.fillStyle = "#ea580c";
  ctx.fillRect(32, 166, W - 64, 3);

  // Header brand
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "900 36px Inter, Arial, sans-serif";
  drawText(ctx, "Eventia", 70, 112);
  ctx.restore();

  // Ticket type top-right
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.textAlign = "right";
  ctx.font = "800 20px Inter, Arial, sans-serif";
  const topType = `${(ticketGroup.ticketType || "Ticket").toUpperCase()} TICKET`;
  drawText(ctx, topType, W - 70, 112);
  ctx.restore();

  // Event heading
  ctx.save();
  ctx.textAlign = "left";

  ctx.font = "700 14px Inter, Arial, sans-serif";
  ctx.fillStyle = "#64748b";
  drawText(ctx, "EVENT NAME", 70, 198);

  ctx.font = "900 22px Inter, Arial, sans-serif";
  ctx.fillStyle = "#0f172a";
  const eventName = fitText(ctx, ticketGroup.eventName || "Event", W - 140);
  drawText(ctx, eventName, 70, 228);

  ctx.restore();

  // Info boxes
  const row1Y = 260;
  const row2Y = 348;

  drawInfoBox(ctx, {
    x: 70,
    y: row1Y,
    width: 180,
    label: "DATE",
    value: ticketGroup.eventDate || "N/A",
  });

  drawInfoBox(ctx, {
    x: 262,
    y: row1Y,
    width: 240,
    label: "TIME",
    value: ticketGroup.eventTime || "N/A",
  });

  drawInfoBox(ctx, {
    x: 514,
    y: row1Y,
    width: 116,
    label: "VENUE",
    value: ticketGroup.venueName || "N/A",
  });

  drawInfoBox(ctx, {
    x: 70,
    y: row2Y,
    width: 150,
    label: "PRICE",
    value: formatPrice(ticketGroup.price),
  });

  drawInfoBox(ctx, {
    x: 232,
    y: row2Y,
    width: 150,
    label: "TICKET",
    value: `#${ticketIndex} of ${ticketGroup.quantity}`,
  });

  drawInfoBox(ctx, {
    x: 394,
    y: row2Y,
    width: 236,
    label: "PURCHASED",
    value: formatPurchased(singleTicket.purchased),
  });

  // Divider with notches
  const dividerY = 470;

  ctx.save();
  ctx.fillStyle = "#eef2f7";
  ctx.beginPath();
  ctx.arc(32, dividerY, 20, Math.PI * 1.5, Math.PI * 0.5);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#eef2f7";
  ctx.beginPath();
  ctx.arc(W - 32, dividerY, 20, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.setLineDash([7, 7]);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, dividerY);
  ctx.lineTo(W - 56, dividerY);
  ctx.stroke();
  ctx.restore();

  // QR section label
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "700 12px Inter, Arial, sans-serif";
  ctx.fillStyle = "#94a3b8";
  drawText(ctx, "SCAN QR CODE AT ENTRANCE", W / 2, 510);
  ctx.restore();

  // QR box
  const qrImg = await loadImage(singleTicket.qr);
  const qrSize = 236;
  const qrX = (W - qrSize) / 2;
  const qrY = 548;

  fillRoundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 22, "#ffffff");
  strokeRoundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 22, "#d7dee8", 1.5);

  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Ticket number
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 18px Inter, Arial, sans-serif";
  ctx.fillStyle = "#0f172a";
  // drawText(ctx, `Ticket #${singleTicket.ticketId}`, W / 2, qrY + qrSize + 72);
  ctx.restore();

  // Ticket type pill
  const pillW = 144;
  const pillH = 34;
  const pillX = (W - pillW) / 2;
  const pillY = qrY + qrSize + 95;

  fillRoundRect(ctx, pillX, pillY, pillW, pillH, 18, "#fff7ed");
  strokeRoundRect(ctx, pillX, pillY, pillW, pillH, 18, "#fdba74", 1);

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "800 13px Inter, Arial, sans-serif";
  ctx.fillStyle = "#f97316";
  drawText(ctx, (ticketGroup.ticketType || "TICKET").toUpperCase(), W / 2, pillY + 22);
  ctx.restore();

  // Footer
  fillBottomRoundedRect(ctx, 32, H - 108, W - 64, 76, 28, "#f7f1e8");

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "800 13px Inter, Arial, sans-serif";
  ctx.fillStyle = "#f97316";
  drawText(
    ctx,
    "eventia.com  •  Valid for one entry only  •  Non-transferable",
    W / 2,
    H - 68
  );
  ctx.restore();

  return canvas.toDataURL("image/png");
};

const MyTickets: React.FC = () => {
  const attendeeId = useMemo(() => {
    const raw = localStorage.getItem("attendeeId");
    return raw ? Number(raw) : null;
  }, []);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [tickets, setTickets] = useState<AttendeeBookingTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const groupedTickets = useMemo<GroupedTickets>(() => {
    return tickets.reduce<GroupedTickets>((acc, ticket) => {
      const eventKey = ticket.eventName || "Untitled Event";
      if (!acc[eventKey]) acc[eventKey] = [];
      acc[eventKey].push(ticket);
      return acc;
    }, {});
  }, [tickets]);

  const fetchTickets = async () => {
    if (!attendeeId) {
      setTickets([]);
      setIsLoading(false);
      showAlert("Attendee ID was not found. Please log in again.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const data = await getAttendeeBookingTickets(attendeeId);
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert(
        error instanceof Error ? error.message : "Failed to load tickets.",
        "error"
      );
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getSafeQrTickets = (
    ticket: AttendeeBookingTicketItem
  ): BookingSingleTicketQrItem[] => {
    return Array.isArray(ticket.tickets) ? ticket.tickets : [];
  };

  const handleDownload = async (ticketGroup: AttendeeBookingTicketItem) => {
    const qrTickets = getSafeQrTickets(ticketGroup);

    if (qrTickets.length === 0) {
      showAlert("No QR tickets found for this booking.", "error");
      return;
    }

    setDownloadingId(ticketGroup.bookingTicketId);

    try {
      for (let i = 0; i < qrTickets.length; i++) {
        const singleTicket = qrTickets[i];
        const dataUrl = await drawSingleTicketImage(ticketGroup, singleTicket, i + 1);

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${sanitizeFileName(ticketGroup.eventName)}-${sanitizeFileName(
          ticketGroup.ticketType
        )}-ticket-${i + 1}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (i < qrTickets.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      showAlert(
        qrTickets.length === 1
          ? "Ticket downloaded successfully."
          : `${qrTickets.length} tickets downloaded successfully.`,
        "success"
      );
    } catch {
      showAlert("Failed to download tickets. Please try again.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page-shell my-tickets-page">
      <div className="page-header">
        <h2 className="page-title">My Tickets</h2>
        <p className="page-subtitle">
          View your booked tickets, preview QR codes, and download each ticket as a professional image.
        </p>
      </div>

      {isLoading ? (
        <section className="surface-card tickets-state-card">
          <div className="tickets-loader" />
          <h3>Loading tickets...</h3>
          <p>Please wait while we fetch your booked tickets.</p>
        </section>
      ) : tickets.length === 0 ? (
        <section className="surface-card tickets-state-card">
          <div className="tickets-empty-icon">
            <CircleAlert size={22} />
          </div>
          <h3>No tickets found</h3>
          <p>You do not have any booked tickets yet.</p>
        </section>
      ) : (
        <div className="tickets-events-list">
          {Object.entries(groupedTickets).map(([eventName, eventTickets]) => (
            <section key={eventName} className="tickets-event-group">
              <div className="tickets-event-header">
                <h3 className="tickets-event-title">{eventName}</h3>
                <p className="tickets-event-subtitle">
                  Your booked ticket bundles for this event
                </p>
              </div>

              <div className="tickets-grid">
                {eventTickets.map((ticket) => {
                  const qrTickets = getSafeQrTickets(ticket);
                  const isSingle = qrTickets.length === 1;
                  const isBusy = downloadingId === ticket.bookingTicketId;

                  return (
                    <article
                      key={ticket.bookingTicketId}
                      className="surface-card ticket-card"
                    >
                      <div className="ticket-card-top">
                        <div className="ticket-type-badge">
                          <Ticket size={13} />
                          <span>{ticket.ticketType} Ticket</span>
                        </div>
                      </div>

                      <div className="ticket-main-info">
                        <div className="ticket-info-item ticket-info-item-full">
                          <span className="ticket-info-label">Event</span>
                          <span className="ticket-info-value ticket-info-strong">
                            {ticket.eventName || "N/A"}
                          </span>
                        </div>

                        <div className="ticket-info-item">
                          <span className="ticket-info-label">
                            <QrCode size={12} />
                            Quantity
                          </span>
                          <span className="ticket-info-value">{ticket.quantity}</span>
                        </div>

                        <div className="ticket-info-item">
                          <span className="ticket-info-label">
                            <Wallet size={12} />
                            Price
                          </span>
                          <span className="ticket-info-value">
                            {formatPrice(ticket.price)}
                          </span>
                        </div>

                        <div className="ticket-info-item">
                          <span className="ticket-info-label">
                            <CalendarDays size={12} />
                            Event Date
                          </span>
                          <span className="ticket-info-value">
                            {ticket.eventDate || "N/A"}
                          </span>
                        </div>

                        <div className="ticket-info-item">
                          <span className="ticket-info-label">
                            <Clock3 size={12} />
                            Event Time
                          </span>
                          <span className="ticket-info-value">
                            {ticket.eventTime || "N/A"}
                          </span>
                        </div>

                        <div className="ticket-info-item ticket-info-item-full">
                          <span className="ticket-info-label">
                            <Building2 size={12} />
                            Venue Name
                          </span>
                          <span className="ticket-info-value">
                            {ticket.venueName || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="ticket-qr-section">
                        <div className="ticket-qr-header">
                          <div className="ticket-qr-title">QR Codes</div>
                          <div className="ticket-qr-count">
                            {qrTickets.length} {qrTickets.length === 1 ? "ticket" : "tickets"}
                          </div>
                        </div>

                        <div
                          className={`ticket-qr-grid qr-count-${Math.min(
                            qrTickets.length || 1,
                            3
                          )}`}
                        >
                          {qrTickets.length > 0 ? (
                            qrTickets.map((singleTicket, index) => (
                              <div
                                key={singleTicket.ticketId}
                                className="ticket-qr-card"
                                // title={`Ticket #${singleTicket.ticketId}`}
                              >
                                {/* <div className="ticket-qr-index">Ticket #{index + 1}</div> */}
                                <div className="ticket-qr-box">
                                  <img
                                    src={singleTicket.qr}
                                    alt={`${ticket.eventName} QR ${index + 1}`}
                                    className="ticket-qr-image"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="ticket-no-qr">No QR tickets available</div>
                          )}
                        </div>
                      </div>

                      <div className="ticket-card-footer">
                        <button
                          type="button"
                          className="download-ticket-btn"
                          onClick={() => handleDownload(ticket)}
                          disabled={isBusy}
                        >
                          {isBusy ? (
                            <>
                              <LoaderCircle size={15} className="tickets-spin-icon" />
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <>
                              <Download size={15} />
                              <span>
                                {isSingle ? "Download Ticket" : "Download All Tickets"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </div>
  );
};

export default MyTickets;