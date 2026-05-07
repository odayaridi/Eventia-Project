// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Clock3,
//   CalendarDays,
//   CheckCircle2,
//   XCircle,
//   Hourglass,
//   Eye,
//   LoaderCircle,
//   CircleAlert,
//   X,
//   User,
//   Tag,
//   FileText,
//   Users,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import "./EventRequests.css";
// import {
//   acceptEventReqToVenue,
//   countEventReqsStatus,
//   fetchEventReqsToVenue,
//   rejectEventReqToVenue,
//   type EventRequestCounts,
//   type EventRequestItem,
// } from "../../api/venueApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";

// const DEFAULT_COUNTS: EventRequestCounts = {
//   pendingRequestsCount: 0,
//   approvedRequestsCount: 0,
//   rejectedRequestsCount: 0,
// };

// const PAGE_SIZE = 10;

// const EventRequests: React.FC = () => {
//   const [counts, setCounts] = useState<EventRequestCounts>(DEFAULT_COUNTS);
//   const [requests, setRequests] = useState<EventRequestItem[]>([]);
//   const [selectedRequest, setSelectedRequest] = useState<EventRequestItem | null>(null);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRequests, setTotalRequests] = useState(0);

//   const [isCountsLoading, setIsCountsLoading] = useState(true);
//   const [isTableLoading, setIsTableLoading] = useState(true);
//   const [isActionLoading, setIsActionLoading] = useState(false);

//   const [countsError, setCountsError] = useState("");
//   const [tableError, setTableError] = useState("");

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const managerId = useMemo(() => {
//     const raw = localStorage.getItem("managerId");
//     return raw ? Number(raw) : null;
//   }, []);

//   useEffect(() => {
//     const hasOpenModal = !!selectedRequest;
//     if (hasOpenModal) {
//       document.body.classList.add("modal-open");
//     } else {
//       document.body.classList.remove("modal-open");
//     }

//     return () => {
//       document.body.classList.remove("modal-open");
//     };
//   }, [selectedRequest]);

//   const loadCounts = async () => {
//     if (!managerId || Number.isNaN(managerId)) {
//       const msg = "Manager ID was not found. Please log in again.";
//       setCountsError(msg);
//       setIsCountsLoading(false);
//       showAlert(msg, "error");
//       return;
//     }

//     try {
//       setCountsError("");
//       setIsCountsLoading(true);

//       const data = await countEventReqsStatus(managerId);
//       setCounts(data);
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to load event request counts.";
//       setCountsError(msg);
//       showAlert(msg, "error");
//     } finally {
//       setIsCountsLoading(false);
//     }
//   };

//   const loadRequests = async (targetPage: number) => {
//     if (!managerId || Number.isNaN(managerId)) {
//       const msg = "Manager ID was not found. Please log in again.";
//       setTableError(msg);
//       setIsTableLoading(false);
//       showAlert(msg, "error");
//       return;
//     }

//     try {
//       setTableError("");
//       setIsTableLoading(true);

//       const data = await fetchEventReqsToVenue({
//         managerId,
//         page: targetPage,
//         limit: PAGE_SIZE,
//       });

//       setRequests(data.requests || []);
//       setPage(data.page || 1);
//       setTotalPages(data.totalPages || 1);
//       setTotalRequests(data.total || 0);
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to load event requests.";
//       setTableError(msg);
//       showAlert(msg, "error");
//     } finally {
//       setIsTableLoading(false);
//     }
//   };

//   const refreshAll = async (targetPage = page) => {
//     await Promise.all([loadCounts(), loadRequests(targetPage)]);
//   };

//   useEffect(() => {
//     refreshAll(1);
//   }, []);

//   const formatDate = (date: string) => {
//     const parsedDate = new Date(`${date}T00:00:00`);
//     return parsedDate.toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const formatTime = (time: string) => {
//     const [hours = "0", minutes = "0"] = time.split(":");
//     const date = new Date();
//     date.setHours(Number(hours), Number(minutes), 0, 0);

//     return date.toLocaleTimeString(undefined, {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const handleOpenRequest = (request: EventRequestItem) => {
//     setSelectedRequest(request);
//   };

//   const handleCloseRequest = () => {
//     if (isActionLoading) return;
//     setSelectedRequest(null);
//   };

//   const handleApprove = async () => {
//     if (!selectedRequest) return;

//     try {
//       setIsActionLoading(true);

//       await acceptEventReqToVenue({
//         eventId: selectedRequest.eventId,
//         venueAvailabilityId: selectedRequest.venueAvailabilityId,
//       });

//       const pageAfterAction =
//         requests.length === 1 && page > 1 ? page - 1 : page;

//       setSelectedRequest(null);
//       await refreshAll(pageAfterAction);
//       showAlert("Event request approved successfully.", "success");
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to approve event request.";
//       showAlert(msg, "error");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   const handleReject = async () => {
//     if (!selectedRequest) return;

//     try {
//       setIsActionLoading(true);

//       await rejectEventReqToVenue({
//         eventId: selectedRequest.eventId,
//         venueAvailabilityId: selectedRequest.venueAvailabilityId,
//       });

//       const pageAfterAction =
//         requests.length === 1 && page > 1 ? page - 1 : page;

//       setSelectedRequest(null);
//       await refreshAll(pageAfterAction);
//       showAlert("Event request rejected successfully.", "success");
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to reject event request.";
//       showAlert(msg, "error");
//     } finally {
//       setIsActionLoading(false);
//     }
//   };

//   const handlePrevPage = async () => {
//     if (page <= 1 || isTableLoading) return;
//     await loadRequests(page - 1);
//   };

//   const handleNextPage = async () => {
//     if (page >= totalPages || isTableLoading) return;
//     await loadRequests(page + 1);
//   };

//   return (
//     <>
//       <div className="page-shell">
//         <div className="page-header">
//           <h2 className="page-title">Event Requests</h2>
//           <p className="page-subtitle">
//             Review and manage event booking requests for your venue.
//           </p>
//         </div>

//         <div className="event-requests-stats-grid">
//           <div className="surface-card event-requests-stat-card">
//             <div className="event-requests-stat-icon pending">
//               <Hourglass size={24} />
//             </div>
//             <div className="event-requests-stat-info">
//               <span className="event-requests-stat-label">Pending</span>
//               {isCountsLoading ? (
//                 <div className="event-requests-stat-loading">
//                   <LoaderCircle size={16} className="spin-icon" />
//                 </div>
//               ) : countsError ? (
//                 <p className="event-requests-stat-error">!</p>
//               ) : (
//                 <h3 className="event-requests-stat-value">{counts.pendingRequestsCount}</h3>
//               )}
//             </div>
//           </div>

//           <div className="surface-card event-requests-stat-card">
//             <div className="event-requests-stat-icon approved">
//               <CheckCircle2 size={24} />
//             </div>
//             <div className="event-requests-stat-info">
//               <span className="event-requests-stat-label">Approved</span>
//               {isCountsLoading ? (
//                 <div className="event-requests-stat-loading">
//                   <LoaderCircle size={16} className="spin-icon" />
//                 </div>
//               ) : countsError ? (
//                 <p className="event-requests-stat-error">!</p>
//               ) : (
//                 <h3 className="event-requests-stat-value">{counts.approvedRequestsCount}</h3>
//               )}
//             </div>
//           </div>

//           <div className="surface-card event-requests-stat-card">
//             <div className="event-requests-stat-icon rejected">
//               <XCircle size={24} />
//             </div>
//             <div className="event-requests-stat-info">
//               <span className="event-requests-stat-label">Rejected</span>
//               {isCountsLoading ? (
//                 <div className="event-requests-stat-loading">
//                   <LoaderCircle size={16} className="spin-icon" />
//                 </div>
//               ) : countsError ? (
//                 <p className="event-requests-stat-error">!</p>
//               ) : (
//                 <h3 className="event-requests-stat-value">{counts.rejectedRequestsCount}</h3>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="surface-card event-requests-table-card">
//           <div className="event-requests-table-header">
//             <div>
//               <h3 className="event-requests-section-title">Venue Booking Requests</h3>
//               <p className="event-requests-section-subtitle">
//                 Browse event requests and review full event details before taking action.
//               </p>
//             </div>

//             {!isTableLoading && !tableError && (
//               <div className="event-requests-total-badge">
//                 Total: {totalRequests}
//               </div>
//             )}
//           </div>

//           {isTableLoading ? (
//             <div className="event-requests-table-state">
//               <LoaderCircle size={22} className="spin-icon" />
//               <span>Loading event requests...</span>
//             </div>
//           ) : tableError ? (
//             <div className="event-requests-table-state event-requests-table-error">
//               <CircleAlert size={20} />
//               <span>{tableError}</span>
//             </div>
//           ) : requests.length === 0 ? (
//             <div className="event-requests-empty-state">
//               <div className="event-requests-empty-icon">
//                 <FileText size={26} />
//               </div>
//               <h3>No event requests found</h3>
//               <p>There are currently no event booking requests for your venue.</p>
//             </div>
//           ) : (
//             <>
//               <div className="event-requests-table-wrapper">
//                 <table className="event-requests-table">
//                   <thead>
//                     <tr>
//                       <th>Event Name</th>
//                       <th>Event Type</th>
//                       <th>Event Date</th>
//                       <th>Start Time</th>
//                       <th>End Time</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {requests.map((request) => (
//                       <tr key={`${request.eventId}-${request.venueAvailabilityId}`}>
//                         <td>{request.eventName}</td>
//                         <td>{request.eventType}</td>
//                         <td>{formatDate(request.eventDate)}</td>
//                         <td>{formatTime(request.startTime)}</td>
//                         <td>{formatTime(request.endTime)}</td>
//                         <td>
//                           <button
//                             type="button"
//                             className="event-requests-view-btn"
//                             onClick={() => handleOpenRequest(request)}
//                           >
//                             <Eye size={16} />
//                             <span>View</span>
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="event-requests-pagination">
//                 <button
//                   type="button"
//                   className="event-requests-page-btn"
//                   onClick={handlePrevPage}
//                   disabled={page <= 1 || isTableLoading}
//                 >
//                   <ChevronLeft size={16} />
//                   <span>Previous</span>
//                 </button>

//                 <div className="event-requests-page-indicator">
//                   Page {page} of {totalPages}
//                 </div>

//                 <button
//                   type="button"
//                   className="event-requests-page-btn"
//                   onClick={handleNextPage}
//                   disabled={page >= totalPages || isTableLoading}
//                 >
//                   <span>Next</span>
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {selectedRequest && (
//         <div className="event-requests-modal-overlay" onClick={handleCloseRequest}>
//           <div
//             className="event-requests-modal"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="event-requests-modal-header">
//               <div>
//                 <h3>{selectedRequest.eventName}</h3>
//                 <p>Review the complete event request details below.</p>
//               </div>

//               <button
//                 type="button"
//                 className="event-requests-close-btn"
//                 onClick={handleCloseRequest}
//                 aria-label="Close"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="event-requests-modal-body">
//               <div className="event-requests-details-grid">
//                 <div className="event-requests-detail-item">
//                   <div className="event-requests-detail-label">
//                     <User size={15} />
//                     <span>Organizer Username</span>
//                   </div>
//                   <p>{selectedRequest.organizerUsername}</p>
//                 </div>

//                 <div className="event-requests-detail-item">
//                   <div className="event-requests-detail-label">
//                     <FileText size={15} />
//                     <span>Event Name</span>
//                   </div>
//                   <p>{selectedRequest.eventName}</p>
//                 </div>

//                 <div className="event-requests-detail-item">
//                   <div className="event-requests-detail-label">
//                     <Tag size={15} />
//                     <span>Event Type</span>
//                   </div>
//                   <p>{selectedRequest.eventType}</p>
//                 </div>

//                 <div className="event-requests-detail-item">
//                   <div className="event-requests-detail-label">
//                     <CalendarDays size={15} />
//                     <span>Event Date</span>
//                   </div>
//                   <p>{formatDate(selectedRequest.eventDate)}</p>
//                 </div>

//                 <div className="event-requests-detail-item">
//                   <div className="event-requests-detail-label">
//                     <Clock3 size={15} />
//                     <span>Start Time</span>
//                   </div>
//                   <p>{formatTime(selectedRequest.startTime)}</p>
//                 </div>

//                 <div className="event-requests-detail-item">
//                   <div className="event-requests-detail-label">
//                     <Clock3 size={15} />
//                     <span>End Time</span>
//                   </div>
//                   <p>{formatTime(selectedRequest.endTime)}</p>
//                 </div>

//                 <div className="event-requests-detail-item event-requests-detail-item-full">
//                   <div className="event-requests-detail-label">
//                     <FileText size={15} />
//                     <span>Event Description</span>
//                   </div>
//                   <p>{selectedRequest.eventDescription}</p>
//                 </div>

//                 <div className="event-requests-detail-item">
//                   <div className="event-requests-detail-label">
//                     <Users size={15} />
//                     <span>Event Capacity</span>
//                   </div>
//                   <p>{selectedRequest.eventCapacity}</p>
//                 </div>
//               </div>

//               <div className="event-requests-modal-actions">
//                 <button
//                   type="button"
//                   className="event-requests-reject-btn"
//                   onClick={handleReject}
//                   disabled={isActionLoading}
//                 >
//                   {isActionLoading ? (
//                     <>
//                       <LoaderCircle size={18} className="spin-icon" />
//                       <span>Processing...</span>
//                     </>
//                   ) : (
//                     <>
//                       <XCircle size={18} />
//                       <span>Reject</span>
//                     </>
//                   )}
//                 </button>

//                 <button
//                   type="button"
//                   className="event-requests-approve-btn"
//                   onClick={handleApprove}
//                   disabled={isActionLoading}
//                 >
//                   {isActionLoading ? (
//                     <>
//                       <LoaderCircle size={18} className="spin-icon" />
//                       <span>Processing...</span>
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle2 size={18} />
//                       <span>Approve</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <AlertSnackbar
//         open={open}
//         message={message}
//         severity={severity}
//         onClose={handleClose}
//       />
//     </>
//   );
// };

// export default EventRequests;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Hourglass,
  Eye,
  LoaderCircle,
  CircleAlert,
  X,
  User,
  Tag,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import "./EventRequests.css";
import {
  acceptEventReqToVenue,
  countEventReqsStatus,
  fetchEventReqsToVenue,
  rejectEventReqToVenue,
  type EventRequestCounts,
  type EventRequestItem,
} from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

const DEFAULT_COUNTS: EventRequestCounts = {
  pendingRequestsCount: 0,
  approvedRequestsCount: 0,
  rejectedRequestsCount: 0,
};

const PAGE_SIZE = 10;

const EventRequests: React.FC = () => {
  const navigate = useNavigate();

  const [counts, setCounts] = useState<EventRequestCounts>(DEFAULT_COUNTS);
  const [requests, setRequests] = useState<EventRequestItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EventRequestItem | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  const [isCountsLoading, setIsCountsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [countsError, setCountsError] = useState("");
  const [tableError, setTableError] = useState("");

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const managerId = useMemo(() => {
    const raw = localStorage.getItem("managerId");
    return raw ? Number(raw) : null;
  }, []);

  useEffect(() => {
    const hasOpenModal = !!selectedRequest;
    if (hasOpenModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [selectedRequest]);

  const loadCounts = async () => {
    if (!managerId || Number.isNaN(managerId)) {
      const msg = "Manager ID was not found. Please log in again.";
      setCountsError(msg);
      setIsCountsLoading(false);
      showAlert(msg, "error");
      return;
    }

    try {
      setCountsError("");
      setIsCountsLoading(true);

      const data = await countEventReqsStatus(managerId);
      setCounts(data);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load event request counts.";
      setCountsError(msg);
      showAlert(msg, "error");
    } finally {
      setIsCountsLoading(false);
    }
  };

  const loadRequests = async (targetPage: number) => {
    if (!managerId || Number.isNaN(managerId)) {
      const msg = "Manager ID was not found. Please log in again.";
      setTableError(msg);
      setIsTableLoading(false);
      showAlert(msg, "error");
      return;
    }

    try {
      setTableError("");
      setIsTableLoading(true);

      const data = await fetchEventReqsToVenue({
        managerId,
        page: targetPage,
        limit: PAGE_SIZE,
      });

      setRequests(data.requests || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotalRequests(data.total || 0);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load event requests.";
      setTableError(msg);
      showAlert(msg, "error");
    } finally {
      setIsTableLoading(false);
    }
  };

  const refreshAll = async (targetPage = page) => {
    await Promise.all([loadCounts(), loadRequests(targetPage)]);
  };

  useEffect(() => {
    refreshAll(1);
  }, []);

  const formatDate = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`);
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

  const normalizeStatus = (status: string) => {
    const value = (status || "").toLowerCase();
    if (value === "approved") return "Approved";
    if (value === "rejected") return "Rejected";
    return "Pending";
  };

  const handleOpenRequest = (request: EventRequestItem) => {
    setSelectedRequest(request);
  };

  const handleCloseRequest = () => {
    if (isActionLoading) return;
    setSelectedRequest(null);
  };

  const handleOpenMessage = (organizerId: number) => {
    navigate(`/venue/message-organizers/organizer/${organizerId}`);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setIsActionLoading(true);

      await acceptEventReqToVenue({
        eventId: selectedRequest.eventId,
        venueAvailabilityId: selectedRequest.venueAvailabilityId,
      });

      const pageAfterAction = requests.length === 1 && page > 1 ? page - 1 : page;

      setSelectedRequest(null);
      await refreshAll(pageAfterAction);
      showAlert("Event request approved successfully.", "success");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to approve event request.";
      showAlert(msg, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setIsActionLoading(true);

      await rejectEventReqToVenue({
        eventId: selectedRequest.eventId,
        venueAvailabilityId: selectedRequest.venueAvailabilityId,
      });

      const pageAfterAction = requests.length === 1 && page > 1 ? page - 1 : page;

      setSelectedRequest(null);
      await refreshAll(pageAfterAction);
      showAlert("Event request rejected successfully.", "success");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to reject event request.";
      showAlert(msg, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePrevPage = async () => {
    if (page <= 1 || isTableLoading) return;
    await loadRequests(page - 1);
  };

  const handleNextPage = async () => {
    if (page >= totalPages || isTableLoading) return;
    await loadRequests(page + 1);
  };

  return (
    <>
      <div className="page-shell">
        <div className="page-header">
          <h2 className="page-title">Event Requests</h2>
          <p className="page-subtitle">
            Review and manage event booking requests for your venue.
          </p>
        </div>

        <div className="event-requests-stats-grid">
          <div className="surface-card event-requests-stat-card">
            <div className="event-requests-stat-icon pending">
              <Hourglass size={24} />
            </div>
            <div className="event-requests-stat-info">
              <span className="event-requests-stat-label">Pending</span>
              {isCountsLoading ? (
                <div className="event-requests-stat-loading">
                  <LoaderCircle size={16} className="spin-icon" />
                </div>
              ) : countsError ? (
                <p className="event-requests-stat-error">!</p>
              ) : (
                <h3 className="event-requests-stat-value">{counts.pendingRequestsCount}</h3>
              )}
            </div>
          </div>

          <div className="surface-card event-requests-stat-card">
            <div className="event-requests-stat-icon approved">
              <CheckCircle2 size={24} />
            </div>
            <div className="event-requests-stat-info">
              <span className="event-requests-stat-label">Approved</span>
              {isCountsLoading ? (
                <div className="event-requests-stat-loading">
                  <LoaderCircle size={16} className="spin-icon" />
                </div>
              ) : countsError ? (
                <p className="event-requests-stat-error">!</p>
              ) : (
                <h3 className="event-requests-stat-value">{counts.approvedRequestsCount}</h3>
              )}
            </div>
          </div>

          <div className="surface-card event-requests-stat-card">
            <div className="event-requests-stat-icon rejected">
              <XCircle size={24} />
            </div>
            <div className="event-requests-stat-info">
              <span className="event-requests-stat-label">Rejected</span>
              {isCountsLoading ? (
                <div className="event-requests-stat-loading">
                  <LoaderCircle size={16} className="spin-icon" />
                </div>
              ) : countsError ? (
                <p className="event-requests-stat-error">!</p>
              ) : (
                <h3 className="event-requests-stat-value">{counts.rejectedRequestsCount}</h3>
              )}
            </div>
          </div>
        </div>

        <div className="surface-card event-requests-table-card">
          <div className="event-requests-table-header">
            <div>
              <h3 className="event-requests-section-title">Venue Booking Requests</h3>
              <p className="event-requests-section-subtitle">
                Browse event requests and review full event details before taking action.
              </p>
            </div>

            {!isTableLoading && !tableError && (
              <div className="event-requests-total-badge">
                Total: {totalRequests}
              </div>
            )}
          </div>

          {isTableLoading ? (
            <div className="event-requests-table-state">
              <LoaderCircle size={22} className="spin-icon" />
              <span>Loading event requests...</span>
            </div>
          ) : tableError ? (
            <div className="event-requests-table-state event-requests-table-error">
              <CircleAlert size={20} />
              <span>{tableError}</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="event-requests-empty-state">
              <div className="event-requests-empty-icon">
                <FileText size={26} />
              </div>
              <h3>No event requests found</h3>
              <p>There are currently no event booking requests for your venue.</p>
            </div>
          ) : (
            <>
              <div className="event-requests-table-wrapper">
                <table className="event-requests-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Event Type</th>
                      <th>Event Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((request) => {
                      const status = normalizeStatus(request.requestStatus);
                      const isPending = status === "Pending";

                      return (
                        <tr key={`${request.eventId}-${request.venueAvailabilityId}-${request.requestStatus}`}>
                          <td>{request.eventName}</td>
                          <td>{request.eventType}</td>
                          <td>{formatDate(request.eventDate)}</td>
                          <td>{formatTime(request.startTime)}</td>
                          <td>{formatTime(request.endTime)}</td>
                          <td>
                            <span
                              className={`event-requests-status-badge ${
                                status === "Approved"
                                  ? "approved"
                                  : status === "Rejected"
                                  ? "rejected"
                                  : "pending"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td>
                            <div className="event-requests-action-group">
                              {isPending ? (
                                <button
                                  type="button"
                                  className="event-requests-view-btn"
                                  onClick={() => handleOpenRequest(request)}
                                >
                                  <Eye size={16} />
                                  <span>View</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="event-requests-message-btn"
                                  onClick={() => handleOpenMessage(request.organizerId)}
                                >
                                  <MessageSquare size={16} />
                                  <span>Message</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="event-requests-pagination">
                <button
                  type="button"
                  className="event-requests-page-btn"
                  onClick={handlePrevPage}
                  disabled={page <= 1 || isTableLoading}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="event-requests-page-indicator">
                  Page {page} of {totalPages}
                </div>

                <button
                  type="button"
                  className="event-requests-page-btn"
                  onClick={handleNextPage}
                  disabled={page >= totalPages || isTableLoading}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedRequest && (
        <div className="event-requests-modal-overlay" onClick={handleCloseRequest}>
          <div
            className="event-requests-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="event-requests-modal-header">
              <div>
                <h3>{selectedRequest.eventName}</h3>
                <p>Review the complete event request details below.</p>
              </div>

              <button
                type="button"
                className="event-requests-close-btn"
                onClick={handleCloseRequest}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="event-requests-modal-body">
              <div className="event-requests-details-grid">
                <div className="event-requests-detail-item">
                  <div className="event-requests-detail-label">
                    <User size={15} />
                    <span>Organizer Username</span>
                  </div>
                  <p>{selectedRequest.organizerUsername}</p>
                </div>

                <div className="event-requests-detail-item">
                  <div className="event-requests-detail-label">
                    <FileText size={15} />
                    <span>Event Name</span>
                  </div>
                  <p>{selectedRequest.eventName}</p>
                </div>

                <div className="event-requests-detail-item">
                  <div className="event-requests-detail-label">
                    <Tag size={15} />
                    <span>Event Type</span>
                  </div>
                  <p>{selectedRequest.eventType}</p>
                </div>

                <div className="event-requests-detail-item">
                  <div className="event-requests-detail-label">
                    <CalendarDays size={15} />
                    <span>Event Date</span>
                  </div>
                  <p>{formatDate(selectedRequest.eventDate)}</p>
                </div>

                <div className="event-requests-detail-item">
                  <div className="event-requests-detail-label">
                    <Clock3 size={15} />
                    <span>Start Time</span>
                  </div>
                  <p>{formatTime(selectedRequest.startTime)}</p>
                </div>

                <div className="event-requests-detail-item">
                  <div className="event-requests-detail-label">
                    <Clock3 size={15} />
                    <span>End Time</span>
                  </div>
                  <p>{formatTime(selectedRequest.endTime)}</p>
                </div>

                <div className="event-requests-detail-item event-requests-detail-item-full">
                  <div className="event-requests-detail-label">
                    <FileText size={15} />
                    <span>Event Description</span>
                  </div>
                  <p>{selectedRequest.eventDescription}</p>
                </div>

                <div className="event-requests-detail-item">
                  <div className="event-requests-detail-label">
                    <Users size={15} />
                    <span>Event Capacity</span>
                  </div>
                  <p>{selectedRequest.eventCapacity}</p>
                </div>
              </div>

              <div className="event-requests-modal-actions">
                <button
                  type="button"
                  className="event-requests-message-btn event-requests-message-btn-modal"
                  onClick={() => handleOpenMessage(selectedRequest.organizerId)}
                  disabled={isActionLoading}
                >
                  <MessageSquare size={18} />
                  <span>Message</span>
                </button>

                <button
                  type="button"
                  className="event-requests-reject-btn"
                  onClick={handleReject}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <>
                      <LoaderCircle size={18} className="spin-icon" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={18} />
                      <span>Reject</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="event-requests-approve-btn"
                  onClick={handleApprove}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <>
                      <LoaderCircle size={18} className="spin-icon" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Approve</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </>
  );
};

export default EventRequests;



