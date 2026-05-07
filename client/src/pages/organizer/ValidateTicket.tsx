// import React, { useMemo, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import {
//   Sparkles,
//   ShieldCheck,
//   Ticket,
//   ScanLine,
//   CheckCircle2,
//   ArrowLeft,
//   CircleAlert,
// } from "lucide-react";
// import "./ValidateTicket.css";
// import { useAlert } from "../../hooks/useAlert";
// import { checkInAttendee } from "../../api/eventApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";

// const ValidateTicket: React.FC = () => {
//   const { ticketCode } = useParams<{ ticketCode: string }>();
//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isCheckedIn, setIsCheckedIn] = useState(false);

//   const parsedBookingTicketId = useMemo(() => {
//     if (!ticketCode) return null;

//     const match = ticketCode.match(/^BT-(\d+)$/i);
//     if (!match) return null;

//     const parsed = Number(match[1]);
//     return Number.isNaN(parsed) ? null : parsed;
//   }, [ticketCode]);

//   const handleCheckIn = async () => {
//     if (!parsedBookingTicketId) {
//       showAlert("Invalid ticket link. Booking ticket id could not be extracted.", "error");
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       await checkInAttendee({ bookingTicketId: parsedBookingTicketId });

//       setIsCheckedIn(true);
//       showAlert("Attendee checked in successfully.", "success");
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to check in attendee.";
//       showAlert(errorMessage, "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="validate-ticket-page">
//       <header className="validate-ticket-header">
//         <div className="validate-ticket-brand">
//           <div className="validate-ticket-brand-icon">
//             <Sparkles size={18} fill="white" />
//           </div>
//           <span className="validate-ticket-brand-text">Eventia</span>
//         </div>

//         <Link to="/organizer/dashboard" className="validate-ticket-back-link">
//           <ArrowLeft size={16} />
//           <span>Back to dashboard</span>
//         </Link>
//       </header>

//       <main className="validate-ticket-main">
//         <section className="validate-ticket-card">
//           <div className="validate-ticket-top">
//             <div className="validate-ticket-badge">
//               <ScanLine size={15} />
//               <span>Ticket Validation</span>
//             </div>

//             <div className="validate-ticket-icon-wrap">
//               <div className="validate-ticket-icon">
//                 {parsedBookingTicketId ? <ShieldCheck size={30} /> : <CircleAlert size={30} />}
//               </div>
//             </div>
//           </div>

//           <div className="validate-ticket-content">
//             <h1 className="validate-ticket-title">Validate Attendee Ticket</h1>
//             <p className="validate-ticket-subtitle">
//               Review the scanned ticket code and confirm attendee check-in for the event.
//             </p>

//             <div className="validate-ticket-info-grid">
//               <div className="validate-ticket-info-box">
//                 <span className="validate-ticket-info-label">
//                   <Ticket size={14} />
//                   Ticket Code
//                 </span>
//                 <span className="validate-ticket-info-value">
//                   {ticketCode || "Not provided"}
//                 </span>
//               </div>

//               <div className="validate-ticket-info-box">
//                 <span className="validate-ticket-info-label">
//                   <ShieldCheck size={14} />
//                   Booking Ticket ID
//                 </span>
//                 <span className="validate-ticket-info-value">
//                   {parsedBookingTicketId ?? "Invalid"}
//                 </span>
//               </div>
//             </div>

//             {parsedBookingTicketId ? (
//               <div className="validate-ticket-status valid">
//                 <CheckCircle2 size={18} />
//                 <span>Valid ticket format detected. You can proceed with attendee check-in.</span>
//               </div>
//             ) : (
//               <div className="validate-ticket-status invalid">
//                 <CircleAlert size={18} />
//                 <span>
//                   Invalid ticket format. Expected format is <strong>BT-x</strong>.
//                 </span>
//               </div>
//             )}

//             <button
//               type="button"
//               className="validate-ticket-btn"
//               onClick={handleCheckIn}
//               disabled={!parsedBookingTicketId || isSubmitting || isCheckedIn}
//             >
//               <ShieldCheck size={18} />
//               <span>
//                 {isCheckedIn
//                   ? "Attendee Checked In"
//                   : isSubmitting
//                   ? "Checking In..."
//                   : "Check In Attendee"}
//               </span>
//             </button>
//           </div>
//         </section>
//       </main>

//       <AlertSnackbar
//         open={open}
//         message={message}
//         severity={severity}
//         onClose={handleClose}
//       />
//     </div>
//   );
// };

// export default ValidateTicket;









import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Ticket,
  ScanLine,
  ArrowLeft,
} from "lucide-react";
import "./ValidateTicket.css";
import { useAlert } from "../../hooks/useAlert";
import { checkInAttendee } from "../../api/eventApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

const ValidateTicket: React.FC = () => {
  const { ticketCode } = useParams<{ ticketCode: string }>();
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const resolvedTicketCode = useMemo(() => {
    return ticketCode?.trim() || "";
  }, [ticketCode]);

  const handleCheckIn = async () => {
    if (!resolvedTicketCode) {
      showAlert("Ticket code was not found in the URL.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      await checkInAttendee({ ticketCode: resolvedTicketCode });

      setIsCheckedIn(true);
      showAlert("Attendee checked in successfully.", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to check in attendee.";
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="validate-ticket-page">
      <header className="validate-ticket-header">
        <div className="validate-ticket-brand">
          <div className="validate-ticket-brand-icon">
            <Sparkles size={18} fill="white" />
          </div>
          <span className="validate-ticket-brand-text">Eventia</span>
        </div>

        <Link to="/organizer/dashboard" className="validate-ticket-back-link">
          <ArrowLeft size={16} />
          <span>Back to dashboard</span>
        </Link>
      </header>

      <main className="validate-ticket-main">
        <section className="validate-ticket-card">
          <div className="validate-ticket-top">
            <div className="validate-ticket-badge">
              <ScanLine size={15} />
              <span>Ticket Validation</span>
            </div>

            <div className="validate-ticket-icon-wrap">
              <div className="validate-ticket-icon">
                <ShieldCheck size={30} />
              </div>
            </div>
          </div>

          <div className="validate-ticket-content">
            <h1 className="validate-ticket-title">Validate Attendee Ticket</h1>
            <p className="validate-ticket-subtitle">
              Review the scanned ticket code and confirm attendee check-in for the event.
            </p>

            <div className="validate-ticket-info-grid single-column">
              <div className="validate-ticket-info-box">
                <span className="validate-ticket-info-label">
                  <Ticket size={14} />
                  Ticket Code
                </span>
                <span className="validate-ticket-info-value">
                  {resolvedTicketCode || "Not provided"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="validate-ticket-btn"
              onClick={handleCheckIn}
              disabled={!resolvedTicketCode || isSubmitting || isCheckedIn}
            >
              <ShieldCheck size={18} />
              <span>
                {isCheckedIn
                  ? "Attendee Checked In"
                  : isSubmitting
                  ? "Checking In..."
                  : "Check In Attendee"}
              </span>
            </button>
          </div>
        </section>
      </main>

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </div>
  );
};

export default ValidateTicket;