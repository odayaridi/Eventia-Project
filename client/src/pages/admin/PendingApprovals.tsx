import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  Search,
  FileText,
  Download,
  X,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
} from "lucide-react";
import { Paper } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import "./PendingApprovals.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getPendingEventOrganizers,
  getPendingVenueManagers,
  acceptVenueManager,
  rejectVenueManager,
  acceptEventOrganizer,
  rejectEventOrganizer,
  type PendingEventOrganizerItem,
  type PendingVenueManagerItem,
} from "../../api/adminApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import axiosInstance from "../../api/interceptor/axiosInstance";

type ApprovalRole = "eventOrganizer" | "venueManager";
type EventOrganizerRow = PendingEventOrganizerItem & { id: string };
type VenueManagerRow = PendingVenueManagerItem & { id: string };

const getBackendBaseUrl = () => {
  const rawBaseUrl = String(axiosInstance.defaults.baseURL || "");
  return rawBaseUrl.replace(/\/api\/?$/, "");
};

const buildDocumentUrl = (fileName: string) => {
  const baseUrl = getBackendBaseUrl();
  return `${baseUrl}/uploads/documents/${fileName}`;
};

const PendingApprovals: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [selectedRole, setSelectedRole] =
    useState<ApprovalRole>("eventOrganizer");
  const [appliedRole, setAppliedRole] =
    useState<ApprovalRole>("eventOrganizer");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<(EventOrganizerRow | VenueManagerRow)[]>([]);
  const [total, setTotal] = useState(0);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerFileUrl, setViewerFileUrl] = useState("");
  const [viewerFileName, setViewerFileName] = useState("");

  const [processingRowKey, setProcessingRowKey] = useState<string | null>(null);

  const fetchData = async (role: ApprovalRole, showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      if (role === "eventOrganizer") {
        const data = await getPendingEventOrganizers(page, pageSize, "");

        const safeRows = (data.pendingEventOrganizers || []).map(
          (item, index) => ({
            id: `eo-${page}-${index}-${item.username}`,
            ...item,
          })
        );

        setRows(safeRows);
        setTotal(Number(data.total || 0));
      } else {
        const data = await getPendingVenueManagers(page, pageSize, "");

        const safeRows = (data.pendingVenueManagers || []).map(
          (item, index) => ({
            id: `vm-${page}-${index}-${item.username}`,
            ...item,
          })
        );

        setRows(safeRows);
        setTotal(Number(data.total || 0));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load pending approvals.";

      showAlert(errorMessage, "error");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(appliedRole, true);
  }, [appliedRole, page, pageSize]);

  const handleQuery = () => {
    setAppliedRole(selectedRole);
    setPage(1);
  };

  const openDocumentViewer = (
    fileName: string | null | undefined,
    title: string
  ) => {
    if (!fileName) {
      showAlert("Document was not found.", "warning");
      return;
    }

    const fileUrl = buildDocumentUrl(fileName);

    setViewerFileName(fileName);
    setViewerFileUrl(fileUrl);
    setViewerTitle(title);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerTitle("");
    setViewerFileUrl("");
    setViewerFileName("");
  };

  const handleDownload = () => {
    if (!viewerFileUrl) return;

    const anchor = document.createElement("a");
    anchor.href = viewerFileUrl;
    anchor.download = viewerFileName || "document";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const refreshAfterAction = async () => {
    if (rows.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
      return;
    }

    await fetchData(appliedRole, false);
  };

  const handleApprove = async (row: EventOrganizerRow | VenueManagerRow) => {
    try {
      setProcessingRowKey(row.id);

      if (appliedRole === "eventOrganizer") {
        await acceptEventOrganizer(row.username);
        showAlert("Event organizer approved successfully.", "success");
      } else {
        await acceptVenueManager(row.username);
        showAlert("Venue manager approved successfully.", "success");
      }

      await refreshAfterAction();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Approval failed.";
      showAlert(errorMessage, "error");
    } finally {
      setProcessingRowKey(null);
    }
  };

  const handleReject = async (row: EventOrganizerRow | VenueManagerRow) => {
    try {
      setProcessingRowKey(row.id);

      if (appliedRole === "eventOrganizer") {
        await rejectEventOrganizer(row.username);
        showAlert("Event organizer rejected.", "info");
      } else {
        await rejectVenueManager(row.username);
        showAlert("Venue manager rejected.", "info");
      }

      await refreshAfterAction();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Rejection failed.";
      showAlert(errorMessage, "error");
    } finally {
      setProcessingRowKey(null);
    }
  };

  const firstNameColumn: GridColDef = {
    field: "firstName",
    headerName: "First Name",
    flex: 0.85,
    minWidth: 135,
    renderCell: (params) => (
      <div className="pa-name-cell">
        <div className="pa-avatar">
          {String(params.value || params.row.username || "?")[0].toUpperCase()}
        </div>
        <span className="pa-cell-text">{params.value || "—"}</span>
      </div>
    ),
  };

  const lastNameColumn: GridColDef = {
    field: "lastName",
    headerName: "Last Name",
    flex: 0.85,
    minWidth: 135,
    renderCell: (params) => (
      <span className="pa-cell-text">{params.value || "—"}</span>
    ),
  };

  const eventOrganizerColumns: GridColDef[] = [
    firstNameColumn,
    lastNameColumn,
    {
      field: "email",
      headerName: "Email",
      flex: 1.25,
      minWidth: 210,
      renderCell: (params) => (
        <span className="pa-cell-text">{params.value}</span>
      ),
    },
    {
      field: "username",
      headerName: "Username",
      flex: 0.85,
      minWidth: 135,
      renderCell: (params) => (
        <span className="pa-cell-muted">{params.value || "—"}</span>
      ),
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      flex: 0.85,
      minWidth: 140,
      renderCell: (params) => (
        <span className="pa-cell-muted">{params.value || "—"}</span>
      ),
    },
    {
      field: "organization",
      headerName: "Organization",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <span className="pa-cell-text">{params.value || "—"}</span>
      ),
    },
    {
      field: "commercialRegistrationDocument",
      headerName: "Document",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <button
          type="button"
          className="pa-doc-btn"
          onClick={() =>
            openDocumentViewer(
              params.row.commercialRegistrationDocument,
              `Commercial Registration — ${params.row.firstName || ""} ${
                params.row.lastName || ""
              }`
            )
          }
        >
          <FileText size={14} />
          <span>View</span>
        </button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const isBusy = processingRowKey === params.row.id;

        return (
          <div className="pa-actions-cell">
            <button
              type="button"
              className="pa-approve-btn"
              onClick={() => handleApprove(params.row)}
              disabled={isBusy}
            >
              <CheckCircle2 size={14} />
              <span>{isBusy ? "…" : "Approve"}</span>
            </button>

            <button
              type="button"
              className="pa-reject-btn"
              onClick={() => handleReject(params.row)}
              disabled={isBusy}
            >
              <XCircle size={14} />
              <span>{isBusy ? "…" : "Reject"}</span>
            </button>
          </div>
        );
      },
    },
  ];

  const venueManagerColumns: GridColDef[] = [
    firstNameColumn,
    lastNameColumn,
    {
      field: "email",
      headerName: "Email",
      flex: 1.35,
      minWidth: 210,
      renderCell: (params) => (
        <span className="pa-cell-text">{params.value}</span>
      ),
    },
    {
      field: "username",
      headerName: "Username",
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <span className="pa-cell-muted">{params.value || "—"}</span>
      ),
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <span className="pa-cell-muted">{params.value || "—"}</span>
      ),
    },
    {
      field: "venueAuthorizationDocument",
      headerName: "Document",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <button
          type="button"
          className="pa-doc-btn"
          onClick={() =>
            openDocumentViewer(
              params.row.venueAuthorizationDocument,
              `Venue Authorization — ${params.row.firstName || ""} ${
                params.row.lastName || ""
              }`
            )
          }
        >
          <FileText size={14} />
          <span>View</span>
        </button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const isBusy = processingRowKey === params.row.id;

        return (
          <div className="pa-actions-cell">
            <button
              type="button"
              className="pa-approve-btn"
              onClick={() => handleApprove(params.row)}
              disabled={isBusy}
            >
              <CheckCircle2 size={14} />
              <span>{isBusy ? "…" : "Approve"}</span>
            </button>

            <button
              type="button"
              className="pa-reject-btn"
              onClick={() => handleReject(params.row)}
              disabled={isBusy}
            >
              <XCircle size={14} />
              <span>{isBusy ? "…" : "Reject"}</span>
            </button>
          </div>
        );
      },
    },
  ];

  const columns = useMemo(
    () =>
      appliedRole === "eventOrganizer"
        ? eventOrganizerColumns
        : venueManagerColumns,
    [appliedRole, processingRowKey]
  );

  const paginationModel = useMemo(
    () => ({ page: page - 1, pageSize }),
    [page, pageSize]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    const newPage = model.page + 1;
    const newPageSize = model.pageSize;

    if (newPage !== page) setPage(newPage);

    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1);
    }
  };

  const isPdf = viewerFileUrl.toLowerCase().endsWith(".pdf");
  const isOrganizer = appliedRole === "eventOrganizer";

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
          <h2 className="page-title">Pending Approvals</h2>
          <p className="page-subtitle">
            Review unapproved accounts, inspect submitted documents, and process
            approval decisions.
          </p>
        </div>

        <div className="surface-card pa-filter-card">
          <div className="pa-filter-row">
            <div className="pa-filter-field">
              <label htmlFor="pa-role-select" className="pa-filter-label">
                Account type
              </label>

              <div className="pa-select-wrap">
                <select
                  id="pa-role-select"
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as ApprovalRole)
                  }
                >
                  <option value="eventOrganizer">Event Organizer</option>
                  <option value="venueManager">Venue Manager</option>
                </select>
                <ChevronDown size={15} className="pa-select-chevron" />
              </div>
            </div>

            <button
              type="button"
              className="pa-query-btn"
              onClick={handleQuery}
              disabled={loading}
            >
              <Search size={15} />
              <span>{loading ? "Loading…" : "Query"}</span>
            </button>
          </div>
        </div>

        <div className="surface-card pa-table-card">
          <div className="pa-table-header">
            <div className="pa-table-header-left">
              <div
                className={`pa-header-icon ${
                  isOrganizer ? "" : "pa-header-icon-venue"
                }`}
              >
                {isOrganizer ? <Users size={18} /> : <Building2 size={18} />}
              </div>

              <div>
                <h3 className="pa-table-title">
                  {isOrganizer
                    ? "Pending Event Organizers"
                    : "Pending Venue Managers"}
                </h3>
                <p className="pa-table-subtitle">
                  {isOrganizer
                    ? "Review organizer accounts and inspect commercial registration documents."
                    : "Review venue manager accounts and inspect authorization documents."}
                </p>
              </div>
            </div>

            {!loading && total > 0 && (
              <div className="pa-total-badge">{total} pending</div>
            )}
          </div>

          {!loading && total === 0 ? (
            <div className="pa-empty">
              <div className="pa-empty-icon">
                <ShieldCheck size={26} />
              </div>
              <h3>All clear</h3>
              <p>
                No pending{" "}
                {isOrganizer ? "event organizers" : "venue managers"} at this
                time.
              </p>
            </div>
          ) : (
            <Paper elevation={0} className="pa-grid-paper">
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                rowCount={total}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[5, 10, 20, 50]}
                disableRowSelectionOnClick
                getRowHeight={() => 68}
                className="pa-data-grid"
                sx={{
                  border: "none",
                  backgroundColor: "transparent",
                  fontFamily: "inherit",

                  "& .MuiDataGrid-main": {
                    overflow: "hidden",
                  },

                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "var(--color-surface-muted, #f8fafc)",
                    borderBottom: "1px solid var(--color-border, #e2e8f0)",
                    borderRadius: 0,
                  },

                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 700,
                    fontSize: "0.76rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-text-muted, #64748b)",
                  },

                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid var(--color-border, #f1f5f9)",
                    color: "var(--color-text, #0f172a)",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    outline: "none !important",
                    overflow: "hidden",
                  },

                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },

                  "& .MuiDataGrid-cell--textCenter": {
                    justifyContent: "center",
                  },

                  "& .MuiDataGrid-row": {
                    transition: "background 0.12s ease",
                  },

                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "var(--color-surface-muted, #f8fafc)",
                  },

                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "1px solid var(--color-border, #e2e8f0)",
                    backgroundColor: "var(--color-surface-muted, #f8fafc)",
                    minHeight: "52px",
                  },

                  "& .MuiTablePagination-root": {
                    color: "var(--color-text-muted, #64748b)",
                    fontSize: "0.85rem",
                  },

                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    {
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted, #64748b)",
                    },

                  "& .MuiDataGrid-columnSeparator": {
                    display: "none",
                  },

                  "& .MuiDataGrid-overlay": {
                    backgroundColor: "transparent",
                  },
                }}
              />
            </Paper>
          )}
        </div>
      </div>

      {viewerOpen && (
        <div className="pa-viewer-overlay" onClick={closeViewer}>
          <div className="pa-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pa-viewer-header">
              <div className="pa-viewer-header-left">
                <div className="pa-viewer-icon">
                  <FileText size={18} />
                </div>

                <div>
                  <h3 className="pa-viewer-title">{viewerTitle}</h3>
                  <p className="pa-viewer-subtitle">
                    Preview and download the submitted document.
                  </p>
                </div>
              </div>

              <div className="pa-viewer-actions">
                <button
                  type="button"
                  className="pa-download-btn"
                  onClick={handleDownload}
                >
                  <Download size={15} />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  className="pa-viewer-close-btn"
                  onClick={closeViewer}
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="pa-viewer-body">
              {isPdf ? (
                <iframe
                  src={viewerFileUrl}
                  title={viewerTitle}
                  className="pa-pdf-frame"
                />
              ) : (
                <div className="pa-file-fallback">
                  <div className="pa-fallback-icon">
                    <FileText size={36} />
                  </div>

                  <h4>Preview unavailable</h4>
                  <p>
                    This file type cannot be previewed. Open or download it
                    directly.
                  </p>

                  <div className="pa-fallback-actions">
                    <a
                      href={viewerFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pa-open-link-btn"
                    >
                      Open document
                    </a>

                    <button
                      type="button"
                      className="pa-download-btn"
                      onClick={handleDownload}
                    >
                      <Download size={15} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingApprovals;