// import React, { useEffect, useMemo, useState } from "react";
// import {
//   CalendarDays,
//   MapPin,
//   Package,
//   Ticket,
//   Wallet,
//   RefreshCw,
//   CircleAlert,
//   Star,
//   X,
// } from "lucide-react";
// import "./MyBookings.css";
// import { useAlert } from "../../hooks/useAlert";
// import {
//   getAttendeeBookings,
//   sendEventFeedback,
//   checkAttendeeRated,
//   type AttendeeBookingItem,
// } from "../../api/attendeeApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";

// type BookingWithOptionalEventId = AttendeeBookingItem & {
//   eventId?: number;
//   hasRated?: boolean;
// };

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

// const parseEventTimeRange = (eventDate: string, eventTime: string) => {
//   if (!eventDate || !eventTime || !eventTime.includes(" - ")) {
//     return null;
//   }

//   const [startTime, endTime] = eventTime.split(" - ").map((item) => item.trim());

//   if (!startTime || !endTime) {
//     return null;
//   }

//   const start = new Date(`${eventDate}T${startTime}`);
//   const end = new Date(`${eventDate}T${endTime}`);

//   if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
//     return null;
//   }

//   // Handle events that cross midnight
//   if (end < start) {
//     end.setDate(end.getDate() + 1);
//   }

//   return { start, end };
// };

// const isRatingAllowedNow = (booking: BookingWithOptionalEventId) => {
//   const parsedRange = parseEventTimeRange(booking.eventDate, booking.eventTime);

//   if (!parsedRange) return false;

//   const now = new Date();

//   // Allow rating only after event ends
//   return now >= parsedRange.end;
// };

// const MyBookings: React.FC = () => {
//   const attendeeId = useMemo(() => {
//     const raw = localStorage.getItem("attendeeId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const [bookings, setBookings] = useState<BookingWithOptionalEventId[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const [selectedBooking, setSelectedBooking] = useState<BookingWithOptionalEventId | null>(null);
//   const [feedbackRating, setFeedbackRating] = useState(0);
//   const [feedbackComment, setFeedbackComment] = useState("");
//   const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
//   const [checkingBookingId, setCheckingBookingId] = useState<number | null>(null);

//   const totalBookings = bookings.length;

//   const totalTicketsBooked = bookings.reduce((sum, booking) => {
//     return (
//       sum +
//       booking.tickets.reduce((ticketSum, ticket) => ticketSum + Number(ticket.quantity || 0), 0)
//     );
//   }, 0);

//   const totalSpent = bookings.reduce((sum, booking) => {
//     return sum + Number(booking.totalPrice || 0);
//   }, 0);









//   const fetchBookings = async (showLoader = true) => {
//   if (!attendeeId) {
//     setBookings([]);
//     setIsLoading(false);
//     showAlert("Attendee id was not found. Please login again.", "error");
//     return;
//   }

//   try {
//     if (showLoader) {
//       setIsLoading(true);
//     } else {
//       setIsRefreshing(true);
//     }

//     const data = await getAttendeeBookings(attendeeId);

//     const normalizedBookings = await Promise.all(
//       (data as BookingWithOptionalEventId[]).map(async (booking) => {
//         const eventId = Number(booking.eventId);

//         if (!eventId || Number.isNaN(eventId)) {
//           return {
//             ...booking,
//             hasRated: Boolean(booking.hasRated),
//           };
//         }

//         try {
//           const ratingExists = await checkAttendeeRated({
//             attendeeId,
//             eventId,
//           });

//           return {
//             ...booking,
//             hasRated: ratingExists,
//           };
//         } catch {
//           return {
//             ...booking,
//             hasRated: Boolean(booking.hasRated),
//           };
//         }
//       })
//     );

//     setBookings(normalizedBookings);
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Failed to load bookings.";
//     showAlert(errorMessage, "error");
//     setBookings([]);
//   } finally {
//     setIsLoading(false);
//     setIsRefreshing(false);
//   }
// };






//   useEffect(() => {
//     fetchBookings(true);
//   }, []);

//   const markBookingAsRated = (bookingId: number) => {
//     setBookings((prev) =>
//       prev.map((booking) =>
//         booking.bookingId === bookingId
//           ? {
//               ...booking,
//               hasRated: true,
//             }
//           : booking
//       )
//     );
//   };

//   const verifyBookingNotRated = async (booking: BookingWithOptionalEventId) => {
//     if (!attendeeId) {
//       showAlert("Attendee id was not found. Please login again.", "error");
//       return false;
//     }

//     const eventId = Number(booking.eventId);

//     if (!eventId || Number.isNaN(eventId)) {
//       showAlert("Event id was not found in this booking response.", "error");
//       return false;
//     }

//     const alreadyMarkedLocally = Boolean(booking.hasRated);
//     if (alreadyMarkedLocally) {
//       showAlert("You have already rated this event.", "info");
//       return false;
//     }

//     try {
//       setCheckingBookingId(booking.bookingId);

//       const ratingExists = await checkAttendeeRated({
//         attendeeId,
//         eventId,
//       });

//       if (ratingExists) {
//         markBookingAsRated(booking.bookingId);
//         showAlert("You have already rated this event.", "info");
//         return false;
//       }

//       return true;
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to verify rating status.";
//       showAlert(errorMessage, "error");
//       return false;
//     } finally {
//       setCheckingBookingId(null);
//     }
//   };

//   const openFeedbackModal = async (booking: BookingWithOptionalEventId) => {
//     if (!isRatingAllowedNow(booking)) {
//       showAlert("You can rate this event only after it ends.", "warning");
//       return;
//     }

//     const canContinue = await verifyBookingNotRated(booking);
//     if (!canContinue) return;

//     setSelectedBooking(booking);
//     setFeedbackRating(0);
//     setFeedbackComment("");
//   };

//   const closeFeedbackModal = () => {
//     if (isSubmittingFeedback) return;
//     setSelectedBooking(null);
//     setFeedbackRating(0);
//     setFeedbackComment("");
//   };

//   const handleSubmitFeedback = async () => {
//     if (!selectedBooking) return;

//     if (!attendeeId) {
//       showAlert("Attendee id was not found. Please login again.", "error");
//       return;
//     }

//     const eventId = Number(selectedBooking.eventId);

//     if (!eventId || Number.isNaN(eventId)) {
//       showAlert("Event id was not found in this booking response.", "error");
//       return;
//     }

//     if (!isRatingAllowedNow(selectedBooking)) {
//       showAlert("You can rate this event only after it ends.", "warning");
//       return;
//     }

//     if (!feedbackRating) {
//       showAlert("Please select a rating before submitting.", "warning");
//       return;
//     }

//     if (feedbackComment.trim().length > 0 && feedbackComment.trim().length < 3) {
//       showAlert("Feedback comment must be at least 3 characters long.", "warning");
//       return;
//     }

//     // Final duplicate protection before sending
//     const canContinue = await verifyBookingNotRated(selectedBooking);
//     if (!canContinue) {
//       closeFeedbackModal();
//       return;
//     }

//     try {
//       setIsSubmittingFeedback(true);

//       await sendEventFeedback({
//         eventId,
//         attendeeId,
//         rating: feedbackRating,
//         comment: feedbackComment.trim(),
//       });

//       markBookingAsRated(selectedBooking.bookingId);

//       showAlert("Feedback sent successfully.", "success");
//       closeFeedbackModal();
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to send feedback.";
//       showAlert(errorMessage, "error");
//     } finally {
//       setIsSubmittingFeedback(false);
//     }
//   };

//   return (
//     <>
//       <div className="page-shell">
//         <div className="page-header">
//           <h1 className="page-title">My Bookings</h1>
//           <p className="page-subtitle">
//             View all your event bookings, ticket breakdowns, and total payments in one place.
//           </p>
//         </div>

//         <div className="stats-grid my-bookings-stats-grid">
//           <div className="surface-card booking-stat-card">
//             <div className="booking-stat-icon booking-stat-icon-orange">
//               <Package size={20} />
//             </div>
//             <div className="booking-stat-content">
//               <span className="booking-stat-label">Total Bookings</span>
//               <h3>{totalBookings}</h3>
//               <p>All bookings linked to your attendee account.</p>
//             </div>
//           </div>

//           <div className="surface-card booking-stat-card">
//             <div className="booking-stat-icon booking-stat-icon-blue">
//               <Ticket size={20} />
//             </div>
//             <div className="booking-stat-content">
//               <span className="booking-stat-label">Tickets Booked</span>
//               <h3>{totalTicketsBooked}</h3>
//               <p>Total ticket quantity across all bookings.</p>
//             </div>
//           </div>

//           <div className="surface-card booking-stat-card">
//             <div className="booking-stat-icon booking-stat-icon-green">
//               <Wallet size={20} />
//             </div>
//             <div className="booking-stat-content">
//               <span className="booking-stat-label">Total Spent</span>
//               <h3>{formatPrice(totalSpent)}</h3>
//               <p>Total amount paid for your bookings.</p>
//             </div>
//           </div>
//         </div>

//         <section className="surface-card bookings-section-card">
//           <div className="bookings-section-header">
//             <div>
//               <h2 className="bookings-section-title">Booking History</h2>
//               <p className="bookings-section-subtitle">
//                 Review your booked events and ticket details.
//               </p>
//             </div>

//             <button
//               type="button"
//               className="refresh-bookings-btn"
//               onClick={() => fetchBookings(false)}
//               disabled={isRefreshing}
//             >
//               <RefreshCw
//                 size={16}
//                 className={isRefreshing ? "refresh-icon spinning" : "refresh-icon"}
//               />
//               <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
//             </button>
//           </div>

//           {isLoading ? (
//             <div className="bookings-state-box">
//               <div className="bookings-loader" />
//               <h3>Loading bookings...</h3>
//               <p>Please wait while we fetch your booking history.</p>
//             </div>
//           ) : bookings.length === 0 ? (
//             <div className="bookings-state-box empty">
//               <div className="bookings-empty-icon">
//                 <CircleAlert size={22} />
//               </div>
//               <h3>No bookings found</h3>
//               <p>You have not booked any events yet.</p>
//             </div>
//           ) : (
//             <div className="bookings-list">
//               {bookings.map((booking) => {
//                 const alreadyRated = Boolean(booking.hasRated);
//                 const canRateNow = isRatingAllowedNow(booking);
//                 const isCheckingThisBooking = checkingBookingId === booking.bookingId;
//                 const isRateButtonDisabled =
//                   alreadyRated || !canRateNow || isCheckingThisBooking;

//                 return (
//                   <article key={booking.bookingId} className="booking-card">
//                     <div className="booking-card-top">
//                       <div className="booking-title-wrap">
//                         <h3 className="booking-event-name">{booking.eventName}</h3>

//                         <div className="booking-meta-row">
//                           <div className="booking-meta-pill">
//                             <CalendarDays size={15} />
//                             <span>{formatDate(booking.eventDate)}</span>
//                           </div>

//                           <div className="booking-meta-pill">
//                             <Ticket size={15} />
//                             <span>{booking.eventType}</span>
//                           </div>

//                           <div className="booking-meta-pill">
//                             <MapPin size={15} />
//                             <span>{booking.venueName}</span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="booking-total-box">
//                         <span className="booking-total-label">Total Paid</span>
//                         <strong className="booking-total-amount">
//                           {formatPrice(booking.totalPrice)}
//                         </strong>
//                       </div>
//                     </div>

//                     <div className="booking-details-grid">
//                       <div className="booking-detail-block">
//                         <span className="booking-detail-label">Event date</span>
//                         <span className="booking-detail-value">
//                           {formatDate(booking.eventDate)}
//                         </span>
//                       </div>

//                       <div className="booking-detail-block">
//                         <span className="booking-detail-label">Event time</span>
//                         <span className="booking-detail-value">{booking.eventTime}</span>
//                       </div>

//                       <div className="booking-detail-block">
//                         <span className="booking-detail-label">Venue</span>
//                         <span className="booking-detail-value">{booking.venueName}</span>
//                       </div>

//                       <div className="booking-detail-block">
//                         <span className="booking-detail-label">Tickets count</span>
//                         <span className="booking-detail-value">
//                           {booking.tickets.reduce(
//                             (sum, ticket) => sum + Number(ticket.quantity || 0),
//                             0
//                           )}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="booking-tickets-section">
//                       <div className="booking-tickets-header">
//                         <h4>
//                           <Ticket size={16} />
//                           <span>Booked Tickets</span>
//                         </h4>
//                       </div>

//                       <div className="booking-tickets-list">
//                         {booking.tickets.map((ticket, index) => (
//                           <div
//                             key={`${booking.bookingId}-${ticket.ticketType}-${index}`}
//                             className="booking-ticket-row"
//                           >
//                             <div className="booking-ticket-type-wrap">
//                               <span className="booking-ticket-type">{ticket.ticketType}</span>
//                               <span className="booking-ticket-subtext">
//                                 Quantity: {ticket.quantity}
//                               </span>
//                             </div>

//                             <div className="booking-ticket-price-wrap">
//                               <span className="booking-ticket-price-label">Price each</span>
//                               <span className="booking-ticket-price">
//                                 {formatPrice(ticket.priceSnapshot)}
//                               </span>
//                             </div>

//                             <div className="booking-ticket-price-wrap">
//                               <span className="booking-ticket-price-label">Line total</span>
//                               <span className="booking-ticket-line-total">
//                                 {formatPrice(Number(ticket.priceSnapshot) * Number(ticket.quantity))}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="booking-actions-row">
//                       <div className="booking-rate-hint">
//                         {alreadyRated
//                           ? "You already rated this event."
//                           : canRateNow
//                           ? "This event has ended. You can rate it now."
//                           : "Rating is available only after the event ends."}
//                       </div>

//                       <button
//                         type="button"
//                         className="rate-event-btn"
//                         disabled={isRateButtonDisabled}
//                         onClick={() => openFeedbackModal(booking)}
//                       >
//                         <Star size={16} />
//                         <span>
//                           {isCheckingThisBooking
//                             ? "Checking..."
//                             : alreadyRated
//                             ? "Already Rated"
//                             : "Rate Event"}
//                         </span>
//                       </button>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           )}
//         </section>

//         <AlertSnackbar
//           open={open}
//           message={message}
//           severity={severity}
//           onClose={handleClose}
//         />
//       </div>

//       {selectedBooking && (
//         <div className="feedback-modal-overlay" onClick={closeFeedbackModal}>
//           <div
//             className="feedback-modal-card"
//             onClick={(event) => event.stopPropagation()}
//           >
//             <div className="feedback-modal-header">
//               <div>
//                 <h3 className="feedback-modal-title">Rate Event</h3>
//                 <p className="feedback-modal-subtitle">{selectedBooking.eventName}</p>
//               </div>

//               <button
//                 type="button"
//                 className="feedback-close-btn"
//                 onClick={closeFeedbackModal}
//                 disabled={isSubmittingFeedback}
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="feedback-rating-section">
//               <span className="feedback-field-label">Your Rating</span>
//               <div className="feedback-stars-row">
//                 {[1, 2, 3, 4, 5].map((starValue) => {
//                   const active = starValue <= feedbackRating;
//                   return (
//                     <button
//                       key={starValue}
//                       type="button"
//                       className={`feedback-star-btn ${active ? "active" : ""}`}
//                       onClick={() => setFeedbackRating(starValue)}
//                       disabled={isSubmittingFeedback}
//                     >
//                       <Star size={22} fill={active ? "currentColor" : "none"} />
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="feedback-comment-section">
//               <label htmlFor="feedback-comment" className="feedback-field-label">
//                 Leave Feedback
//               </label>
//               <textarea
//                 id="feedback-comment"
//                 className="feedback-textarea"
//                 placeholder="Share your experience for this event..."
//                 value={feedbackComment}
//                 onChange={(e) => setFeedbackComment(e.target.value)}
//                 rows={5}
//                 maxLength={1000}
//                 disabled={isSubmittingFeedback}
//               />
//               <span className="feedback-char-count">
//                 {feedbackComment.length}/1000
//               </span>
//             </div>

//             <button
//               type="button"
//               className="feedback-submit-btn"
//               onClick={handleSubmitFeedback}
//               disabled={isSubmittingFeedback}
//             >
//               <Star size={16} />
//               <span>{isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default MyBookings;













// import React, { useEffect, useMemo, useState } from "react";
// import {
//   CalendarDays,
//   MapPin,
//   Package,
//   Ticket,
//   Wallet,
//   RefreshCw,
//   CircleAlert,
//   Star,
//   X,
//   Trash2,
// } from "lucide-react";
// import "./MyBookings.css";
// import { useAlert } from "../../hooks/useAlert";
// import {
//   getAttendeeBookings,
//   sendEventFeedback,
//   checkAttendeeRated,
//   deleteAttendeeBooking,
//   type AttendeeBookingItem,
// } from "../../api/attendeeApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";

// type BookingWithOptionalEventId = AttendeeBookingItem & {
//   eventId?: number;
//   hasRated?: boolean;
// };

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

// const parseEventTimeRange = (eventDate: string, eventTime: string) => {
//   if (!eventDate || !eventTime || !eventTime.includes(" - ")) {
//     return null;
//   }

//   const [startTime, endTime] = eventTime.split(" - ").map((item) => item.trim());

//   if (!startTime || !endTime) {
//     return null;
//   }

//   const start = new Date(`${eventDate}T${startTime}`);
//   const end = new Date(`${eventDate}T${endTime}`);

//   if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
//     return null;
//   }

//   if (end < start) {
//     end.setDate(end.getDate() + 1);
//   }

//   return { start, end };
// };

// const isRatingAllowedNow = (booking: BookingWithOptionalEventId) => {
//   const parsedRange = parseEventTimeRange(booking.eventDate, booking.eventTime);

//   if (!parsedRange) return false;

//   const now = new Date();

//   return now >= parsedRange.end;
// };

// const MyBookings: React.FC = () => {
//   const attendeeId = useMemo(() => {
//     const raw = localStorage.getItem("attendeeId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const attendeeEmail = useMemo(() => {
//     const rawUser = localStorage.getItem("user");

//     if (!rawUser) return "";

//     try {
//       const parsedUser = JSON.parse(rawUser);
//       return parsedUser?.email || "";
//     } catch {
//       return "";
//     }
//   }, []);

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const [bookings, setBookings] = useState<BookingWithOptionalEventId[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const [selectedBooking, setSelectedBooking] = useState<BookingWithOptionalEventId | null>(null);
//   const [feedbackRating, setFeedbackRating] = useState(0);
//   const [feedbackComment, setFeedbackComment] = useState("");
//   const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
//   const [checkingBookingId, setCheckingBookingId] = useState<number | null>(null);

//   const [deleteTargetBooking, setDeleteTargetBooking] =
//     useState<BookingWithOptionalEventId | null>(null);
//   const [isDeletingBooking, setIsDeletingBooking] = useState(false);

//   const totalBookings = bookings.length;

//   const totalTicketsBooked = bookings.reduce((sum, booking) => {
//     return (
//       sum +
//       booking.tickets.reduce((ticketSum, ticket) => ticketSum + Number(ticket.quantity || 0), 0)
//     );
//   }, 0);

//   const totalSpent = bookings.reduce((sum, booking) => {
//     return sum + Number(booking.totalPrice || 0);
//   }, 0);

//   const fetchBookings = async (showLoader = true) => {
//     if (!attendeeId) {
//       setBookings([]);
//       setIsLoading(false);
//       showAlert("Attendee id was not found. Please login again.", "error");
//       return;
//     }

//     try {
//       if (showLoader) {
//         setIsLoading(true);
//       } else {
//         setIsRefreshing(true);
//       }

//       const data = await getAttendeeBookings(attendeeId);

//       const normalizedBookings = await Promise.all(
//         (data as BookingWithOptionalEventId[]).map(async (booking) => {
//           const eventId = Number(booking.eventId);

//           if (!eventId || Number.isNaN(eventId)) {
//             return {
//               ...booking,
//               hasRated: Boolean(booking.hasRated),
//             };
//           }

//           try {
//             const ratingExists = await checkAttendeeRated({
//               attendeeId,
//               eventId,
//             });

//             return {
//               ...booking,
//               hasRated: ratingExists,
//             };
//           } catch {
//             return {
//               ...booking,
//               hasRated: Boolean(booking.hasRated),
//             };
//           }
//         })
//       );

//       setBookings(normalizedBookings);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to load bookings.";
//       showAlert(errorMessage, "error");
//       setBookings([]);
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings(true);
//   }, []);

//   const markBookingAsRated = (bookingId: number) => {
//     setBookings((prev) =>
//       prev.map((booking) =>
//         booking.bookingId === bookingId
//           ? {
//               ...booking,
//               hasRated: true,
//             }
//           : booking
//       )
//     );
//   };

//   const verifyBookingNotRated = async (booking: BookingWithOptionalEventId) => {
//     if (!attendeeId) {
//       showAlert("Attendee id was not found. Please login again.", "error");
//       return false;
//     }

//     const eventId = Number(booking.eventId);

//     if (!eventId || Number.isNaN(eventId)) {
//       showAlert("Event id was not found in this booking response.", "error");
//       return false;
//     }

//     const alreadyMarkedLocally = Boolean(booking.hasRated);
//     if (alreadyMarkedLocally) {
//       showAlert("You have already rated this event.", "info");
//       return false;
//     }

//     try {
//       setCheckingBookingId(booking.bookingId);

//       const ratingExists = await checkAttendeeRated({
//         attendeeId,
//         eventId,
//       });

//       if (ratingExists) {
//         markBookingAsRated(booking.bookingId);
//         showAlert("You have already rated this event.", "info");
//         return false;
//       }

//       return true;
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to verify rating status.";
//       showAlert(errorMessage, "error");
//       return false;
//     } finally {
//       setCheckingBookingId(null);
//     }
//   };

//   const openFeedbackModal = async (booking: BookingWithOptionalEventId) => {
//     if (!isRatingAllowedNow(booking)) {
//       showAlert("You can rate this event only after it ends.", "warning");
//       return;
//     }

//     const canContinue = await verifyBookingNotRated(booking);
//     if (!canContinue) return;

//     setSelectedBooking(booking);
//     setFeedbackRating(0);
//     setFeedbackComment("");
//   };

//   const closeFeedbackModal = () => {
//     if (isSubmittingFeedback) return;
//     setSelectedBooking(null);
//     setFeedbackRating(0);
//     setFeedbackComment("");
//   };

//   const handleSubmitFeedback = async () => {
//     if (!selectedBooking) return;

//     if (!attendeeId) {
//       showAlert("Attendee id was not found. Please login again.", "error");
//       return;
//     }

//     const eventId = Number(selectedBooking.eventId);

//     if (!eventId || Number.isNaN(eventId)) {
//       showAlert("Event id was not found in this booking response.", "error");
//       return;
//     }

//     if (!isRatingAllowedNow(selectedBooking)) {
//       showAlert("You can rate this event only after it ends.", "warning");
//       return;
//     }

//     if (!feedbackRating) {
//       showAlert("Please select a rating before submitting.", "warning");
//       return;
//     }

//     if (feedbackComment.trim().length > 0 && feedbackComment.trim().length < 3) {
//       showAlert("Feedback comment must be at least 3 characters long.", "warning");
//       return;
//     }

//     const canContinue = await verifyBookingNotRated(selectedBooking);
//     if (!canContinue) {
//       closeFeedbackModal();
//       return;
//     }

//     try {
//       setIsSubmittingFeedback(true);

//       await sendEventFeedback({
//         eventId,
//         attendeeId,
//         rating: feedbackRating,
//         comment: feedbackComment.trim(),
//       });

//       markBookingAsRated(selectedBooking.bookingId);

//       showAlert("Feedback sent successfully.", "success");
//       closeFeedbackModal();
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to send feedback.";
//       showAlert(errorMessage, "error");
//     } finally {
//       setIsSubmittingFeedback(false);
//     }
//   };

//   const openDeleteDialog = (booking: BookingWithOptionalEventId) => {
//     setDeleteTargetBooking(booking);
//   };

//   const closeDeleteDialog = () => {
//     if (isDeletingBooking) return;
//     setDeleteTargetBooking(null);
//   };

//   const handleConfirmDeleteBooking = async () => {
//     if (!deleteTargetBooking) return;

//     if (!attendeeEmail) {
//       showAlert("Attendee email was not found. Please login again.", "error");
//       return;
//     }

//     const ticketsCount = deleteTargetBooking.tickets.reduce(
//       (sum, ticket) => sum + Number(ticket.quantity || 0),
//       0
//     );

//     try {
//       setIsDeletingBooking(true);

//       await deleteAttendeeBooking({
//         eventName: deleteTargetBooking.eventName,
//         bookingId: deleteTargetBooking.bookingId,
//         attendeeEmail,
//         eventDate: formatDate(deleteTargetBooking.eventDate),
//         eventTime: deleteTargetBooking.eventTime,
//         venueName: deleteTargetBooking.venueName,
//         eventType: deleteTargetBooking.eventType,
//         totalPrice: deleteTargetBooking.totalPrice,
//         ticketsCount,
//         tickets: deleteTargetBooking.tickets,
//       });

//       showAlert(
//         "Booking deleted successfully. Please check your email for refund instructions.",
//         "success"
//       );

//       setDeleteTargetBooking(null);
//       await fetchBookings(false);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to delete booking.";
//       showAlert(errorMessage, "error");
//     } finally {
//       setIsDeletingBooking(false);
//     }
//   };

//   return (
//     <>
//       <div className="page-shell">
//         <div className="page-header">
//           <h1 className="page-title">My Bookings</h1>
//           <p className="page-subtitle">
//             View all your event bookings, ticket breakdowns, and total payments in one place.
//           </p>
//         </div>

//         <div className="stats-grid my-bookings-stats-grid">
//           <div className="surface-card booking-stat-card">
//             <div className="booking-stat-icon booking-stat-icon-orange">
//               <Package size={20} />
//             </div>
//             <div className="booking-stat-content">
//               <span className="booking-stat-label">Total Bookings</span>
//               <h3>{totalBookings}</h3>
//               <p>All bookings linked to your attendee account.</p>
//             </div>
//           </div>

//           <div className="surface-card booking-stat-card">
//             <div className="booking-stat-icon booking-stat-icon-blue">
//               <Ticket size={20} />
//             </div>
//             <div className="booking-stat-content">
//               <span className="booking-stat-label">Tickets Booked</span>
//               <h3>{totalTicketsBooked}</h3>
//               <p>Total ticket quantity across all bookings.</p>
//             </div>
//           </div>

//           <div className="surface-card booking-stat-card">
//             <div className="booking-stat-icon booking-stat-icon-green">
//               <Wallet size={20} />
//             </div>
//             <div className="booking-stat-content">
//               <span className="booking-stat-label">Total Spent</span>
//               <h3>{formatPrice(totalSpent)}</h3>
//               <p>Total amount paid for your bookings.</p>
//             </div>
//           </div>
//         </div>

//         <section className="surface-card bookings-section-card">
//           <div className="bookings-section-header">
//             <div>
//               <h2 className="bookings-section-title">Booking History</h2>
//               <p className="bookings-section-subtitle">
//                 Review your booked events and ticket details.
//               </p>
//             </div>

//             <button
//               type="button"
//               className="refresh-bookings-btn"
//               onClick={() => fetchBookings(false)}
//               disabled={isRefreshing}
//             >
//               <RefreshCw
//                 size={16}
//                 className={isRefreshing ? "refresh-icon spinning" : "refresh-icon"}
//               />
//               <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
//             </button>
//           </div>

//           {isLoading ? (
//             <div className="bookings-state-box">
//               <div className="bookings-loader" />
//               <h3>Loading bookings...</h3>
//               <p>Please wait while we fetch your booking history.</p>
//             </div>
//           ) : bookings.length === 0 ? (
//             <div className="bookings-state-box empty">
//               <div className="bookings-empty-icon">
//                 <CircleAlert size={22} />
//               </div>
//               <h3>No bookings found</h3>
//               <p>You have not booked any events yet.</p>
//             </div>
//           ) : (
//             <div className="bookings-list">
//               {bookings.map((booking) => {
//                 const alreadyRated = Boolean(booking.hasRated);
//                 const canRateNow = isRatingAllowedNow(booking);
//                 const isCheckingThisBooking = checkingBookingId === booking.bookingId;
//                 const isRateButtonDisabled =
//                   alreadyRated || !canRateNow || isCheckingThisBooking;

//                 return (
//                   <article key={booking.bookingId} className="booking-card">
//                     <button
//                       type="button"
//                       className="booking-delete-btn"
//                       onClick={() => openDeleteDialog(booking)}
//                       title="Delete booking"
//                     >
//                       <Trash2 size={17} />
//                     </button>

//                     <div className="booking-card-top">
//                       <div className="booking-title-wrap">
//                         <h3 className="booking-event-name">{booking.eventName}</h3>

//                         <div className="booking-meta-row">
//                           <div className="booking-meta-pill">
//                             <CalendarDays size={15} />
//                             <span>{formatDate(booking.eventDate)}</span>
//                           </div>

//                           <div className="booking-meta-pill">
//                             <Ticket size={15} />
//                             <span>{booking.eventType}</span>
//                           </div>

//                           <div className="booking-meta-pill">
//                             <MapPin size={15} />
//                             <span>{booking.venueName}</span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="booking-total-box">
//                         <span className="booking-total-label">Total Paid</span>
//                         <strong className="booking-total-amount">
//                           {formatPrice(booking.totalPrice)}
//                         </strong>
//                       </div>
//                     </div>

//                     <div className="booking-details-grid">
//                       <div className="booking-detail-block">
//                         <span className="booking-detail-label">Event date</span>
//                         <span className="booking-detail-value">
//                           {formatDate(booking.eventDate)}
//                         </span>
//                       </div>

//                       <div className="booking-detail-block">
//                         <span className="booking-detail-label">Event time</span>
//                         <span className="booking-detail-value">{booking.eventTime}</span>
//                       </div>

//                       <div className="booking-detail-block">
//                         <span className="booking-detail-label">Venue</span>
//                         <span className="booking-detail-value">{booking.venueName}</span>
//                       </div>

//                       <div className="booking-detail-block">
//                         <span className="booking-detail-label">Tickets count</span>
//                         <span className="booking-detail-value">
//                           {booking.tickets.reduce(
//                             (sum, ticket) => sum + Number(ticket.quantity || 0),
//                             0
//                           )}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="booking-tickets-section">
//                       <div className="booking-tickets-header">
//                         <h4>
//                           <Ticket size={16} />
//                           <span>Booked Tickets</span>
//                         </h4>
//                       </div>

//                       <div className="booking-tickets-list">
//                         {booking.tickets.map((ticket, index) => (
//                           <div
//                             key={`${booking.bookingId}-${ticket.ticketType}-${index}`}
//                             className="booking-ticket-row"
//                           >
//                             <div className="booking-ticket-type-wrap">
//                               <span className="booking-ticket-type">{ticket.ticketType}</span>
//                               <span className="booking-ticket-subtext">
//                                 Quantity: {ticket.quantity}
//                               </span>
//                             </div>

//                             <div className="booking-ticket-price-wrap">
//                               <span className="booking-ticket-price-label">Price each</span>
//                               <span className="booking-ticket-price">
//                                 {formatPrice(ticket.priceSnapshot)}
//                               </span>
//                             </div>

//                             <div className="booking-ticket-price-wrap">
//                               <span className="booking-ticket-price-label">Line total</span>
//                               <span className="booking-ticket-line-total">
//                                 {formatPrice(Number(ticket.priceSnapshot) * Number(ticket.quantity))}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="booking-actions-row">
//                       <div className="booking-rate-hint">
//                         {alreadyRated
//                           ? "You already rated this event."
//                           : canRateNow
//                           ? "This event has ended. You can rate it now."
//                           : "Rating is available only after the event ends."}
//                       </div>

//                       <button
//                         type="button"
//                         className="rate-event-btn"
//                         disabled={isRateButtonDisabled}
//                         onClick={() => openFeedbackModal(booking)}
//                       >
//                         <Star size={16} />
//                         <span>
//                           {isCheckingThisBooking
//                             ? "Checking..."
//                             : alreadyRated
//                             ? "Already Rated"
//                             : "Rate Event"}
//                         </span>
//                       </button>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           )}
//         </section>

//         <AlertSnackbar
//           open={open}
//           message={message}
//           severity={severity}
//           onClose={handleClose}
//         />
//       </div>

//       {deleteTargetBooking && (
//         <div className="booking-delete-dialog-overlay" onClick={closeDeleteDialog}>
//           <div
//             className="booking-delete-dialog"
//             onClick={(event) => event.stopPropagation()}
//           >
//             <div className="booking-delete-dialog-icon">
//               <Trash2 size={24} />
//             </div>

//             <h3>Delete this booking?</h3>

//             <p>
//               You are about to delete your booking for{" "}
//               <strong>{deleteTargetBooking.eventName}</strong>. This action cannot be undone.
//             </p>

//             <div className="booking-delete-warning">
//               After deletion, an email will be sent to you with refund instructions.
//               Please contact +96103187846 to request your refund because the event has not started yet.
//             </div>

//             <div className="booking-delete-dialog-actions">
//               <button
//                 type="button"
//                 className="booking-delete-cancel-btn"
//                 onClick={closeDeleteDialog}
//                 disabled={isDeletingBooking}
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 className="booking-delete-confirm-btn"
//                 onClick={handleConfirmDeleteBooking}
//                 disabled={isDeletingBooking}
//               >
//                 {isDeletingBooking ? "Deleting..." : "Yes, Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {selectedBooking && (
//         <div className="feedback-modal-overlay" onClick={closeFeedbackModal}>
//           <div
//             className="feedback-modal-card"
//             onClick={(event) => event.stopPropagation()}
//           >
//             <div className="feedback-modal-header">
//               <div>
//                 <h3 className="feedback-modal-title">Rate Event</h3>
//                 <p className="feedback-modal-subtitle">{selectedBooking.eventName}</p>
//               </div>

//               <button
//                 type="button"
//                 className="feedback-close-btn"
//                 onClick={closeFeedbackModal}
//                 disabled={isSubmittingFeedback}
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="feedback-rating-section">
//               <span className="feedback-field-label">Your Rating</span>
//               <div className="feedback-stars-row">
//                 {[1, 2, 3, 4, 5].map((starValue) => {
//                   const active = starValue <= feedbackRating;
//                   return (
//                     <button
//                       key={starValue}
//                       type="button"
//                       className={`feedback-star-btn ${active ? "active" : ""}`}
//                       onClick={() => setFeedbackRating(starValue)}
//                       disabled={isSubmittingFeedback}
//                     >
//                       <Star size={22} fill={active ? "currentColor" : "none"} />
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="feedback-comment-section">
//               <label htmlFor="feedback-comment" className="feedback-field-label">
//                 Leave Feedback
//               </label>
//               <textarea
//                 id="feedback-comment"
//                 className="feedback-textarea"
//                 placeholder="Share your experience for this event..."
//                 value={feedbackComment}
//                 onChange={(e) => setFeedbackComment(e.target.value)}
//                 rows={5}
//                 maxLength={1000}
//                 disabled={isSubmittingFeedback}
//               />
//               <span className="feedback-char-count">
//                 {feedbackComment.length}/1000
//               </span>
//             </div>

//             <button
//               type="button"
//               className="feedback-submit-btn"
//               onClick={handleSubmitFeedback}
//               disabled={isSubmittingFeedback}
//             >
//               <Star size={16} />
//               <span>{isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default MyBookings;







import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Package,
  Ticket,
  Wallet,
  RefreshCw,
  CircleAlert,
  Star,
  X,
  Trash2,
} from "lucide-react";
import "./MyBookings.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getAttendeeBookings,
  sendEventFeedback,
  checkAttendeeRated,
  deleteAttendeeBooking,
  type AttendeeBookingItem,
} from "../../api/attendeeApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

type BookingWithOptionalEventId = AttendeeBookingItem & {
  eventId?: number;
  hasRated?: boolean;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (price: string | number) => {
  const parsed = Number(price);
  if (Number.isNaN(parsed)) return `$${price}`;
  return `$${parsed.toFixed(2)}`;
};

const parseEventTimeRange = (eventDate: string, eventTime: string) => {
  if (!eventDate || !eventTime || !eventTime.includes(" - ")) return null;

  const [startTime, endTime] = eventTime.split(" - ").map((item) => item.trim());
  if (!startTime || !endTime) return null;

  const start = new Date(`${eventDate}T${startTime}`);
  const end = new Date(`${eventDate}T${endTime}`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  return { start, end };
};

const isRatingAllowedNow = (booking: BookingWithOptionalEventId) => {
  const parsedRange = parseEventTimeRange(booking.eventDate, booking.eventTime);
  if (!parsedRange) return false;

  return new Date() >= parsedRange.end;
};

const canDeleteBookingNow = (booking: BookingWithOptionalEventId) => {
  return !isRatingAllowedNow(booking);
};

const MyBookings: React.FC = () => {
  const attendeeId = useMemo(() => {
    const raw = localStorage.getItem("attendeeId");
    return raw ? Number(raw) : null;
  }, []);

  const attendeeEmail = useMemo(() => {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) return "";

    try {
      const parsedUser = JSON.parse(rawUser);
      return parsedUser?.email || "";
    } catch {
      return "";
    }
  }, []);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [bookings, setBookings] = useState<BookingWithOptionalEventId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithOptionalEventId | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [checkingBookingId, setCheckingBookingId] = useState<number | null>(null);

  const [deleteTargetBooking, setDeleteTargetBooking] =
    useState<BookingWithOptionalEventId | null>(null);
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);

  const totalBookings = bookings.length;

  const totalTicketsBooked = bookings.reduce((sum, booking) => {
    return (
      sum +
      booking.tickets.reduce(
        (ticketSum, ticket) => ticketSum + Number(ticket.quantity || 0),
        0
      )
    );
  }, 0);

  const totalSpent = bookings.reduce((sum, booking) => {
    return sum + Number(booking.totalPrice || 0);
  }, 0);

  const fetchBookings = async (showLoader = true) => {
    if (!attendeeId) {
      setBookings([]);
      setIsLoading(false);
      showAlert("Attendee id was not found. Please login again.", "error");
      return;
    }

    try {
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const data = await getAttendeeBookings(attendeeId);

      const normalizedBookings = await Promise.all(
        (data as BookingWithOptionalEventId[]).map(async (booking) => {
          const eventId = Number(booking.eventId);

          if (!eventId || Number.isNaN(eventId)) {
            return {
              ...booking,
              hasRated: Boolean(booking.hasRated),
            };
          }

          try {
            const ratingExists = await checkAttendeeRated({
              attendeeId,
              eventId,
            });

            return {
              ...booking,
              hasRated: ratingExists,
            };
          } catch {
            return {
              ...booking,
              hasRated: Boolean(booking.hasRated),
            };
          }
        })
      );

      setBookings(normalizedBookings);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load bookings.";
      showAlert(errorMessage, "error");
      setBookings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings(true);
  }, []);

  const markBookingAsRated = (bookingId: number) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.bookingId === bookingId
          ? {
              ...booking,
              hasRated: true,
            }
          : booking
      )
    );
  };

  const verifyBookingNotRated = async (booking: BookingWithOptionalEventId) => {
    if (!attendeeId) {
      showAlert("Attendee id was not found. Please login again.", "error");
      return false;
    }

    const eventId = Number(booking.eventId);

    if (!eventId || Number.isNaN(eventId)) {
      showAlert("Event id was not found in this booking response.", "error");
      return false;
    }

    if (Boolean(booking.hasRated)) {
      showAlert("You have already rated this event.", "info");
      return false;
    }

    try {
      setCheckingBookingId(booking.bookingId);

      const ratingExists = await checkAttendeeRated({
        attendeeId,
        eventId,
      });

      if (ratingExists) {
        markBookingAsRated(booking.bookingId);
        showAlert("You have already rated this event.", "info");
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify rating status.";
      showAlert(errorMessage, "error");
      return false;
    } finally {
      setCheckingBookingId(null);
    }
  };

  const openFeedbackModal = async (booking: BookingWithOptionalEventId) => {
    if (!isRatingAllowedNow(booking)) {
      showAlert("You can rate this event only after it ends.", "warning");
      return;
    }

    const canContinue = await verifyBookingNotRated(booking);
    if (!canContinue) return;

    setSelectedBooking(booking);
    setFeedbackRating(0);
    setFeedbackComment("");
  };

  const closeFeedbackModal = () => {
    if (isSubmittingFeedback) return;
    setSelectedBooking(null);
    setFeedbackRating(0);
    setFeedbackComment("");
  };

  const handleSubmitFeedback = async () => {
    if (!selectedBooking) return;

    if (!attendeeId) {
      showAlert("Attendee id was not found. Please login again.", "error");
      return;
    }

    const eventId = Number(selectedBooking.eventId);

    if (!eventId || Number.isNaN(eventId)) {
      showAlert("Event id was not found in this booking response.", "error");
      return;
    }

    if (!isRatingAllowedNow(selectedBooking)) {
      showAlert("You can rate this event only after it ends.", "warning");
      return;
    }

    if (!feedbackRating) {
      showAlert("Please select a rating before submitting.", "warning");
      return;
    }

    if (feedbackComment.trim().length > 0 && feedbackComment.trim().length < 3) {
      showAlert("Feedback comment must be at least 3 characters long.", "warning");
      return;
    }

    const canContinue = await verifyBookingNotRated(selectedBooking);
    if (!canContinue) {
      closeFeedbackModal();
      return;
    }

    try {
      setIsSubmittingFeedback(true);

      await sendEventFeedback({
        eventId,
        attendeeId,
        rating: feedbackRating,
        comment: feedbackComment.trim(),
      });

      markBookingAsRated(selectedBooking.bookingId);

      showAlert("Feedback sent successfully.", "success");
      closeFeedbackModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send feedback.";
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const openDeleteDialog = (booking: BookingWithOptionalEventId) => {
    if (!canDeleteBookingNow(booking)) {
      showAlert("This booking can no longer be deleted because the event has ended.", "warning");
      return;
    }

    setDeleteTargetBooking(booking);
  };

  const closeDeleteDialog = () => {
    if (isDeletingBooking) return;
    setDeleteTargetBooking(null);
  };

  const handleConfirmDeleteBooking = async () => {
    if (!deleteTargetBooking) return;

    if (!canDeleteBookingNow(deleteTargetBooking)) {
      showAlert("This booking can no longer be deleted because the event has ended.", "warning");
      setDeleteTargetBooking(null);
      return;
    }

    if (!attendeeEmail) {
      showAlert("Attendee email was not found. Please login again.", "error");
      return;
    }

    const ticketsCount = deleteTargetBooking.tickets.reduce(
      (sum, ticket) => sum + Number(ticket.quantity || 0),
      0
    );

    try {
      setIsDeletingBooking(true);

      await deleteAttendeeBooking({
        eventName: deleteTargetBooking.eventName,
        bookingId: deleteTargetBooking.bookingId,
        attendeeEmail,
        eventDate: formatDate(deleteTargetBooking.eventDate),
        eventTime: deleteTargetBooking.eventTime,
        venueName: deleteTargetBooking.venueName,
        eventType: deleteTargetBooking.eventType,
        totalPrice: deleteTargetBooking.totalPrice,
        ticketsCount,
        tickets: deleteTargetBooking.tickets,
      });

      showAlert(
        "Booking deleted successfully. Please check your email for refund instructions.",
        "success"
      );

      setDeleteTargetBooking(null);
      await fetchBookings(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete booking.";
      showAlert(errorMessage, "error");
    } finally {
      setIsDeletingBooking(false);
    }
  };

  return (
    <>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">
            View all your event bookings, ticket breakdowns, and total payments in one place.
          </p>
        </div>

        <div className="stats-grid my-bookings-stats-grid">
          <div className="surface-card booking-stat-card">
            <div className="booking-stat-icon booking-stat-icon-orange">
              <Package size={20} />
            </div>
            <div className="booking-stat-content">
              <span className="booking-stat-label">Total Bookings</span>
              <h3>{totalBookings}</h3>
              <p>All bookings linked to your attendee account.</p>
            </div>
          </div>

          <div className="surface-card booking-stat-card">
            <div className="booking-stat-icon booking-stat-icon-blue">
              <Ticket size={20} />
            </div>
            <div className="booking-stat-content">
              <span className="booking-stat-label">Tickets Booked</span>
              <h3>{totalTicketsBooked}</h3>
              <p>Total ticket quantity across all bookings.</p>
            </div>
          </div>

          <div className="surface-card booking-stat-card">
            <div className="booking-stat-icon booking-stat-icon-green">
              <Wallet size={20} />
            </div>
            <div className="booking-stat-content">
              <span className="booking-stat-label">Total Spent</span>
              <h3>{formatPrice(totalSpent)}</h3>
              <p>Total amount paid for your bookings.</p>
            </div>
          </div>
        </div>

        <section className="surface-card bookings-section-card">
          <div className="bookings-section-header">
            <div>
              <h2 className="bookings-section-title">Booking History</h2>
              <p className="bookings-section-subtitle">
                Review your booked events and ticket details.
              </p>
            </div>

            <button
              type="button"
              className="refresh-bookings-btn"
              onClick={() => fetchBookings(false)}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "refresh-icon spinning" : "refresh-icon"}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="bookings-state-box">
              <div className="bookings-loader" />
              <h3>Loading bookings...</h3>
              <p>Please wait while we fetch your booking history.</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bookings-state-box empty">
              <div className="bookings-empty-icon">
                <CircleAlert size={22} />
              </div>
              <h3>No bookings found</h3>
              <p>You have not booked any events yet.</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => {
                const alreadyRated = Boolean(booking.hasRated);
                const canRateNow = isRatingAllowedNow(booking);
                const canDeleteNow = canDeleteBookingNow(booking);
                const isCheckingThisBooking = checkingBookingId === booking.bookingId;
                const isRateButtonDisabled =
                  alreadyRated || !canRateNow || isCheckingThisBooking;

                return (
                  <article key={booking.bookingId} className="booking-card">
                    {canDeleteNow && (
                      <button
                        type="button"
                        className="booking-delete-btn"
                        onClick={() => openDeleteDialog(booking)}
                        title="Delete booking"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}

                    <div className="booking-card-top">
                      <div className="booking-title-wrap">
                        <h3 className="booking-event-name">{booking.eventName}</h3>

                        <div className="booking-meta-row">
                          <div className="booking-meta-pill">
                            <CalendarDays size={15} />
                            <span>{formatDate(booking.eventDate)}</span>
                          </div>

                          <div className="booking-meta-pill">
                            <Ticket size={15} />
                            <span>{booking.eventType}</span>
                          </div>

                          <div className="booking-meta-pill">
                            <MapPin size={15} />
                            <span>{booking.venueName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="booking-total-box">
                        <span className="booking-total-label">Total Paid</span>
                        <strong className="booking-total-amount">
                          {formatPrice(booking.totalPrice)}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-details-grid">
                      <div className="booking-detail-block">
                        <span className="booking-detail-label">Event date</span>
                        <span className="booking-detail-value">
                          {formatDate(booking.eventDate)}
                        </span>
                      </div>

                      <div className="booking-detail-block">
                        <span className="booking-detail-label">Event time</span>
                        <span className="booking-detail-value">{booking.eventTime}</span>
                      </div>

                      <div className="booking-detail-block">
                        <span className="booking-detail-label">Venue</span>
                        <span className="booking-detail-value">{booking.venueName}</span>
                      </div>

                      <div className="booking-detail-block">
                        <span className="booking-detail-label">Tickets count</span>
                        <span className="booking-detail-value">
                          {booking.tickets.reduce(
                            (sum, ticket) => sum + Number(ticket.quantity || 0),
                            0
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="booking-tickets-section">
                      <div className="booking-tickets-header">
                        <h4>
                          <Ticket size={16} />
                          <span>Booked Tickets</span>
                        </h4>
                      </div>

                      <div className="booking-tickets-list">
                        {booking.tickets.map((ticket, index) => (
                          <div
                            key={`${booking.bookingId}-${ticket.ticketType}-${index}`}
                            className="booking-ticket-row"
                          >
                            <div className="booking-ticket-type-wrap">
                              <span className="booking-ticket-type">{ticket.ticketType}</span>
                              <span className="booking-ticket-subtext">
                                Quantity: {ticket.quantity}
                              </span>
                            </div>

                            <div className="booking-ticket-price-wrap">
                              <span className="booking-ticket-price-label">Price each</span>
                              <span className="booking-ticket-price">
                                {formatPrice(ticket.priceSnapshot)}
                              </span>
                            </div>

                            <div className="booking-ticket-price-wrap">
                              <span className="booking-ticket-price-label">Line total</span>
                              <span className="booking-ticket-line-total">
                                {formatPrice(
                                  Number(ticket.priceSnapshot) * Number(ticket.quantity)
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="booking-actions-row">
                      <div className="booking-rate-hint">
                        {alreadyRated
                          ? "You already rated this event."
                          : canRateNow
                          ? "This event has ended. You can rate it now."
                          : "Rating is available only after the event ends."}
                      </div>

                      <button
                        type="button"
                        className="rate-event-btn"
                        disabled={isRateButtonDisabled}
                        onClick={() => openFeedbackModal(booking)}
                      >
                        <Star size={16} />
                        <span>
                          {isCheckingThisBooking
                            ? "Checking..."
                            : alreadyRated
                            ? "Already Rated"
                            : "Rate Event"}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <AlertSnackbar
          open={open}
          message={message}
          severity={severity}
          onClose={handleClose}
        />
      </div>

      {deleteTargetBooking && (
        <div className="booking-delete-dialog-overlay" onClick={closeDeleteDialog}>
          <div
            className="booking-delete-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="booking-delete-dialog-icon">
              <Trash2 size={24} />
            </div>

            <h3>Delete this booking?</h3>

            <p>
              You are about to delete your booking for{" "}
              <strong>{deleteTargetBooking.eventName}</strong>. This action cannot be undone.
            </p>

            <div className="booking-delete-warning">
              After deletion, an email will be sent to you with refund instructions.
              Please contact +96103187846 to request your refund because the event has not started yet.
            </div>

            <div className="booking-delete-dialog-actions">
              <button
                type="button"
                className="booking-delete-cancel-btn"
                onClick={closeDeleteDialog}
                disabled={isDeletingBooking}
              >
                Cancel
              </button>

              <button
                type="button"
                className="booking-delete-confirm-btn"
                onClick={handleConfirmDeleteBooking}
                disabled={isDeletingBooking}
              >
                {isDeletingBooking ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="feedback-modal-overlay" onClick={closeFeedbackModal}>
          <div
            className="feedback-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="feedback-modal-header">
              <div>
                <h3 className="feedback-modal-title">Rate Event</h3>
                <p className="feedback-modal-subtitle">{selectedBooking.eventName}</p>
              </div>

              <button
                type="button"
                className="feedback-close-btn"
                onClick={closeFeedbackModal}
                disabled={isSubmittingFeedback}
              >
                <X size={18} />
              </button>
            </div>

            <div className="feedback-rating-section">
              <span className="feedback-field-label">Your Rating</span>
              <div className="feedback-stars-row">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const active = starValue <= feedbackRating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      className={`feedback-star-btn ${active ? "active" : ""}`}
                      onClick={() => setFeedbackRating(starValue)}
                      disabled={isSubmittingFeedback}
                    >
                      <Star size={22} fill={active ? "currentColor" : "none"} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="feedback-comment-section">
              <label htmlFor="feedback-comment" className="feedback-field-label">
                Leave Feedback
              </label>
              <textarea
                id="feedback-comment"
                className="feedback-textarea"
                placeholder="Share your experience for this event..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={5}
                maxLength={1000}
                disabled={isSubmittingFeedback}
              />
              <span className="feedback-char-count">{feedbackComment.length}/1000</span>
            </div>

            <button
              type="button"
              className="feedback-submit-btn"
              onClick={handleSubmitFeedback}
              disabled={isSubmittingFeedback}
            >
              <Star size={16} />
              <span>{isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;