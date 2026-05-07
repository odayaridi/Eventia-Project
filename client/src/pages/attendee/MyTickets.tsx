// import React, { useEffect, useMemo, useState } from "react";
// import { Ticket, Download, CalendarClock, Wallet, QrCode, CircleAlert } from "lucide-react";
// import jsPDF from "jspdf";
// import "./MyTickets.css";
// import { useAlert } from "../../hooks/useAlert";
// import {
//   getAttendeeBookingTickets,
//   type AttendeeBookingTicketItem,
// } from "../../api/attendeeApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";

// type GroupedTickets = Record<string, AttendeeBookingTicketItem[]>;

// const formatDate = (dateString: string) => {
//   if (!dateString) return "N/A";

//   const date = new Date(dateString);
//   if (Number.isNaN(date.getTime())) return dateString;

//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatPrice = (price: string | number) => {
//   const parsed = Number(price);
//   if (Number.isNaN(parsed)) return `$${price}`;
//   return `$${parsed.toFixed(2)}`;
// };

// const sanitizeFileName = (value: string) => {
//   return value.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
// };

// const MyTickets: React.FC = () => {
//   const attendeeId = useMemo(() => {
//     const raw = localStorage.getItem("attendeeId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const [tickets, setTickets] = useState<AttendeeBookingTicketItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const groupedTickets = useMemo<GroupedTickets>(() => {
//     return tickets.reduce<GroupedTickets>((acc, ticket) => {
//       const eventKey = ticket.eventName;
//       if (!acc[eventKey]) {
//         acc[eventKey] = [];
//       }
//       acc[eventKey].push(ticket);
//       return acc;
//     }, {});
//   }, [tickets]);

//   const fetchTickets = async () => {
//     if (!attendeeId) {
//       setTickets([]);
//       setIsLoading(false);
//       showAlert("Attendee id was not found. Please login again.", "error");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const data = await getAttendeeBookingTickets(attendeeId);
//       setTickets(data);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to load tickets.";
//       showAlert(errorMessage, "error");
//       setTickets([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   const downloadTicketPdf = (ticket: AttendeeBookingTicketItem) => {
//     try {
//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = pdf.internal.pageSize.getWidth();

//       pdf.setFillColor(248, 250, 252);
//       pdf.rect(0, 0, pageWidth, 297, "F");

//       pdf.setFillColor(255, 255, 255);
//       pdf.roundedRect(20, 30, 170, 105, 6, 6, "F");

//       pdf.setDrawColor(229, 231, 235);
//       pdf.roundedRect(20, 30, 170, 105, 6, 6, "S");

//       pdf.setFillColor(249, 115, 22);
//       pdf.roundedRect(20, 30, 170, 24, 6, 6, "F");
//       pdf.rect(20, 44, 170, 10, "F");

//       pdf.setTextColor(255, 255, 255);
//       pdf.setFont("helvetica", "bold");
//       pdf.setFontSize(16);
//       pdf.text("Eventia Ticket", 28, 41);

//       pdf.setFont("helvetica", "normal");
//       pdf.setFontSize(9);
//       pdf.text(ticket.ticketTypeName, 28, 48);

//       pdf.addImage(ticket.qrCode, "PNG", 145, 62, 28, 28);

//       pdf.setTextColor(15, 23, 42);
//       pdf.setFont("helvetica", "bold");
//       pdf.setFontSize(14);
//       pdf.text(ticket.eventName, 28, 64, { maxWidth: 100 });

//       const leftX = 28;
//       const rightX = 92;
//       let startY = 76;

//       const drawInfo = (
//         label: string,
//         value: string,
//         x: number,
//         y: number,
//         maxWidth = 48
//       ) => {
//         pdf.setFont("helvetica", "bold");
//         pdf.setFontSize(8);
//         pdf.setTextColor(100, 116, 139);
//         pdf.text(label.toUpperCase(), x, y);

//         pdf.setFont("helvetica", "bold");
//         pdf.setFontSize(10);
//         pdf.setTextColor(15, 23, 42);
//         const lines = pdf.splitTextToSize(value || "N/A", maxWidth);
//         pdf.text(lines, x, y + 6);
//       };

//       drawInfo("Event Date", formatDate(ticket.eventDate), leftX, startY);
//       drawInfo("Event Time", ticket.eventTime, rightX, startY, 45);

//       drawInfo("Venue Name", ticket.venueName, leftX, startY + 18);
//       drawInfo("Quantity", String(ticket.quantity), rightX, startY + 18);

//       drawInfo("Price", formatPrice(ticket.price), leftX, startY + 36);
//       drawInfo("Ticket Type", ticket.ticketTypeName, rightX, startY + 36);

//       drawInfo("Purchased", ticket.purchased, leftX, startY + 54, 112);

//       const fileName = `${sanitizeFileName(ticket.eventName)}-${
//         ticket.ticketTypeName
//       }-ticket.pdf`;

//       pdf.save(fileName);
//     } catch (error) {
//       showAlert("Failed to download ticket PDF.", "error");
//     }
//   };

//   return (
//     <div className="page-shell">
//       <div className="page-header">
//         <h1 className="page-title">My Tickets</h1>
//         <p className="page-subtitle">
//           View your booked tickets and download a professional PDF copy whenever you need it.
//         </p>
//       </div>

//       {isLoading ? (
//         <section className="surface-card tickets-state-card">
//           <div className="tickets-loader" />
//           <h3>Loading tickets...</h3>
//           <p>Please wait while we fetch your booked tickets.</p>
//         </section>
//       ) : tickets.length === 0 ? (
//         <section className="surface-card tickets-state-card">
//           <div className="tickets-empty-icon">
//             <CircleAlert size={22} />
//           </div>
//           <h3>No tickets found</h3>
//           <p>You do not have any booked tickets yet.</p>
//         </section>
//       ) : (
//         <div className="tickets-events-list">
//           {Object.entries(groupedTickets).map(([eventName, eventTickets]) => (
//             <section key={eventName} className="tickets-event-group">
//               <div className="tickets-event-header">
//                 <h2 className="tickets-event-title">{eventName}</h2>
        
//               </div>

//               <div className="tickets-grid">
//                 {eventTickets.map((ticket, index) => (
//                   <article
//                     key={`${ticket.eventName}-${ticket.ticketTypeName}-${ticket.purchased}-${index}`}
//                     className="surface-card ticket-card"
//                   >
//                     <div className="ticket-card-top">
//                       <div className="ticket-type-badge">
//                         <Ticket size={14} />
//                         <span>{ticket.ticketTypeName}</span>
//                       </div>
//                     </div>

//                     <div className="ticket-card-content">
//                       <div className="ticket-qr-box">
//                         <img
//                           src={ticket.qrCode}
//                           alt={`${ticket.eventName} QR Code`}
//                           className="ticket-qr-image"
//                         />
//                       </div>

//                       <div className="ticket-info-list">
//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">Event Name</span>
//                           <span className="ticket-info-value">{ticket.eventName}</span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <QrCode size={14} />
//                             Quantity
//                           </span>
//                           <span className="ticket-info-value">{ticket.quantity}</span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <Wallet size={14} />
//                             Price
//                           </span>
//                           <span className="ticket-info-value">
//                             {formatPrice(ticket.price)}
//                           </span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <Ticket size={14} />
//                             Ticket Type
//                           </span>
//                           <span className="ticket-info-value">
//                             {ticket.ticketTypeName}
//                           </span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <CalendarClock size={14} />
//                             Purchased
//                           </span>
//                           <span className="ticket-info-value">{ticket.purchased}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="ticket-card-footer">
//                       <button
//                         type="button"
//                         className="download-ticket-btn"
//                         onClick={() => downloadTicketPdf(ticket)}
//                       >
//                         <Download size={15} />
//                         <span>Download Ticket</span>
//                       </button>
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             </section>
//           ))}
//         </div>
//       )}

//       <AlertSnackbar
//         open={open}
//         message={message}
//         severity={severity}
//         onClose={handleClose}
//       />
//     </div>
//   );
// };

// export default MyTickets;

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Ticket,
//   Download,
//   Wallet,
//   QrCode,
//   CircleAlert,
//   CalendarDays,
//   Clock3,
//   Building2,
// } from "lucide-react";
// import "./MyTickets.css";
// import { useAlert } from "../../hooks/useAlert";
// import {
//   getAttendeeBookingTickets,
//   type AttendeeBookingTicketItem,
//   type BookingSingleTicketQrItem,
// } from "../../api/attendeeApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";

// type GroupedTickets = Record<string, AttendeeBookingTicketItem[]>;

// const formatPrice = (price: string | number) => {
//   const parsed = Number(price);
//   if (Number.isNaN(parsed)) return `$${price}`;
//   return `$${parsed.toFixed(2)}`;
// };

// const sanitizeFileName = (value: string) => {
//   return value.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
// };

// const formatPurchased = (value?: string) => {
//   if (!value) return "N/A";
//   return value;
// };

// const loadImage = (src: string): Promise<HTMLImageElement> => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.onload = () => resolve(img);
//     img.onerror = () => reject(new Error("Failed to load image"));
//     img.src = src;
//   });
// };

// const drawRoundedRect = (
//   ctx: CanvasRenderingContext2D,
//   x: number,
//   y: number,
//   width: number,
//   height: number,
//   radius: number
// ) => {
//   ctx.beginPath();
//   ctx.moveTo(x + radius, y);
//   ctx.lineTo(x + width - radius, y);
//   ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
//   ctx.lineTo(x + width, y + height - radius);
//   ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
//   ctx.lineTo(x + radius, y + height);
//   ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
//   ctx.lineTo(x, y + radius);
//   ctx.quadraticCurveTo(x, y, x + radius, y);
//   ctx.closePath();
// };

// const fillRoundedRect = (
//   ctx: CanvasRenderingContext2D,
//   x: number,
//   y: number,
//   width: number,
//   height: number,
//   radius: number,
//   fillStyle: string
// ) => {
//   ctx.save();
//   drawRoundedRect(ctx, x, y, width, height, radius);
//   ctx.fillStyle = fillStyle;
//   ctx.fill();
//   ctx.restore();
// };

// const strokeRoundedRect = (
//   ctx: CanvasRenderingContext2D,
//   x: number,
//   y: number,
//   width: number,
//   height: number,
//   radius: number,
//   strokeStyle: string,
//   lineWidth = 1
// ) => {
//   ctx.save();
//   drawRoundedRect(ctx, x, y, width, height, radius);
//   ctx.strokeStyle = strokeStyle;
//   ctx.lineWidth = lineWidth;
//   ctx.stroke();
//   ctx.restore();
// };

// const drawText = (
//   ctx: CanvasRenderingContext2D,
//   text: string,
//   x: number,
//   y: number,
//   options?: {
//     font?: string;
//     color?: string;
//     align?: CanvasTextAlign;
//     maxWidth?: number;
//   }
// ) => {
//   ctx.save();
//   ctx.font = options?.font ?? "600 18px Inter, Arial, sans-serif";
//   ctx.fillStyle = options?.color ?? "#0f172a";
//   ctx.textAlign = options?.align ?? "left";
//   if (options?.maxWidth) {
//     ctx.fillText(text, x, y, options.maxWidth);
//   } else {
//     ctx.fillText(text, x, y);
//   }
//   ctx.restore();
// };

// const drawInfoBox = (
//   ctx: CanvasRenderingContext2D,
//   label: string,
//   value: string,
//   x: number,
//   y: number,
//   width: number,
//   height: number
// ) => {
//   fillRoundedRect(ctx, x, y, width, height, 20, "#f8fafc");
//   strokeRoundedRect(ctx, x, y, width, height, 20, "#e2e8f0", 1);

//   drawText(ctx, label.toUpperCase(), x + 18, y + 28, {
//     font: "800 16px Inter, Arial, sans-serif",
//     color: "#64748b",
//   });

//   drawText(ctx, value || "N/A", x + 18, y + 64, {
//     font: "800 24px Inter, Arial, sans-serif",
//     color: "#0f172a",
//     maxWidth: width - 36,
//   });
// };

// const MyTickets: React.FC = () => {
//   const attendeeId = useMemo(() => {
//     const raw = localStorage.getItem("attendeeId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const [tickets, setTickets] = useState<AttendeeBookingTicketItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [downloadingId, setDownloadingId] = useState<number | null>(null);

//   const groupedTickets = useMemo<GroupedTickets>(() => {
//     return tickets.reduce<GroupedTickets>((acc, ticket) => {
//       const eventKey = ticket.eventName || "Untitled Event";
//       if (!acc[eventKey]) {
//         acc[eventKey] = [];
//       }
//       acc[eventKey].push(ticket);
//       return acc;
//     }, {});
//   }, [tickets]);

//   const fetchTickets = async () => {
//     if (!attendeeId) {
//       setTickets([]);
//       setIsLoading(false);
//       showAlert("Attendee id was not found. Please login again.", "error");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const data = await getAttendeeBookingTickets(attendeeId);
//       setTickets(Array.isArray(data) ? data : []);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to load tickets.";
//       showAlert(errorMessage, "error");
//       setTickets([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   const downloadAllTicketsAsImage = async (
//     ticketGroup: AttendeeBookingTicketItem
//   ) => {
//     try {
//       const qrTickets = Array.isArray(ticketGroup.tickets)
//         ? ticketGroup.tickets
//         : [];

//       if (qrTickets.length === 0) {
//         showAlert("No QR tickets found for this booking.", "error");
//         return;
//       }

//       setDownloadingId(ticketGroup.bookingTicketId);

//       const columns = qrTickets.length === 1 ? 1 : qrTickets.length === 2 ? 2 : 3;
//       const qrCardWidth = 290;
//       const qrCardHeight = 330;
//       const qrGap = 24;
//       const canvasWidth = 1100;
//       const headerHeight = 132;
//       const infoSectionHeight = 290;
//       const gridStartY = 510;

//       const gridRows = Math.ceil(qrTickets.length / columns);
//       const canvasHeight =
//         gridStartY +
//         gridRows * qrCardHeight +
//         (gridRows - 1) * qrGap +
//         56;

//       const canvas = document.createElement("canvas");
//       canvas.width = canvasWidth;
//       canvas.height = canvasHeight;

//       const ctx = canvas.getContext("2d");
//       if (!ctx) {
//         throw new Error("Canvas is not supported");
//       }

//       ctx.fillStyle = "#f1f5f9";
//       ctx.fillRect(0, 0, canvasWidth, canvasHeight);

//       fillRoundedRect(ctx, 40, 30, canvasWidth - 80, headerHeight, 24, "#f97316");

//       drawText(ctx, "Eventia Tickets", 76, 93, {
//         font: "800 46px Inter, Arial, sans-serif",
//         color: "#ffffff",
//       });

//       drawText(ctx, `${ticketGroup.ticketType} Ticket Bundle`, canvasWidth - 76, 93, {
//         font: "500 28px Inter, Arial, sans-serif",
//         color: "#ffffff",
//         align: "right",
//       });

//       fillRoundedRect(ctx, 40, 196, canvasWidth - 80, 250, 24, "#ffffff");
//       strokeRoundedRect(ctx, 40, 196, canvasWidth - 80, 250, 24, "#dbe3ec", 2);

//       drawInfoBox(ctx, "Event", ticketGroup.eventName, 70, 226, 220, 84);
//       drawInfoBox(ctx, "Event Date", ticketGroup.eventDate || "N/A", 310, 226, 220, 84);
//       drawInfoBox(ctx, "Event Time", ticketGroup.eventTime || "N/A", 550, 226, 220, 84);
//       drawInfoBox(
//         ctx,
//         "Quantity",
//         String(ticketGroup.quantity ?? qrTickets.length),
//         790,
//         226,
//         220,
//         84
//       );

//       drawInfoBox(ctx, "Venue Name", ticketGroup.venueName || "N/A", 70, 332, 360, 84);
//       drawInfoBox(ctx, "Price", formatPrice(ticketGroup.price), 450, 332, 180, 84);
//       drawInfoBox(
//         ctx,
//         "Purchased",
//         formatPurchased(qrTickets[0]?.purchased),
//         650,
//         332,
//         360,
//         84
//       );

//       drawText(ctx, "QR Codes", 70, 482, {
//         font: "800 30px Inter, Arial, sans-serif",
//         color: "#0f172a",
//       });

//       const totalGridWidth =
//         columns * qrCardWidth + (columns - 1) * qrGap;
//       const startX = (canvasWidth - totalGridWidth) / 2;

//       const loadedImages = await Promise.all(
//         qrTickets.map(async (item) => ({
//           ...item,
//           image: await loadImage(item.qr),
//         }))
//       );

//       loadedImages.forEach((item, index) => {
//         const row = Math.floor(index / columns);
//         const col = index % columns;

//         const x = startX + col * (qrCardWidth + qrGap);
//         const y = gridStartY + row * (qrCardHeight + qrGap);

//         fillRoundedRect(ctx, x, y, qrCardWidth, qrCardHeight, 22, "#ffffff");
//         strokeRoundedRect(ctx, x, y, qrCardWidth, qrCardHeight, 22, "#dbe3ec", 2);

//         drawText(ctx, `Ticket #${item.ticketId}`, x + 24, y + 36, {
//           font: "800 20px Inter, Arial, sans-serif",
//           color: "#64748b",
//         });

//         fillRoundedRect(ctx, x + 49, y + 60, 192, 192, 16, "#f8fafc");
//         strokeRoundedRect(ctx, x + 49, y + 60, 192, 192, 16, "#e2e8f0", 1);

//         ctx.drawImage(item.image, x + 65, y + 76, 160, 160);

//         drawText(ctx, ticketGroup.ticketType, x + qrCardWidth / 2, y + 288, {
//           font: "800 25px Inter, Arial, sans-serif",
//           color: "#0f172a",
//           align: "center",
//         });
//       });

//       const link = document.createElement("a");
//       link.href = canvas.toDataURL("image/png");
//       link.download = `${sanitizeFileName(ticketGroup.eventName)}-${sanitizeFileName(
//         ticketGroup.ticketType
//       )}-tickets.png`;
//       link.click();

//       showAlert("Tickets image downloaded successfully.", "success");
//     } catch (error) {
//       showAlert("Failed to download tickets image.", "error");
//     } finally {
//       setDownloadingId(null);
//     }
//   };

//   const getSafeQrTickets = (
//     ticket: AttendeeBookingTicketItem
//   ): BookingSingleTicketQrItem[] => {
//     return Array.isArray(ticket.tickets) ? ticket.tickets : [];
//   };

//   return (
//     <div className="page-shell">
//       <div className="page-header">
//         <h1 className="page-title">My Tickets</h1>
//         <p className="page-subtitle">
//           View your booked ticket bundles, review QR codes, and download them as a professional image.
//         </p>
//       </div>

//       {isLoading ? (
//         <section className="surface-card tickets-state-card">
//           <div className="tickets-loader" />
//           <h3>Loading tickets...</h3>
//           <p>Please wait while we fetch your booked tickets.</p>
//         </section>
//       ) : tickets.length === 0 ? (
//         <section className="surface-card tickets-state-card">
//           <div className="tickets-empty-icon">
//             <CircleAlert size={22} />
//           </div>
//           <h3>No tickets found</h3>
//           <p>You do not have any booked tickets yet.</p>
//         </section>
//       ) : (
//         <div className="tickets-events-list">
//           {Object.entries(groupedTickets).map(([eventName, eventTickets]) => (
//             <section key={eventName} className="tickets-event-group">
//               <div className="tickets-event-header">
//                 <h2 className="tickets-event-title">{eventName}</h2>
//               </div>

//               <div className="tickets-grid">
//                 {eventTickets.map((ticket) => {
//                   const qrTickets = getSafeQrTickets(ticket);

//                   return (
//                     <article
//                       key={ticket.bookingTicketId}
//                       className="surface-card ticket-card"
//                     >
//                       <div className="ticket-card-top">
//                         <div className="ticket-type-badge">
//                           <Ticket size={13} />
//                           <span>{ticket.ticketType} Ticket</span>
//                         </div>
//                       </div>

//                       <div className="ticket-main-info">
//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">Event</span>
//                           <span className="ticket-info-value">{ticket.eventName}</span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <QrCode size={13} />
//                             Quantity
//                           </span>
//                           <span className="ticket-info-value">{ticket.quantity}</span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <CalendarDays size={13} />
//                             Event Date
//                           </span>
//                           <span className="ticket-info-value">
//                             {ticket.eventDate || "N/A"}
//                           </span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <Clock3 size={13} />
//                             Event Time
//                           </span>
//                           <span className="ticket-info-value">
//                             {ticket.eventTime || "N/A"}
//                           </span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <Building2 size={13} />
//                             Venue Name
//                           </span>
//                           <span className="ticket-info-value">
//                             {ticket.venueName || "N/A"}
//                           </span>
//                         </div>

//                         <div className="ticket-info-item">
//                           <span className="ticket-info-label">
//                             <Wallet size={13} />
//                             Price
//                           </span>
//                           <span className="ticket-info-value">
//                             {formatPrice(ticket.price)}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="ticket-qr-section">
//                         <div className="ticket-qr-title">QR Codes</div>

//                         <div className={`ticket-qr-grid qr-count-${Math.min(qrTickets.length || 1, 3)}`}>
//                           {qrTickets.length > 0 ? (
//                             qrTickets.map((singleTicket, index) => (
//                               <div
//                                 key={singleTicket.ticketId}
//                                 className="ticket-qr-card"
//                                 title={`Ticket #${singleTicket.ticketId}`}
//                               >
//                                 <div className="ticket-qr-index">#{index + 1}</div>

//                                 <div className="ticket-qr-box">
//                                   <img
//                                     src={singleTicket.qr}
//                                     alt={`${ticket.eventName} QR ${index + 1}`}
//                                     className="ticket-qr-image"
//                                   />
//                                 </div>
//                               </div>
//                             ))
//                           ) : (
//                             <div className="ticket-no-qr">No QR tickets available</div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="ticket-card-footer">
//                         <button
//                           type="button"
//                           className="download-ticket-btn"
//                           onClick={() => downloadAllTicketsAsImage(ticket)}
//                           disabled={downloadingId === ticket.bookingTicketId}
//                         >
//                           <Download size={15} />
//                           <span>
//                             {downloadingId === ticket.bookingTicketId
//                               ? "Downloading..."
//                               : "Download All Tickets"}
//                           </span>
//                         </button>
//                       </div>
//                     </article>
//                   );
//                 })}
//               </div>
//             </section>
//           ))}
//         </div>
//       )}

//       <AlertSnackbar
//         open={open}
//         message={message}
//         severity={severity}
//         onClose={handleClose}
//       />
//     </div>
//   );
// };

// export default MyTickets;






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