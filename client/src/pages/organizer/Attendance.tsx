import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  BadgeCheck,
  UserX,
  ClipboardList,
  ChevronDown,
  Search,
  CircleAlert,
  LoaderCircle,
  PieChart as PieChartIcon,
  Ticket,
} from "lucide-react";
import { Paper, Chip } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import "./Attendance.css";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";
import {
  getFinishedOrganizerEventNames,
  getAttendedAttendeesByEvent,
  getUnattendedAttendeesByEvent,
  getAttendanceSummary,
  type FinishedOrganizerEventNameItem,
  type AttendanceRowItem,
  type AttendanceSummaryItem,
} from "../../api/eventApi";

type AttendanceStatusFilter = "attended" | "unattended";

type AttendanceTableRow = AttendanceRowItem & {
  id: number;
};

const initialSummary: AttendanceSummaryItem = {
  attendedCount: 0,
  unattendedCount: 0,
  total: 0,
  attendedPercentage: 0,
  unattendedPercentage: 0,
};

const Attendance: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [eventOptions, setEventOptions] = useState<FinishedOrganizerEventNameItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] =
    useState<AttendanceStatusFilter>("attended");

  const [rows, setRows] = useState<AttendanceTableRow[]>([]);
  const [summary, setSummary] = useState<AttendanceSummaryItem>(initialSummary);

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const selectedEventName = useMemo(() => {
    return (
      eventOptions.find((item) => String(item.eventId) === selectedEventId)?.eventName ||
      "Selected Event"
    );
  }, [eventOptions, selectedEventId]);

  const chartAngle = useMemo(() => {
    const attended = Number(summary.attendedPercentage || 0);
    return Math.max(0, Math.min(100, attended)) * 3.6;
  }, [summary.attendedPercentage]);

  const loadFinishedEvents = async () => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      setIsLoadingEvents(false);
      return;
    }

    try {
      setIsLoadingEvents(true);

      const data = await getFinishedOrganizerEventNames(organizerId);
      setEventOptions(data);

      if (data.length > 0) {
        setSelectedEventId(String(data[0].eventId));
      } else {
        setSelectedEventId("");
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load finished events.";
      showAlert(msg, "error");
      setEventOptions([]);
      setSelectedEventId("");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleQuery = async () => {
    if (!selectedEventId) {
      showAlert("Please select an event first.", "warning");
      return;
    }

    try {
      setIsQueryLoading(true);

      const eventId = Number(selectedEventId);

      const [summaryData, rowsData] = await Promise.all([
        getAttendanceSummary(eventId),
        selectedStatus === "attended"
          ? getAttendedAttendeesByEvent(eventId)
          : getUnattendedAttendeesByEvent(eventId),
      ]);

      setSummary(summaryData);
      setRows(
        rowsData.map((item, index) => ({
          ...item,
          id: item.attendeeId || index + 1,
        }))
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to fetch attendance data.";
      showAlert(msg, "error");
      setRows([]);
      setSummary(initialSummary);
    } finally {
      setIsQueryLoading(false);
    }
  };

  useEffect(() => {
    loadFinishedEvents();
  }, []);

  useEffect(() => {
    if (!isLoadingEvents && selectedEventId) {
      handleQuery();
    }
  }, [isLoadingEvents, selectedEventId]);

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "Name",
      flex: 1,
      minWidth: 170,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 170,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.3,
      minWidth: 240,
    },
    {
      field: "ticketTypes",
      headerName: "Ticket Types",
      flex: 1.4,
      minWidth: 260,
      sortable: false,
      renderCell: (params: GridRenderCellParams<AttendanceTableRow>) => {
        const ticketTypes = Array.isArray(params.row.ticketTypes)
          ? params.row.ticketTypes
          : [];

        if (ticketTypes.length === 0) {
          return <span className="attendance-empty-ticket-text">No ticket types</span>;
        }

        return (
          <div className="attendance-ticket-types-wrap">
            {ticketTypes.map((type, index) => (
              <Chip
                key={`${type}-${index}`}
                icon={<Ticket size={14} />}
                label={type}
                size="small"
                className="attendance-ticket-chip"
              />
            ))}
          </div>
        );
      },
    },
  ];

  const currentStatusLabel =
    selectedStatus === "attended" ? "Attended" : "Not Attended";

  return (
    <>
      <div className="page-shell attendance-page-shell">
        <div className="page-header">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            Track attendance for finished events, review attendee status, and analyze
            attendance performance using a clear organizer dashboard.
          </p>
        </div>

        <section className="surface-card attendance-filter-card">
          <div className="attendance-section-header">
            <div className="attendance-header-left">
              <div className="attendance-header-icon">
                <ClipboardList size={18} />
              </div>
              <div>
                <h3 className="attendance-section-title">Attendance Filters</h3>
                <p className="attendance-section-subtitle">
                  Choose a finished event and the attendance state you want to inspect.
                </p>
              </div>
            </div>
          </div>

          <div className="attendance-filter-grid">
            <div className="attendance-field">
              <label htmlFor="attendance-event">Finished Event</label>
              <div className="attendance-select-wrap">
                <select
                  id="attendance-event"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  disabled={isLoadingEvents || eventOptions.length === 0}
                >
                  {isLoadingEvents ? (
                    <option value="">Loading events...</option>
                  ) : eventOptions.length === 0 ? (
                    <option value="">No finished events found</option>
                  ) : (
                    eventOptions.map((event) => (
                      <option key={event.eventId} value={event.eventId}>
                        {event.eventName}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="attendance-select-icon" />
              </div>
            </div>

            <div className="attendance-field">
              <label htmlFor="attendance-status">Attendance Status</label>
              <div className="attendance-select-wrap">
                <select
                  id="attendance-status"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as AttendanceStatusFilter)
                  }
                  disabled={isLoadingEvents}
                >
                  <option value="attended">Attended</option>
                  <option value="unattended">Not Attended</option>
                </select>
                <ChevronDown size={16} className="attendance-select-icon" />
              </div>
            </div>

            <div className="attendance-query-actions">
              <button
                type="button"
                className="attendance-query-btn"
                onClick={handleQuery}
                disabled={isLoadingEvents || isQueryLoading || !selectedEventId}
              >
                {isQueryLoading ? (
                  <>
                    <LoaderCircle size={17} className="attendance-spin-icon" />
                    <span>Querying...</span>
                  </>
                ) : (
                  <>
                    <Search size={17} />
                    <span>Query</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="surface-card attendance-table-card">
          <div className="attendance-section-header">
            <div className="attendance-header-left">
              <div
                className={`attendance-header-icon ${
                  selectedStatus === "attended"
                    ? "attendance-header-icon-success"
                    : "attendance-header-icon-danger"
                }`}
              >
                {selectedStatus === "attended" ? (
                  <BadgeCheck size={18} />
                ) : (
                  <UserX size={18} />
                )}
              </div>
              <div>
                <h3 className="attendance-section-title">
                  {currentStatusLabel} Attendees
                </h3>
                <p className="attendance-section-subtitle">
                  {selectedEventName} — attendee records filtered by {currentStatusLabel.toLowerCase()} status.
                </p>
              </div>
            </div>
          </div>

          {isLoadingEvents ? (
            <div className="attendance-state-box">
              <LoaderCircle size={22} className="attendance-spin-icon" />
              <span>Loading attendance page...</span>
            </div>
          ) : eventOptions.length === 0 ? (
            <div className="attendance-empty-state">
              <div className="attendance-empty-icon">
                <CircleAlert size={24} />
              </div>
              <h3>No finished events found</h3>
              <p>You do not have any finished events available for attendance analysis.</p>
            </div>
          ) : (
            <Paper elevation={0} className="attendance-table-paper">
              <DataGrid
                rows={rows}
                columns={columns}
                loading={isQueryLoading}
                disableRowSelectionOnClick
                getRowHeight={() => 76}
                pageSizeOptions={[5, 10, 20, 50]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                className="attendance-data-grid"
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

        <section className="surface-card attendance-chart-card">
          <div className="attendance-section-header">
            <div className="attendance-header-left">
              <div className="attendance-header-icon">
                <PieChartIcon size={18} />
              </div>
              <div>
                <h3 className="attendance-section-title">Attendance Overview</h3>
                <p className="attendance-section-subtitle">
                  Visual summary of attended versus unattended attendees for the selected event.
                </p>
              </div>
            </div>
          </div>

          <div className="attendance-chart-layout">
            <div className="attendance-chart-wrap">
              <div
                className="attendance-pie-chart"
                style={{
                  background: `conic-gradient(
                    #f97316 0deg ${chartAngle}deg,
                    #e2e8f0 ${chartAngle}deg 360deg
                  )`,
                }}
              >
                <div className="attendance-pie-center">
                  <strong>{summary.total}</strong>
                  <span>Total</span>
                </div>
              </div>
            </div>

            <div className="attendance-chart-stats">
              <div className="attendance-stat-card attendance-stat-card-attended">
                <div className="attendance-stat-top">
                  <BadgeCheck size={18} />
                  <span>Attended</span>
                </div>
                <strong>{summary.attendedCount}</strong>
                <p>{summary.attendedPercentage}% of attendees</p>
              </div>

              <div className="attendance-stat-card attendance-stat-card-unattended">
                <div className="attendance-stat-top">
                  <UserX size={18} />
                  <span>Not Attended</span>
                </div>
                <strong>{summary.unattendedCount}</strong>
                <p>{summary.unattendedPercentage}% of attendees</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </>
  );
};

export default Attendance;