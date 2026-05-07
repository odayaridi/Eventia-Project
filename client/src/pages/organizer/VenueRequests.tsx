import React, { useEffect, useMemo, useState } from "react";
import {
  Hourglass,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  CircleAlert,
  CalendarDays,
  Building2,
  Clock3,
  FileText,
} from "lucide-react";
import "./VenueRequests.css";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";
import {
  countVenueRequestsForEvents,
  fetchVenueRequestsForEvents,
  type VenueRequestCounts,
  type VenueRequestItem,
} from "../../api/eventApi";

const DEFAULT_COUNTS: VenueRequestCounts = {
  pendingRequestsCount: 0,
  approvedRequestsCount: 0,
  rejectedRequestsCount: 0,
};

const VenueRequests: React.FC = () => {
  const [counts, setCounts] = useState<VenueRequestCounts>(DEFAULT_COUNTS);
  const [requests, setRequests] = useState<VenueRequestItem[]>([]);
  const [isCountsLoading, setIsCountsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const loadCounts = async () => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      setIsCountsLoading(false);
      return;
    }

    try {
      setIsCountsLoading(true);
      const data = await countVenueRequestsForEvents(organizerId);
      setCounts(data);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load venue request counts.";
      showAlert(msg, "error");
    } finally {
      setIsCountsLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      setIsTableLoading(false);
      return;
    }

    try {
      setIsTableLoading(true);
      const data = await fetchVenueRequestsForEvents(organizerId);
      setRequests(data);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load venue requests.";
      showAlert(msg, "error");
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
    loadRequests();
  }, []);

  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "rejected";
    return "pending";
  };

  const formatEventDate = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRequested = (requested: string) => {
    const normalized = requested.replace(" ", "T");
    const parsedDate = new Date(normalized);

    if (Number.isNaN(parsedDate.getTime())) return requested;

    return parsedDate.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <div className="page-header">
          <h2 className="page-title">Venue Requests</h2>
          <p className="page-subtitle">Track your venue booking requests.</p>
        </div>

        <div className="venue-requests-stats-grid">
          {/* Card: Pending */}
          <div className="surface-card venue-requests-stat-card">
            <div className="venue-requests-stat-icon pending">
              <Hourglass size={20} />
            </div>
            <div>
              <span className="venue-requests-stat-label">Pending</span>
              {isCountsLoading ? (
                <div className="venue-requests-stat-loading">
                  <LoaderCircle size={18} className="spin-icon" />
                  <span>Loading...</span>
                </div>
              ) : (
                <h3 className="venue-requests-stat-value">{counts.pendingRequestsCount}</h3>
              )}
            </div>
          </div>

          {/* Card: Approved */}
          <div className="surface-card venue-requests-stat-card">
            <div className="venue-requests-stat-icon approved">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="venue-requests-stat-label">Approved</span>
              {isCountsLoading ? (
                <div className="venue-requests-stat-loading">
                  <LoaderCircle size={18} className="spin-icon" />
                  <span>Loading...</span>
                </div>
              ) : (
                <h3 className="venue-requests-stat-value">{counts.approvedRequestsCount}</h3>
              )}
            </div>
          </div>

          {/* Card: Rejected */}
          <div className="surface-card venue-requests-stat-card">
            <div className="venue-requests-stat-icon rejected">
              <XCircle size={20} />
            </div>
            <div>
              <span className="venue-requests-stat-label">Rejected</span>
              {isCountsLoading ? (
                <div className="venue-requests-stat-loading">
                  <LoaderCircle size={18} className="spin-icon" />
                  <span>Loading...</span>
                </div>
              ) : (
                <h3 className="venue-requests-stat-value">{counts.rejectedRequestsCount}</h3>
              )}
            </div>
          </div>
        </div>

        <div className="surface-card venue-requests-table-card">
          <div className="venue-requests-table-header">
            <div>
              <h3 className="venue-requests-section-title">All Venue Requests</h3>
              <p className="venue-requests-section-subtitle">
                Review the status of your event venue booking requests.
              </p>
            </div>
          </div>

          {isTableLoading ? (
            <div className="venue-requests-table-state">
              <LoaderCircle size={22} className="spin-icon" />
              <span>Loading venue requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="venue-requests-empty-state">
              <div className="venue-requests-empty-icon">
                <FileText size={26} />
              </div>
              <h3>No venue requests found</h3>
              <p>There are currently no venue booking requests to show.</p>
            </div>
          ) : (
            <div className="venue-requests-table-wrapper">
              <table className="venue-requests-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Venue Name</th>
                    <th>Event Date</th>
                    <th>Timing</th>
                    <th>Requested</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request, index) => (
                    <tr key={`${request.eventName}-${request.venueName}-${request.requested}-${index}`}>
                      <td>
                        <div className="venue-requests-cell-with-icon">
                          <FileText size={15} />
                          <span>{request.eventName}</span>
                        </div>
                      </td>

                      <td>
                        <div className="venue-requests-cell-with-icon">
                          <Building2 size={15} />
                          <span>{request.venueName}</span>
                        </div>
                      </td>

                      <td>
                        <div className="venue-requests-cell-with-icon">
                          <CalendarDays size={15} />
                          <span>{formatEventDate(request.eventDate)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="venue-requests-cell-with-icon">
                          <Clock3 size={15} />
                          <span>{request.timing}</span>
                        </div>
                      </td>

                      <td>{formatRequested(request.requested)}</td>

                      <td>
                        <span
                          className={`venue-requests-status-badge ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VenueRequests;