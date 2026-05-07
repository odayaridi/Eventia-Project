import React, { useEffect, useMemo, useState } from "react";
import {
  MailQuestion,
  Eye,
  CheckCircle2,
  CircleAlert,
  X,
  Inbox,
  CalendarDays,
} from "lucide-react";
import { Paper } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import "./ContactRequests.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getAttendeeRequests,
  resolveAttendeeReq,
  getManagerRequests,
  resolveManagerReq,
  getOrganizerRequests,
  resolveOrganizerReq,
  type ContactRequestItem,
} from "../../api/adminApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

type RequestRow = ContactRequestItem & {
  id: number;
};

type RequestRole = "attendee" | "organizer" | "manager";

const formatDateTime = (value: string) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ContactRequests: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [attendeeRequests, setAttendeeRequests] = useState<RequestRow[]>([]);
  const [organizerRequests, setOrganizerRequests] = useState<RequestRow[]>([]);
  const [managerRequests, setManagerRequests] = useState<RequestRow[]>([]);

  const [loadingAttendee, setLoadingAttendee] = useState(true);
  const [loadingOrganizer, setLoadingOrganizer] = useState(true);
  const [loadingManager, setLoadingManager] = useState(true);

  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const [viewTarget, setViewTarget] = useState<{
    role: RequestRole;
    row: RequestRow;
  } | null>(null);

  const fetchAttendeeRequests = async () => {
    try {
      setLoadingAttendee(true);
      const data = await getAttendeeRequests();
      setAttendeeRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load attendee requests.";
      showAlert(errorMessage, "error");
      setAttendeeRequests([]);
    } finally {
      setLoadingAttendee(false);
    }
  };

  const fetchOrganizerRequests = async () => {
    try {
      setLoadingOrganizer(true);
      const data = await getOrganizerRequests();
      setOrganizerRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load organizer requests.";
      showAlert(errorMessage, "error");
      setOrganizerRequests([]);
    } finally {
      setLoadingOrganizer(false);
    }
  };

  const fetchManagerRequests = async () => {
    try {
      setLoadingManager(true);
      const data = await getManagerRequests();
      setManagerRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load manager requests.";
      showAlert(errorMessage, "error");
      setManagerRequests([]);
    } finally {
      setLoadingManager(false);
    }
  };

  useEffect(() => {
    fetchAttendeeRequests();
    fetchOrganizerRequests();
    fetchManagerRequests();
  }, []);

  const handleResolve = async (role: RequestRole, row: RequestRow) => {
    const key = `${role}-${row.id}`;

    try {
      setProcessingKey(key);

      if (role === "attendee") {
        await resolveAttendeeReq(row.id);
        showAlert("Attendee request resolved successfully.", "success");
        await fetchAttendeeRequests();
      } else if (role === "organizer") {
        await resolveOrganizerReq(row.id);
        showAlert("Organizer request resolved successfully.", "success");
        await fetchOrganizerRequests();
      } else {
        await resolveManagerReq(row.id);
        showAlert("Manager request resolved successfully.", "success");
        await fetchManagerRequests();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resolve request.";
      showAlert(errorMessage, "error");
    } finally {
      setProcessingKey(null);
    }
  };

  const commonColumns = (role: RequestRole): GridColDef[] => [
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.35,
      minWidth: 220,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "subject",
      headerName: "Subject",
      flex: 1.1,
      minWidth: 180,
    },
    {
      field: "message",
      headerName: "Message",
      flex: 1.4,
      minWidth: 240,
      sortable: false,
      renderCell: (params) => (
        <div className="contact-requests-message-cell">
          {params.value && String(params.value).length > 80
            ? `${String(params.value).slice(0, 80)}...`
            : params.value}
        </div>
      ),
    },
    {
      field: "created_at",
      headerName: "Sent",
      flex: 1,
      minWidth: 170,
      valueFormatter: (value) => formatDateTime(String(value)),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.2,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => {
        const key = `${role}-${params.row.id}`;
        const isBusy = processingKey === key;

        return (
          <div className="contact-requests-actions-cell">
            <button
              type="button"
              className="contact-requests-view-btn"
              onClick={() => setViewTarget({ role, row: params.row })}
              disabled={isBusy}
            >
              <Eye size={15} />
              <span>View</span>
            </button>

            <button
              type="button"
              className="contact-requests-resolve-btn"
              onClick={() => handleResolve(role, params.row)}
              disabled={isBusy}
            >
              <CheckCircle2 size={15} />
              <span>{isBusy ? "Resolving..." : "Resolve"}</span>
            </button>
          </div>
        );
      },
    },
  ];

  const attendeeRows = useMemo(
    () => attendeeRequests.map((item) => ({ ...item })),
    [attendeeRequests]
  );

  const organizerRows = useMemo(
    () => organizerRequests.map((item) => ({ ...item })),
    [organizerRequests]
  );

  const managerRows = useMemo(
    () => managerRequests.map((item) => ({ ...item })),
    [managerRequests]
  );

  const renderTableSection = (
    title: string,
    subtitle: string,
    role: RequestRole,
    rows: RequestRow[],
    loading: boolean
  ) => {
    const roleColumns = commonColumns(role);

    return (
      <section className="surface-card contact-requests-section-card">
        <div className="contact-requests-table-header">
          <div className="contact-requests-title-wrap">
            <div className="contact-requests-title-icon">
              <Inbox size={18} />
            </div>

            <div>
              <h2 className="contact-requests-section-title">{title}</h2>
              <p className="contact-requests-section-subtitle">{subtitle}</p>
            </div>
          </div>
        </div>

        {!loading && rows.length === 0 ? (
          <div className="contact-requests-state-box empty">
            <div className="contact-requests-empty-icon">
              <CircleAlert size={22} />
            </div>
            <h3>No requests found</h3>
            <p>There are currently no open contact requests in this section.</p>
          </div>
        ) : (
          <Paper elevation={0} className="contact-requests-table-paper">
            <DataGrid
              rows={rows}
              columns={roleColumns}
              loading={loading}
              disableRowSelectionOnClick
              getRowHeight={() => 72}
              pageSizeOptions={[5, 10, 20, 50]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              className="contact-requests-data-grid"
              sx={{
                border: "none",
                backgroundColor: "transparent",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#fff7ed",
                  color: "#9a3412",
                  borderBottom: "1px solid #fed7aa",
                  fontWeight: 700,
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 700,
                  fontSize: "0.9rem",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #eef2f7",
                  color: "#0f172a",
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#fffaf5",
                },
                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#fcfcfd",
                },
                "& .MuiTablePagination-root": {
                  color: "#475569",
                },
                "& .MuiDataGrid-overlay": {
                  backgroundColor: "transparent",
                },
              }}
            />
          </Paper>
        )}
      </section>
    );
  };

  return (
    <>
      <div className="page-shell contact-requests-page-shell">
        <div className="page-header">
          <h1 className="page-title">Contact Requests</h1>
          <p className="page-subtitle">
            Review and manage attendee, organizer, and venue manager support
            requests from one centralized admin workspace.
          </p>
        </div>

        {renderTableSection(
          "Attendee Requests",
          "Review incoming attendee support requests and resolve them when handled.",
          "attendee",
          attendeeRows,
          loadingAttendee
        )}

        {renderTableSection(
          "Organizer Requests",
          "Inspect event organizer support inquiries and mark them resolved when completed.",
          "organizer",
          organizerRows,
          loadingOrganizer
        )}

        {renderTableSection(
          "Manager Requests",
          "Manage venue manager support requests and resolve them directly from the table.",
          "manager",
          managerRows,
          loadingManager
        )}

        <AlertSnackbar
          open={open}
          message={message}
          severity={severity}
          onClose={handleClose}
        />
      </div>

      {viewTarget && (
        <div
          className="contact-requests-modal-overlay"
          onClick={() => setViewTarget(null)}
        >
          <div
            className="contact-requests-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="contact-requests-modal-header">
              <div>
                <h3 className="contact-requests-modal-title">Request Details</h3>
                <p className="contact-requests-modal-subtitle">
                  Full request information for review.
                </p>
              </div>

              <button
                type="button"
                className="contact-requests-close-btn"
                onClick={() => setViewTarget(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="contact-requests-details-grid">
              <div className="contact-requests-detail-card">
                <span className="contact-requests-detail-label">Username</span>
                <p>{viewTarget.row.username}</p>
              </div>

              <div className="contact-requests-detail-card">
                <span className="contact-requests-detail-label">Email</span>
                <p>{viewTarget.row.email}</p>
              </div>

              <div className="contact-requests-detail-card">
                <span className="contact-requests-detail-label">Phone Number</span>
                <p>{viewTarget.row.phoneNumber}</p>
              </div>

              <div className="contact-requests-detail-card">
                <span className="contact-requests-detail-label">Sent</span>
                <p>{formatDateTime(viewTarget.row.created_at)}</p>
              </div>

              <div className="contact-requests-detail-card contact-requests-detail-card-full">
                <span className="contact-requests-detail-label">Subject</span>
                <p>{viewTarget.row.subject}</p>
              </div>

              <div className="contact-requests-detail-card contact-requests-detail-card-full">
                <span className="contact-requests-detail-label">Message</span>
                <div className="contact-requests-full-message">
                  {viewTarget.row.message}
                </div>
              </div>
            </div>

            <div className="contact-requests-modal-footer">
              <button
                type="button"
                className="contact-requests-modal-resolve-btn"
                onClick={async () => {
                  await handleResolve(viewTarget.role, viewTarget.row);
                  setViewTarget(null);
                }}
                disabled={processingKey === `${viewTarget.role}-${viewTarget.row.id}`}
              >
                <CheckCircle2 size={16} />
              <span>
  {processingKey === `${viewTarget.role}-${viewTarget.row.id}`
    ? "Resolving..."
    : "Resolve Request"}
</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactRequests;