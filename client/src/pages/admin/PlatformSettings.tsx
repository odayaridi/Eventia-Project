import React, { useEffect, useMemo, useState } from "react";
import {
  Settings2,
  CalendarRange,
  Ticket,
  Plus,
  PencilLine,
  Trash2,
  ChevronDown,
  X,
  Save,
  CircleAlert,
} from "lucide-react";
import "./PlatformSettings.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getEventTypeNames,
  getTicketTypeNames,
  addEventType,
  editEventType,
  deleteEventType,
  addTicketType,
  editTicketType,
  deleteTicketType,
  type PlatformSettingItem,
} from "../../api/adminApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

type SettingType = "eventType" | "ticketType";
type ActionMode = "add" | "edit" | "delete";

const PlatformSettings: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [eventTypes, setEventTypes] = useState<PlatformSettingItem[]>([]);
  const [ticketTypes, setTicketTypes] = useState<PlatformSettingItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>("");
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSettingType, setModalSettingType] = useState<SettingType>("eventType");
  const [modalActionMode, setModalActionMode] = useState<ActionMode>("add");
  const [modalInputValue, setModalInputValue] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [eventTypeData, ticketTypeData] = await Promise.all([
        getEventTypeNames(),
        getTicketTypeNames(),
      ]);

      setEventTypes(eventTypeData);
      setTicketTypes(ticketTypeData);

      if (eventTypeData.length > 0 && !selectedEventTypeId) {
        setSelectedEventTypeId(String(eventTypeData[0].id));
      }

      if (ticketTypeData.length > 0 && !selectedTicketTypeId) {
        setSelectedTicketTypeId(String(ticketTypeData[0].id));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load platform settings.";
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const selectedEventType = useMemo(
    () => eventTypes.find((item) => String(item.id) === selectedEventTypeId) || null,
    [eventTypes, selectedEventTypeId]
  );

  const selectedTicketType = useMemo(
    () => ticketTypes.find((item) => String(item.id) === selectedTicketTypeId) || null,
    [ticketTypes, selectedTicketTypeId]
  );

  const openModal = (
    settingType: SettingType,
    actionMode: ActionMode,
    initialValue = ""
  ) => {
    setModalSettingType(settingType);
    setModalActionMode(actionMode);
    setModalInputValue(initialValue);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (processing) return;
    setModalOpen(false);
    setModalInputValue("");
  };

  const getModalTitle = () => {
    const typeLabel = modalSettingType === "eventType" ? "Event Type" : "Ticket Type";

    if (modalActionMode === "add") return `Add ${typeLabel}`;
    if (modalActionMode === "edit") return `Edit ${typeLabel}`;
    return `Delete ${typeLabel}`;
  };

  const getModalSubtitle = () => {
    const typeLabel = modalSettingType === "eventType" ? "event type" : "ticket type";

    if (modalActionMode === "add") {
      return `Create a new ${typeLabel} for the platform.`;
    }

    if (modalActionMode === "edit") {
      return `Update the selected ${typeLabel} name.`;
    }

    return `Confirm deletion of the selected ${typeLabel}.`;
  };

  const handleConfirm = async () => {
    try {
      setProcessing(true);

      if (modalSettingType === "eventType") {
        if (modalActionMode === "add") {
          if (!modalInputValue.trim()) {
            showAlert("Event type name is required.", "warning");
            return;
          }

          await addEventType(modalInputValue.trim());
          showAlert("Event type added successfully.", "success");
        } else if (modalActionMode === "edit") {
          if (!selectedEventType) {
            showAlert("Please select an event type first.", "warning");
            return;
          }

          if (!modalInputValue.trim()) {
            showAlert("Event type name is required.", "warning");
            return;
          }

          await editEventType(selectedEventType.id, modalInputValue.trim());
          showAlert("Event type updated successfully.", "success");
        } else {
          if (!selectedEventType) {
            showAlert("Please select an event type first.", "warning");
            return;
          }

          await deleteEventType(selectedEventType.id);
          showAlert("Event type deleted successfully.", "success");
        }
      } else {
        if (modalActionMode === "add") {
          if (!modalInputValue.trim()) {
            showAlert("Ticket type name is required.", "warning");
            return;
          }

          await addTicketType(modalInputValue.trim());
          showAlert("Ticket type added successfully.", "success");
        } else if (modalActionMode === "edit") {
          if (!selectedTicketType) {
            showAlert("Please select a ticket type first.", "warning");
            return;
          }

          if (!modalInputValue.trim()) {
            showAlert("Ticket type name is required.", "warning");
            return;
          }

          await editTicketType(selectedTicketType.id, modalInputValue.trim());
          showAlert("Ticket type updated successfully.", "success");
        } else {
          if (!selectedTicketType) {
            showAlert("Please select a ticket type first.", "warning");
            return;
          }

          await deleteTicketType(selectedTicketType.id);
          showAlert("Ticket type deleted successfully.", "success");
        }
      }

      await fetchAll();
      closeModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Operation failed.";
      showAlert(errorMessage, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="page-shell platform-settings-page-shell">
        <div className="page-header">
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">
            Manage platform-level event types and ticket types through a clean,
            controlled, and enterprise-grade settings workspace.
          </p>
        </div>

        <section className="surface-card platform-settings-section-card">
          <div className="platform-settings-section-header">
            <div className="platform-settings-title-wrap">
              <div className="platform-settings-title-icon">
                <CalendarRange size={18} />
              </div>

              <div>
                <h2 className="platform-settings-section-title">Event Types</h2>
                <p className="platform-settings-section-subtitle">
                  Add, edit, and delete event type options used across the platform.
                </p>
              </div>
            </div>
          </div>

          <div className="platform-settings-controls-grid">
            <div className="platform-settings-field-group">
              <label className="platform-settings-label">Select Event Type</label>

              <div className="platform-settings-select-wrap">
                <select
                  className="platform-settings-select"
                  value={selectedEventTypeId}
                  onChange={(e) => setSelectedEventTypeId(e.target.value)}
                  disabled={loading || eventTypes.length === 0}
                >
                  {eventTypes.length === 0 ? (
                    <option value="">No event types available</option>
                  ) : (
                    eventTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="platform-settings-select-icon" />
              </div>
            </div>

            <div className="platform-settings-actions-row">
              <button
                type="button"
                className="platform-settings-add-btn"
                onClick={() => openModal("eventType", "add")}
                disabled={loading}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>

              <button
                type="button"
                className="platform-settings-edit-btn"
                onClick={() =>
                  openModal("eventType", "edit", selectedEventType?.name || "")
                }
                disabled={loading || !selectedEventType}
              >
                <PencilLine size={16} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                className="platform-settings-delete-btn"
                onClick={() => openModal("eventType", "delete")}
                disabled={loading || !selectedEventType}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>

        
        </section>

        <section className="surface-card platform-settings-section-card">
          <div className="platform-settings-section-header">
            <div className="platform-settings-title-wrap">
              <div className="platform-settings-title-icon">
                <Ticket size={18} />
              </div>

              <div>
                <h2 className="platform-settings-section-title">Ticket Types</h2>
                <p className="platform-settings-section-subtitle">
                  Add, edit, and delete ticket type options used during event ticket setup.
                </p>
              </div>
            </div>
          </div>

          <div className="platform-settings-controls-grid">
            <div className="platform-settings-field-group">
              <label className="platform-settings-label">Select Ticket Type</label>

              <div className="platform-settings-select-wrap">
                <select
                  className="platform-settings-select"
                  value={selectedTicketTypeId}
                  onChange={(e) => setSelectedTicketTypeId(e.target.value)}
                  disabled={loading || ticketTypes.length === 0}
                >
                  {ticketTypes.length === 0 ? (
                    <option value="">No ticket types available</option>
                  ) : (
                    ticketTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="platform-settings-select-icon" />
              </div>
            </div>

            <div className="platform-settings-actions-row">
              <button
                type="button"
                className="platform-settings-add-btn"
                onClick={() => openModal("ticketType", "add")}
                disabled={loading}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>

              <button
                type="button"
                className="platform-settings-edit-btn"
                onClick={() =>
                  openModal("ticketType", "edit", selectedTicketType?.name || "")
                }
                disabled={loading || !selectedTicketType}
              >
                <PencilLine size={16} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                className="platform-settings-delete-btn"
                onClick={() => openModal("ticketType", "delete")}
                disabled={loading || !selectedTicketType}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="platform-settings-current-box">
            <span className="platform-settings-current-label">Current Selection</span>
            <strong>{selectedTicketType?.name || "No ticket type selected"}</strong>
          </div>
        </section>

        <AlertSnackbar
          open={open}
          message={message}
          severity={severity}
          onClose={handleClose}
        />
      </div>

      {modalOpen && (
        <div className="platform-settings-modal-overlay" onClick={closeModal}>
          <div
            className="platform-settings-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="platform-settings-modal-header">
              <div>
                <h3 className="platform-settings-modal-title">{getModalTitle()}</h3>
                <p className="platform-settings-modal-subtitle">{getModalSubtitle()}</p>
              </div>

              <button
                type="button"
                className="platform-settings-close-btn"
                onClick={closeModal}
                disabled={processing}
              >
                <X size={18} />
              </button>
            </div>

            {modalActionMode === "delete" ? (
              <div className="platform-settings-delete-box">
                <div className="platform-settings-delete-warning-icon">
                  <CircleAlert size={22} />
                </div>

                <div>
                  <h4>Are you sure?</h4>
                  <p>
                    You are about to delete{" "}
                    <strong>
                      {modalSettingType === "eventType"
                        ? selectedEventType?.name || "this event type"
                        : selectedTicketType?.name || "this ticket type"}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="platform-settings-form-group">
                <label>
                  {modalSettingType === "eventType" ? "Event Type Name" : "Ticket Type Name"}
                </label>
                <input
                  type="text"
                  value={modalInputValue}
                  onChange={(e) => setModalInputValue(e.target.value)}
                  placeholder={
                    modalSettingType === "eventType"
                      ? "Enter event type name"
                      : "Enter ticket type name"
                  }
                  disabled={processing}
                />
              </div>
            )}

            <button
              type="button"
              className="platform-settings-confirm-btn"
              onClick={handleConfirm}
              disabled={processing}
            >
              <Save size={16} />
              <span>
                {processing
                  ? "Processing..."
                  : modalActionMode === "delete"
                  ? "Confirm Delete"
                  : "Save Changes"}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PlatformSettings;