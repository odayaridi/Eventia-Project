import React, { useEffect, useMemo, useState } from "react";
import {
  MessageSquareText,
  Star,
  PencilLine,
  CalendarDays,
  Ticket,
  CircleAlert,
  X,
  Save,
} from "lucide-react";
import "./MyFeedbacks.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getAttendeeFeedbacks,
  editAttendeeFeedback,
  type AttendeeFeedbackItem,
} from "../../api/attendeeApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

const MyFeedbacks: React.FC = () => {
  const attendeeId = useMemo(() => {
    const raw = localStorage.getItem("attendeeId");
    return raw ? Number(raw) : null;
  }, []);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [feedbacks, setFeedbacks] = useState<AttendeeFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingFeedback, setEditingFeedback] = useState<AttendeeFeedbackItem | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchFeedbacks = async () => {
    if (!attendeeId) {
      setFeedbacks([]);
      setLoading(false);
      showAlert("Attendee id was not found. Please login again.", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await getAttendeeFeedbacks(attendeeId);
      setFeedbacks(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load feedbacks.";
      showAlert(errorMessage, "error");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const openEditModal = (feedback: AttendeeFeedbackItem) => {
    setEditingFeedback(feedback);
    setEditRating(Number(feedback.rating || 0));
    setEditComment(feedback.comment || "");
  };

  const closeEditModal = () => {
    if (isSubmittingEdit) return;
    setEditingFeedback(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleSubmitEdit = async () => {
    if (!editingFeedback) return;

    if (!attendeeId) {
      showAlert("Attendee id was not found. Please login again.", "error");
      return;
    }

    if (!editingFeedback.eventId || Number.isNaN(Number(editingFeedback.eventId))) {
      showAlert("Event id was not found in feedback response.", "error");
      return;
    }

    if (!editRating || editRating < 1 || editRating > 5) {
      showAlert("Please select a rating between 1 and 5.", "warning");
      return;
    }

    if (editComment.trim().length > 0 && editComment.trim().length < 3) {
      showAlert("Comment must be at least 3 characters long.", "warning");
      return;
    }

    try {
      setIsSubmittingEdit(true);

      await editAttendeeFeedback({
        attendeeId,
        eventId: editingFeedback.eventId,
        rating: editRating,
        comment: editComment.trim(),
      });

      setFeedbacks((prev) =>
        prev.map((item) =>
          item.eventId === editingFeedback.eventId
            ? {
                ...item,
                rating: editRating,
                comment: editComment.trim(),
              }
            : item
        )
      );

      showAlert("Feedback updated successfully.", "success");
      closeEditModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update feedback.";
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < rating;
      return (
        <Star
          key={index}
          size={18}
          className={`my-feedback-star ${filled ? "filled" : ""}`}
          fill={filled ? "currentColor" : "none"}
        />
      );
    });
  };

  return (
    <>
      <div className="page-shell my-feedbacks-page-shell">
        <div className="page-header">
          <h1 className="page-title">My Feedbacks</h1>
          <p className="page-subtitle">
            Review and manage all feedback you submitted for attended events in one place.
          </p>
        </div>

        <section className="surface-card my-feedbacks-section-card">
          <div className="my-feedbacks-section-header">
            <div className="my-feedbacks-title-wrap">
              <div className="my-feedbacks-icon-wrap">
                <MessageSquareText size={18} />
              </div>

              <div>
                <h2 className="my-feedbacks-section-title">Feedback History</h2>
                <p className="my-feedbacks-section-subtitle">
                  Browse all your submitted ratings and comments, and edit them whenever needed.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="my-feedbacks-state-box">
              <div className="my-feedbacks-loader" />
              <h3>Loading feedbacks...</h3>
              <p>Please wait while we fetch your submitted feedback entries.</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="my-feedbacks-state-box empty">
              <div className="my-feedbacks-empty-icon">
                <CircleAlert size={22} />
              </div>
              <h3>No feedbacks found</h3>
              <p>You have not submitted any feedbacks yet.</p>
            </div>
          ) : (
            <div className="my-feedbacks-list">
              {feedbacks.map((feedback, index) => (
                <article
                  key={`${feedback.eventId}-${feedback.eventName}-${index}`}
                  className="my-feedback-card"
                >
                  <button
                    type="button"
                    className="my-feedback-edit-btn"
                    onClick={() => openEditModal(feedback)}
                  >
                    <PencilLine size={16} />
                    <span>Edit</span>
                  </button>

                  <div className="my-feedback-card-top">
                    <div className="my-feedback-main-info">
                      <h3 className="my-feedback-event-name">{feedback.eventName}</h3>

                      <div className="my-feedback-meta-row">
                        <div className="my-feedback-meta-pill">
                          <Ticket size={14} />
                          <span>{feedback.eventTypeName}</span>
                        </div>

                        <div className="my-feedback-meta-pill">
                          <CalendarDays size={14} />
                          <span>{feedback.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="my-feedback-rating-wrap">
                      {renderStars(Number(feedback.rating || 0))}
                    </div>
                  </div>

                  <div className="my-feedback-comment-block">
                    <p>
                      {feedback.comment && feedback.comment.trim().length > 0
                        ? feedback.comment
                        : "No comment was added to this feedback."}
                    </p>
                  </div>
                </article>
              ))}
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

      {editingFeedback && (
        <div className="feedback-edit-modal-overlay" onClick={closeEditModal}>
          <div
            className="feedback-edit-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="feedback-edit-modal-header">
              <div>
                <h3 className="feedback-edit-modal-title">Edit Feedback</h3>
                <p className="feedback-edit-modal-subtitle">{editingFeedback.eventName}</p>
              </div>

              <button
                type="button"
                className="feedback-edit-close-btn"
                onClick={closeEditModal}
                disabled={isSubmittingEdit}
              >
                <X size={18} />
              </button>
            </div>

            <div className="feedback-edit-rating-section">
              <span className="feedback-edit-field-label">Your Rating</span>
              <div className="feedback-edit-stars-row">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const active = starValue <= editRating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      className={`feedback-edit-star-btn ${active ? "active" : ""}`}
                      onClick={() => setEditRating(starValue)}
                      disabled={isSubmittingEdit}
                    >
                      <Star size={22} fill={active ? "currentColor" : "none"} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="feedback-edit-comment-section">
              <label htmlFor="feedback-edit-comment" className="feedback-edit-field-label">
                Edit Comment
              </label>
              <textarea
                id="feedback-edit-comment"
                className="feedback-edit-textarea"
                placeholder="Update your feedback..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={5}
                maxLength={1000}
                disabled={isSubmittingEdit}
              />
              <span className="feedback-edit-char-count">{editComment.length}/1000</span>
            </div>

            <button
              type="button"
              className="feedback-edit-submit-btn"
              onClick={handleSubmitEdit}
              disabled={isSubmittingEdit}
            >
              <Save size={16} />
              <span>{isSubmittingEdit ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MyFeedbacks;
