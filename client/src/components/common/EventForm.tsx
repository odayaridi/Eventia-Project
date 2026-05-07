import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  X,
  CheckCircle2,
  UploadCloud,
} from "lucide-react";
import "./EventForm.css";
import {
  getAllEventTypes,
  getVenueAvailabilityDates,
  getVenueAvailabilityTimes,
  getVenueNamesPaginated,
  type EventTypeItem,
  type VenueAvailabilityDateItem,
  type VenueAvailabilityTimeItem,
  type VenueNameItem,
} from "../../api/eventApi";

export interface EventFormSubmitData {
  eventId?: number;
  image: File | null;
  existingImageUrl?: string | null;
  name: string;
  description: string;
  eventType: string;
  venueName: string;
  date: string;
  timeSlot: string;
  capacity: number;
}

interface EventFormProps {
  mode: "create" | "edit";
  organizerId: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormSubmitData) => Promise<void> | void;
  showAlert: (msg: string | string[], sev?: "error" | "success" | "info" | "warning") => void;
  initialValues?: {
    eventId?: number;
    name: string;
    description: string;
    eventType: string;
    venueName: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    imageUrl?: string | null;
  };
  disableVenueEditing?: boolean;
}

type FormState = {
  image: File | null;
  name: string;
  description: string;
  eventType: string;
  venueName: string;
  date: string;
  timeSlot: string;
  capacity: string;
};

const VENUE_PAGE_SIZE = 10;

const removeSeconds = (time: string) => time.slice(0, 5);

const normalizeTimeSlot = (timeSlot: string) => {
  if (!timeSlot.includes("-")) return timeSlot;
  const [start, end] = timeSlot.split("-");
  return `${removeSeconds(start)}-${removeSeconds(end)}`;
};

const EventForm: React.FC<EventFormProps> = ({
  mode,
  organizerId,
  isSubmitting,
  onClose,
  onSubmit,
  showAlert,
  initialValues,
  disableVenueEditing = false,
}) => {
  const initialTimeSlot = initialValues
    ? `${removeSeconds(initialValues.startTime)}-${removeSeconds(initialValues.endTime)}`
    : "";

  const [form, setForm] = useState<FormState>({
    image: null,
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    eventType: initialValues?.eventType || "",
    venueName: initialValues?.venueName || "",
    date: initialValues?.date || "",
    timeSlot: initialTimeSlot,
    capacity: initialValues ? String(initialValues.capacity) : "",
  });

  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [venueOptions, setVenueOptions] = useState<VenueNameItem[]>([]);
  const [availableDates, setAvailableDates] = useState<VenueAvailabilityDateItem[]>([]);
  const [availableTimes, setAvailableTimes] = useState<VenueAvailabilityTimeItem[]>([]);

  const [isEventTypesLoading, setIsEventTypesLoading] = useState(false);
  const [isVenueLoading, setIsVenueLoading] = useState(false);
  const [isDatesLoading, setIsDatesLoading] = useState(false);
  const [isTimesLoading, setIsTimesLoading] = useState(false);

  const [venueSearch, setVenueSearch] = useState(initialValues?.venueName || "");
  const [venuePage, setVenuePage] = useState(1);
  const [venueTotalPages, setVenueTotalPages] = useState(1);
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const venueDropdownRef = useRef<HTMLDivElement | null>(null);
  const venueOptionsRef = useRef<HTMLDivElement | null>(null);

  const existingImageUrl = useMemo(
    () => initialValues?.imageUrl || null,
    [initialValues?.imageUrl]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        venueDropdownRef.current &&
        !venueDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVenueDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const loadEventTypes = async () => {
    try {
      setIsEventTypesLoading(true);
      const data = await getAllEventTypes();
      setEventTypes(data);

      setForm((prev) => ({
        ...prev,
        eventType: prev.eventType || data[0]?.name || "",
      }));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load event types.";
      showAlert(msg, "error");
    } finally {
      setIsEventTypesLoading(false);
    }
  };

  const loadVenues = async (pageToLoad: number, searchText: string, reset = false) => {
    try {
      setIsVenueLoading(true);

      const data = await getVenueNamesPaginated({
        page: pageToLoad,
        limit: VENUE_PAGE_SIZE,
        search: searchText.trim(),
      });

      setVenueOptions((prev) =>
        reset
          ? data.venues
          : [...prev, ...data.venues.filter((v) => !prev.some((p) => p.name === v.name))]
      );
      setVenuePage(data.page);
      setVenueTotalPages(data.totalPages || 1);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load venue names.";
      showAlert(msg, "error");
    } finally {
      setIsVenueLoading(false);
    }
  };

  const loadDatesForVenue = async (venueName: string, keepCurrentDate = false) => {
    if (!venueName) return;

    try {
      setIsDatesLoading(true);
      const data = await getVenueAvailabilityDates(venueName);
      setAvailableDates(data);

      setForm((prev) => ({
        ...prev,
        date: keepCurrentDate ? prev.date : "",
        timeSlot: keepCurrentDate ? prev.timeSlot : "",
      }));

      if (!keepCurrentDate) {
        setAvailableTimes([]);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load venue dates.";
      showAlert(msg, "error");
    } finally {
      setIsDatesLoading(false);
    }
  };

  const loadTimesForVenueDate = async (
    venueName: string,
    date: string,
    keepCurrentTime = false
  ) => {
    if (!venueName || !date) return;

    try {
      setIsTimesLoading(true);
      const data = await getVenueAvailabilityTimes(venueName, date);

      const normalizedTimes = data.map((item) => ({
        ...item,
        timeSlot: normalizeTimeSlot(item.timeSlot),
      }));

      const currentNormalized = normalizeTimeSlot(form.timeSlot || initialTimeSlot);
      const hasCurrent =
        !!currentNormalized &&
        normalizedTimes.some((item) => item.timeSlot === currentNormalized);

      const mergedTimes =
        keepCurrentTime && currentNormalized && !hasCurrent
          ? [{ timeSlot: currentNormalized }, ...normalizedTimes]
          : normalizedTimes;

      setAvailableTimes(mergedTimes);

      if (keepCurrentTime) {
        setForm((prev) => ({
          ...prev,
          timeSlot: currentNormalized,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          timeSlot: "",
        }));
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load time slots.";
      showAlert(msg, "error");
    } finally {
      setIsTimesLoading(false);
    }
  };

  useEffect(() => {
    loadEventTypes();

    if (!disableVenueEditing) {
      loadVenues(1, venueSearch, true);
    }

    if (initialValues?.venueName) {
      loadDatesForVenue(initialValues.venueName, true).then(() => {
        if (initialValues.date) {
          loadTimesForVenueDate(initialValues.venueName, initialValues.date, true);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (disableVenueEditing) return;

    const timeout = setTimeout(() => {
      loadVenues(1, venueSearch, true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [venueSearch, disableVenueEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "timeSlot" ? normalizeTimeSlot(value) : value,
    }));

    if (name === "date") {
      setForm((prev) => ({
        ...prev,
        date: value,
        timeSlot: "",
      }));

      if (form.venueName && value) {
        loadTimesForVenueDate(form.venueName, value);
      }
    }
  };

  const applyFile = (file: File | null) => {
    setForm((prev) => ({ ...prev, image: file }));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0] || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file) applyFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  const handleVenueSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVenueSearch(value);
    setIsVenueDropdownOpen(true);

    setForm((prev) => ({
      ...prev,
      venueName: "",
      date: "",
      timeSlot: "",
    }));

    setAvailableDates([]);
    setAvailableTimes([]);
  };

  const handleSelectVenue = (venueName: string) => {
    setVenueSearch(venueName);
    setForm((prev) => ({
      ...prev,
      venueName,
      date: "",
      timeSlot: "",
    }));

    setAvailableDates([]);
    setAvailableTimes([]);
    setIsVenueDropdownOpen(false);
    loadDatesForVenue(venueName);
  };

  const handleVenueListScroll = async () => {
    const container = venueOptionsRef.current;
    if (!container || isVenueLoading) return;

    const isNearBottom =
      container.scrollTop + container.clientHeight >= container.scrollHeight - 20;

    if (isNearBottom && venuePage < venueTotalPages) {
      await loadVenues(venuePage + 1, venueSearch, false);
    }
  };

  const currentPreview = previewUrl || existingImageUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" && !form.image) {
      showAlert("Event image is required.", "error");
      return;
    }

    if (!form.venueName) {
      showAlert("Please select a venue name.", "error");
      return;
    }

    if (!form.timeSlot.includes("-")) {
      showAlert("Please select a valid time slot.", "error");
      return;
    }

    if (!form.eventType) {
      showAlert("Please select an event type.", "error");
      return;
    }

    if (!form.name.trim() || !form.description.trim() || !form.capacity) {
      showAlert("Please fill in all required fields.", "error");
      return;
    }

    await onSubmit({
      eventId: initialValues?.eventId,
      image: form.image,
      existingImageUrl,
      name: form.name.trim(),
      description: form.description.trim(),
      eventType: form.eventType,
      venueName: form.venueName,
      date: form.date,
      timeSlot: normalizeTimeSlot(form.timeSlot),
      capacity: Number(form.capacity),
    });
  };

  const inputId = mode === "create" ? "event-form-image-create" : "event-form-image-edit";

  return (
    <div className="event-form-modal-overlay" onClick={onClose}>
      <div className="event-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-form-modal-header">
          <div>
            <h3>{mode === "create" ? "Create Event" : "Update Event"}</h3>
            <p>
              {mode === "create"
                ? "Fill in the event information and assign an available venue slot."
                : "Update your event details and save the new changes."}
            </p>
          </div>

          <button
            type="button"
            className="event-form-close-btn"
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>

        <form className="event-form-body" onSubmit={handleSubmit}>
          <div className="event-form-grid">

            {/* ── Image Upload ── */}
            <div className="event-form-field event-form-field-full">
              <label>Event Image</label>

              <div className="event-form-image-upload-box">
                {currentPreview ? (
                  <div className="event-form-image-preview-wrap">
                    <img
                      src={currentPreview}
                      alt="Event preview"
                      className="event-form-image-preview"
                    />
                    <div className="event-form-image-preview-label">
                      <span className="event-form-image-preview-name">
                        {form.image ? form.image.name : "Current image"}
                      </span>
                      <button
                        type="button"
                        className="event-form-image-change-btn"
                        onClick={handleChangeImage}
                      >
                        Change image
                      </button>
                    </div>
                    {/* hidden input for re-selection */}
                    <input
                      ref={fileInputRef}
                      id={inputId}
                      name="image"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                ) : (
                  <div
                    className={`event-form-image-dropzone${isDragging ? " dragging" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      ref={fileInputRef}
                      id={inputId}
                      name="image"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange}
                      required={mode === "create" && !currentPreview}
                    />
                    <div className="event-form-dropzone-icon">
                      <UploadCloud size={22} />
                    </div>
                    <p className="event-form-dropzone-title">
                      <span>Click to upload</span> or drag &amp; drop
                    </p>
                    <p className="event-form-dropzone-subtitle">
                      JPG, JPEG, PNG or WEBP
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Event Name ── */}
            <div className="event-form-field">
              <label htmlFor="event-form-name">Event Name</label>
              <input
                id="event-form-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter event name"
                required
              />
            </div>

            {/* ── Event Type ── */}
            <div className="event-form-field">
              <label htmlFor="event-form-type">Event Type</label>
              <select
                id="event-form-type"
                name="eventType"
                value={form.eventType}
                onChange={handleInputChange}
                required
                disabled={isEventTypesLoading}
              >
                <option value="" disabled>
                  {isEventTypesLoading ? "Loading event types..." : "Select event type"}
                </option>
                {eventTypes.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Description ── */}
            <div className="event-form-field event-form-field-full">
              <label htmlFor="event-form-description">Description</label>
              <textarea
                id="event-form-description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleInputChange}
                placeholder="Describe your event"
                required
              />
            </div>

            {/* ── Venue Name ── */}
            <div className="event-form-field event-form-field-full">
              <label>Venue Name</label>

              {disableVenueEditing ? (
                <input
                  type="text"
                  value={form.venueName}
                  disabled
                  className="event-form-readonly-input"
                />
              ) : (
                <div className="event-form-venue-dropdown" ref={venueDropdownRef}>
                  <div className="event-form-venue-input-wrap">
                    <Search size={16} />
                    <input
                      type="text"
                      value={form.venueName || venueSearch}
                      onChange={handleVenueSearchChange}
                      onFocus={() => setIsVenueDropdownOpen(true)}
                      placeholder="Search or choose venue name"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="event-form-venue-toggle-btn"
                      onClick={() => setIsVenueDropdownOpen((prev) => !prev)}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {isVenueDropdownOpen && (
                    <div
                      className="event-form-venue-options"
                      ref={venueOptionsRef}
                      onScroll={handleVenueListScroll}
                    >
                      {venueOptions.map((venue) => (
                        <button
                          key={venue.name}
                          type="button"
                          className="event-form-venue-option"
                          onClick={() => handleSelectVenue(venue.name)}
                        >
                          <MapPin size={15} />
                          <span>{venue.name}</span>
                        </button>
                      ))}

                      {isVenueLoading && (
                        <div className="event-form-venue-loading">
                          <LoaderCircle size={16} className="spin-icon" />
                          <span>Loading venues...</span>
                        </div>
                      )}

                      {!isVenueLoading && venueOptions.length === 0 && (
                        <div className="event-form-venue-empty">No venues found.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Date ── */}
            <div className="event-form-field">
              <label htmlFor="event-form-date">Date</label>
              <select
                id="event-form-date"
                name="date"
                value={form.date}
                onChange={handleInputChange}
                required
                disabled={!form.venueName || isDatesLoading}
              >
                <option value="" disabled>
                  {!form.venueName
                    ? "Select venue first"
                    : isDatesLoading
                    ? "Loading dates..."
                    : "Select date"}
                </option>
                {availableDates.map((item) => (
                  <option key={item.date} value={item.date}>
                    {item.date}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Time Slot ── */}
            <div className="event-form-field">
              <label htmlFor="event-form-time">Time Slot</label>
              <select
                id="event-form-time"
                name="timeSlot"
                value={form.timeSlot}
                onChange={handleInputChange}
                required
                disabled={!form.venueName || !form.date || isTimesLoading}
              >
                <option value="" disabled>
                  {!form.venueName || !form.date
                    ? "Select venue and date first"
                    : isTimesLoading
                    ? "Loading time slots..."
                    : "Select time slot"}
                </option>
                {availableTimes.map((item) => (
                  <option key={item.timeSlot} value={item.timeSlot}>
                    {item.timeSlot}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Capacity ── */}
            <div className="event-form-field">
              <label htmlFor="event-form-capacity">Capacity</label>
              <input
                id="event-form-capacity"
                name="capacity"
                type="number"
                min="1"
                step="1"
                value={form.capacity}
                onChange={handleInputChange}
                placeholder="Enter event capacity"
                required
              />
            </div>
          </div>

          <div className="event-form-actions">
            <button
              type="button"
              className="event-form-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="event-form-primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={16} className="spin-icon" />
                  <span>{mode === "create" ? "Creating..." : "Updating..."}</span>
                </>
              ) : (
                <>
                  {mode === "create" ? <Plus size={16} /> : <CheckCircle2 size={16} />}
                  <span>{mode === "create" ? "Create" : "Update"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;