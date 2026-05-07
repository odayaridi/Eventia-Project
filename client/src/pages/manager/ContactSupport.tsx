import React, { useMemo, useState } from "react";
import {
  Headset,
  Send,
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";
import "./ContactSupport.css";
import { sendSupport } from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

type FormState = {
  subject: string;
  message: string;
};

const SUPPORT_SUBJECTS = [
  "Venue Approval Issue",
  "Availability Scheduling Problem",
  "Event Request Review Help",
  "Venue Information Update Assistance",
  "Technical Issue or System Bug",
];

const initialFormState: FormState = {
  subject: SUPPORT_SUBJECTS[0],
  message: "",
};

const ContactSupport: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const managerId = useMemo(() => {
    const raw = localStorage.getItem("managerId");
    return raw ? Number(raw) : null;
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      return;
    }

    if (!form.subject.trim()) {
      showAlert("Please select a subject.", "error");
      return;
    }

    if (form.message.trim().length < 5) {
      showAlert("Message must be at least 5 characters long.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      await sendSupport({
        managerId,
        subject: form.subject,
        message: form.message.trim(),
      });

      showAlert(
        "Your support request has been sent successfully.",
        "success"
      );

      setForm(initialFormState);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send support request.";

      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-shell">
        <div className="page-header">
          <h2 className="page-title">Contact Support</h2>
          <p className="page-subtitle">
            Reach out to the admin team for help with venue management issues and
            platform-related concerns.
          </p>
        </div>

        <div className="surface-card contact-support-card">
          <div className="contact-support-header">
            <div className="contact-support-header-icon">
              <Headset size={20} />
            </div>

            <div>
              <h3 className="contact-support-section-title">
                Send a Support Request
              </h3>
              <p className="contact-support-section-subtitle">
                Select a subject and describe your issue clearly so the admin
                team can help you faster.
              </p>
            </div>
          </div>

          <form className="contact-support-form" onSubmit={handleSubmit}>
            <div className="contact-support-field">
              <label htmlFor="subject">Subject</label>

              <div className="contact-support-select-wrap">
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                >
                  {SUPPORT_SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="contact-support-field">
              <label htmlFor="message">Message</label>

              <div className="contact-support-textarea-wrap">
                <textarea
                  id="message"
                  name="message"
                  rows={8}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your issue in detail..."
                  required
                />

                <div className="contact-support-textarea-icon">
                  <MessageSquareText size={18} />
                </div>
              </div>
            </div>

            <div className="contact-support-actions">
              <button
                className="contact-support-submit-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="spin-icon" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
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

export default ContactSupport;