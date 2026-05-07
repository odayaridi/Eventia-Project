import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Sparkles,
  Star,
  CircleAlert,
  Table2,
  Brain,
  ChevronDown,
  BadgeCheck,
  MessageSquareText,
  TrendingUp,
  CalendarRange,
  X,
} from "lucide-react";
import {
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import "./Feedbacks.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getOrganizerEventsFeedbacks,
 
    getEndedEventNamesForAnalytics,
  analyzeEventFeedbackSummary,
  type OrganizerEventFeedbackItem,

    type EndedEventNameItem,
  type AnalyzeEventFeedbackSummaryResponse,
} from "../../api/eventApi";









import AlertSnackbar from "../../components/common/AlertSnackbar";

type FeedbackRow = OrganizerEventFeedbackItem & {
  id: string;
};

type SummarySection = {
  title: string;
  body: string[];
};

const Feedbacks: React.FC = () => {
  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [feedbacks, setFeedbacks] = useState<OrganizerEventFeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [eventOptions, setEventOptions] = useState<EndedEventNameItem[]>([]);
  const [selectedEventName, setSelectedEventName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] =
    useState<AnalyzeEventFeedbackSummaryResponse | null>(null);

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");
  const [selectedCommentAuthor, setSelectedCommentAuthor] = useState("");
  const [selectedCommentEvent, setSelectedCommentEvent] = useState("");

  const fetchFeedbacks = async (showLoader = true) => {
    if (!organizerId) {
      setFeedbacks([]);
      setTotal(0);
      setLoading(false);
      showAlert("Organizer id was not found. Please login again.", "error");
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data = await getOrganizerEventsFeedbacks(organizerId, page, pageSize);

      setFeedbacks(Array.isArray(data.feedbacks) ? data.feedbacks : []);
      setTotal(Number(data.total || 0));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load feedbacks.";
      showAlert(errorMessage, "error");
      setFeedbacks([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEventNames = async () => {
    if (!organizerId) return;

    try {
      const data = await getEndedEventNamesForAnalytics(organizerId);
      const safeOptions = Array.isArray(data) ? data : [];
      setEventOptions(safeOptions);

      if (safeOptions.length > 0 && !selectedEventName) {
        setSelectedEventName(safeOptions[0].name);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load event names.";
      showAlert(errorMessage, "error");
      setEventOptions([]);
    }
  };

  useEffect(() => {
    fetchFeedbacks(true);
  }, [page, pageSize]);

  useEffect(() => {
    fetchEventNames();
  }, [organizerId]);

  const handleAnalyzeSummary = async () => {
    if (!organizerId) {
      showAlert("Organizer id was not found. Please login again.", "error");
      return;
    }

    if (!selectedEventName) {
      showAlert("Please choose an event first.", "warning");
      return;
    }

    try {
      setAiLoading(true);
      const result = await analyzeEventFeedbackSummary({
        organizerId,
        eventName: selectedEventName,
      });
      setAiSummaryResult(result);
      showAlert("AI analysis generated successfully.", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate AI summary.";
      showAlert(errorMessage, "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenCommentDialog = (
    comment: string,
    username?: string,
    eventName?: string
  ) => {
    setSelectedComment(comment && comment.trim() ? comment : "No comment");
    setSelectedCommentAuthor(username || "Unknown user");
    setSelectedCommentEvent(eventName || "Unknown event");
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
    setSelectedComment("");
    setSelectedCommentAuthor("");
    setSelectedCommentEvent("");
  };

  const rows: FeedbackRow[] = useMemo(() => {
    return feedbacks.map((feedback, index) => ({
      id: `${feedback.email}-${feedback.eventName}-${feedback.createdAt}-${index}`,
      ...feedback,
    }));
  }, [feedbacks]);

  const columns: GridColDef[] = [
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
      field: "eventName",
      headerName: "Event Name",
      flex: 1.15,
      minWidth: 180,
    },
    {
      field: "eventTypeName",
      headerName: "Event Type",
      flex: 0.9,
      minWidth: 140,
    },
    {
      field: "rating",
      headerName: "Rating",
      flex: 0.7,
      minWidth: 110,
      renderCell: (params) => (
        <div className="feedback-rating-cell">
          <Star size={15} className="feedback-star-icon" />
          <span>{params.value}/5</span>
        </div>
      ),
    },
    {
      field: "comment",
      headerName: "Comment",
      flex: 1.7,
      minWidth: 290,
      sortable: false,
      renderCell: (params) => {
        const commentText =
          params.value && String(params.value).trim().length > 0
            ? String(params.value)
            : "No comment";

        return (
          <div className="feedback-comment-actions-cell">
            <span className="feedback-comment-preview" title={commentText}>
              {commentText}
            </span>

            <button
              type="button"
              className="feedback-view-comment-btn"
              onClick={() =>
                handleOpenCommentDialog(
                  commentText,
                  params.row.username,
                  params.row.eventName
                )
              }
            >
              View
            </button>
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1.05,
      minWidth: 180,
    },
  ];

  const paginationModel = useMemo(
    () => ({
      page: page - 1,
      pageSize,
    }),
    [page, pageSize]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    const newPage = model.page + 1;
    const newPageSize = model.pageSize;

    if (newPage !== page) {
      setPage(newPage);
    }

    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1);
    }
  };

  const renderRatingStars = (rating?: number) => {
    const safeRating = typeof rating === "number" ? rating : 0;
    const rounded = Math.round(safeRating);

    return (
      <div className="ai-summary-stars-row" aria-label={`Average rating ${safeRating} out of 5`}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            size={16}
            className={`ai-summary-star ${value <= rounded ? "filled" : "empty"}`}
          />
        ))}
      </div>
    );
  };

  const cleanSummaryLine = (line: string) => {
    return line
      .replace(/^#{1,6}\s*/g, "")
      .replace(/^\*\*(.*?)\*\*$/g, "$1")
      .replace(/\*\*/g, "")
      .replace(/^[-•]\s*/g, "")
      .trim();
  };

  const parseSummarySections = (summary?: string): SummarySection[] => {
    if (!summary || !summary.trim()) return [];

    const lines = summary
      .split("\n")
      .map((line) => cleanSummaryLine(line))
      .filter((line) => line.length > 0);

    const sections: SummarySection[] = [];
    let currentSection: SummarySection | null = null;

    const isHeadingLine = (line: string) => {
      const lower = line.toLowerCase();
      return (
        lower.includes("overall sentiment") ||
        lower.includes("strength") ||
        lower.includes("common complaint") ||
        lower.includes("rating trend") ||
        lower.includes("conclusion") ||
        lower.includes("recommendation") ||
        lower.includes("summary")
      );
    };

    for (const line of lines) {
      if (isHeadingLine(line) && line.length <= 60) {
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          title: line.replace(/:$/, "").trim(),
          body: [],
        };
      } else if (currentSection) {
        currentSection.body.push(line);
      } else {
        currentSection = {
          title: "Overview",
          body: [line],
        };
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.filter(
      (section) => section.title.trim() || section.body.some((item) => item.trim())
    );
  };

  const summarySections = useMemo(
    () => parseSummarySections(aiSummaryResult?.summary),
    [aiSummaryResult]
  );

  return (
    <>
      <div className="page-shell feedbacks-page-shell">
        <div className="page-header">
          <h1 className="page-title">Feedbacks</h1>
          <p className="page-subtitle">
            Monitor attendee opinions, ratings, and comments across your events in one
            organized workspace.
          </p>
        </div>

        <section className="surface-card feedbacks-section-card">
          <div className="feedbacks-section-header">
            <div>
              <div className="feedback-title-with-icon">
                <div className="feedback-section-icon-wrap feedback-section-icon-table">
                  <Table2 size={18} />
                </div>
                <h2 className="feedbacks-section-title">Event Feedbacks Table</h2>
              </div>

              <p className="feedbacks-section-subtitle">
                Review attendee ratings, comments, and event details with paginated
                server-side loading.
              </p>
            </div>

            <button
              type="button"
              className="refresh-feedbacks-btn"
              onClick={() => fetchFeedbacks(false)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "refresh-icon spinning" : "refresh-icon"}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          {loading && rows.length === 0 ? (
            <div className="feedbacks-state-box">
              <div className="feedbacks-loader" />
              <h3>Loading feedbacks...</h3>
              <p>Please wait while we fetch feedbacks for your events.</p>
            </div>
          ) : !loading && total === 0 ? (
            <div className="feedbacks-state-box empty">
              <div className="feedbacks-empty-icon">
                <CircleAlert size={22} />
              </div>
              <h3>No feedbacks found</h3>
              <p>No attendee feedback has been submitted for your events yet.</p>
            </div>
          ) : (
            <Paper elevation={0} className="feedbacks-table-paper">
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
                getRowHeight={() => 76}
                className="feedbacks-data-grid"
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

        <section className="surface-card ai-summary-section-card">
          <div className="ai-summary-header">
            <div className="feedback-section-icon-wrap feedback-section-icon-ai">
              <Brain size={18} />
            </div>

            <div>
              <h2 className="ai-summary-title">AI Summary</h2>
              <p className="ai-summary-subtitle">
                Generate a concise and professional overview of attendee sentiment,
                repeated strengths, key complaints, and rating patterns for a selected event.
              </p>
            </div>
          </div>

          <div className="ai-summary-controls">
            <div className="ai-summary-select-wrap">
              <label htmlFor="eventName" className="ai-summary-label">
                Choose Event
              </label>

              <div className="custom-select-wrap">
                <select
                  id="eventName"
                  className="ai-summary-select"
                  value={selectedEventName}
                  onChange={(e) => setSelectedEventName(e.target.value)}
                  disabled={aiLoading || eventOptions.length === 0}
                >
                  {eventOptions.length === 0 ? (
                    <option value="">No events available</option>
                  ) : (
                    eventOptions.map((eventItem, index) => (
                      <option key={`${eventItem.name}-${index}`} value={eventItem.name}>
                        {eventItem.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="custom-select-icon" />
              </div>
            </div>

            <button
              type="button"
              className="ai-analyze-btn"
              onClick={handleAnalyzeSummary}
              disabled={aiLoading || !selectedEventName}
            >
              <Sparkles size={16} />
              <span>{aiLoading ? "Analyzing..." : "AI Analyze"}</span>
            </button>
          </div>

          <div className="ai-summary-result-card">
            {aiLoading ? (
              <div className="ai-summary-loading-state">
                <div className="feedbacks-loader" />
                <h3>Generating AI summary...</h3>
                <p>Please wait while the selected event feedback is being analyzed.</p>
              </div>
            ) : aiSummaryResult ? (
              <div className="ai-summary-result-layout">
                <div className="ai-summary-top-panel">
                  <div className="ai-summary-top-main">
                    <div className="ai-summary-badge">
                      <Sparkles size={13} />
                      <span>AI Generated Insight</span>
                    </div>

                    <div className="ai-summary-event-block">
                      <span className="ai-summary-overline">Selected Event</span>
                      <h3 className="ai-summary-event-name">{aiSummaryResult.eventName}</h3>
                    </div>

                    <div className="ai-summary-rating-row">
                      <div className="ai-summary-rating-box">
                        {renderRatingStars(aiSummaryResult.averageRating)}
                        <div className="ai-summary-rating-text">
                          <strong>
                            {typeof aiSummaryResult.averageRating === "number"
                              ? aiSummaryResult.averageRating.toFixed(2)
                              : "N/A"}
                          </strong>
                          <span>Average Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ai-summary-stats-grid">
                    <div className="ai-summary-mini-stat emphasized">
                      <div className="ai-summary-mini-stat-icon">
                        <MessageSquareText size={16} />
                      </div>
                      <div>
                        <span>Total Feedbacks</span>
                        <strong>{aiSummaryResult.totalFeedbacks}</strong>
                      </div>
                    </div>

                    <div className="ai-summary-mini-stat">
                      <div className="ai-summary-mini-stat-icon blue">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <span>Status</span>
                        <strong>Ready to Review</strong>
                      </div>
                    </div>

                    <div className="ai-summary-mini-stat">
                      <div className="ai-summary-mini-stat-icon slate">
                        <CalendarRange size={16} />
                      </div>
                      <div>
                        <span>Summary Type</span>
                        <strong>Feedback Overview</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ai-summary-content-card">
                  <div className="ai-summary-content-header">
                    <div className="ai-summary-content-title-wrap">
                      <div className="ai-summary-content-icon">
                        <BadgeCheck size={18} />
                      </div>
                      <div>
                        <h3>Summary Result</h3>
                        <p>
                          Clear, executive-style insights based on attendee ratings and comments.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ai-summary-sections-grid">
                    {summarySections.length > 0 ? (
                      summarySections.map((section, index) => (
                        <div
                          className="ai-summary-section-card-item"
                          key={`${section.title}-${index}`}
                        >
                          <div className="ai-summary-section-card-top">
                            <div className="ai-summary-section-dot" />
                            <h4>{section.title || "Insight"}</h4>
                          </div>

                          <div className="ai-summary-section-card-body">
                            {section.body.length > 0 ? (
                              section.body.map((line, lineIndex) => (
                                <p key={`${section.title}-${lineIndex}`}>{line}</p>
                              ))
                            ) : (
                              <p>No additional details available.</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="ai-summary-section-card-item full-width">
                        <div className="ai-summary-section-card-top">
                          <div className="ai-summary-section-dot" />
                          <h4>Overview</h4>
                        </div>
                        <div className="ai-summary-section-card-body">
                          <p>{cleanSummaryLine(aiSummaryResult.summary)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="ai-summary-placeholder">
                <div className="ai-summary-placeholder-badge">Ready</div>
                <h3>Generate an event feedback summary</h3>
                <p>
                  Select one of your events, then click <strong>AI Analyze</strong> to
                  generate a professional summary of attendee sentiment, recurring strengths,
                  common complaints, and rating trends.
                </p>
              </div>
            )}
          </div>
        </section>

        <Dialog
          open={isCommentDialogOpen}
          onClose={handleCloseCommentDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            className: "feedback-comment-dialog-paper",
          }}
        >
          <DialogTitle className="feedback-comment-dialog-title">
            <div className="feedback-comment-dialog-title-content">
              <div>
                <h3>Feedback Comment</h3>
                <p>
                  {selectedCommentAuthor} • {selectedCommentEvent}
                </p>
              </div>

              <IconButton
                onClick={handleCloseCommentDialog}
                className="feedback-comment-dialog-close-btn"
              >
                <X size={18} />
              </IconButton>
            </div>
          </DialogTitle>

          <DialogContent className="feedback-comment-dialog-content" dividers>
            <div className="feedback-comment-dialog-text">
              {selectedComment}
            </div>
          </DialogContent>

          <DialogActions className="feedback-comment-dialog-actions">
            <Button
              onClick={handleCloseCommentDialog}
              variant="contained"
              className="feedback-comment-dialog-done-btn"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <AlertSnackbar
          open={open}
          message={message}
          severity={severity}
          onClose={handleClose}
        />
      </div>
    </>
  );
};

export default Feedbacks;