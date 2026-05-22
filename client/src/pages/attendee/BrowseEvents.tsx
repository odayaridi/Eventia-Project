import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CalendarDays,
  Clock,
  Building2,
  Tag,
  X,
  LoaderCircle,
  SlidersHorizontal,
  ImageOff,
  Ticket,
  ExternalLink,
} from "lucide-react";
import "./BrowseEvents.css";
import {
  filterEvents,
  type EventFilterParams,
  type EventResult,
} from "../../api/attendeeApi";
import { getAllEventTypes, type EventTypeItem } from "../../api/eventApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

const LIMIT = 9;

type FilterState = {
  eventName: string;
  venueName: string;
  eventTypeName: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
};

const initialFilters: FilterState = {
  eventName: "",
  venueName: "",
  eventTypeName: "",
  date: "",
  startTime: "",
  endTime: "",
  description: "",
  location: "",
};

const formatDate = (date: string): string => {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (time: string): string => {
  if (!time) return "";
  const [hours = "0", minutes = "0"] = time.split(":");
  const d = new Date();
  d.setHours(Number(hours), Number(minutes), 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

interface EventCardProps {
  event: EventResult;
  onViewDetails: (event: EventResult) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="be-card">
      <div className="be-card-img-wrap">
        {event.imageUrl && !imgError ? (
          <img
            src={event.imageUrl}
            alt={event.eventName}
            className="be-card-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="be-card-img-fallback">
            <ImageOff size={28} />
          </div>
        )}

        <div className="be-card-type-badge">
          <Tag size={12} />
          <span>{event.eventType}</span>
        </div>
      </div>

      <div className="be-card-body">
        <h3 className="be-card-name">{event.eventName}</h3>
        <p className="be-card-description">{event.eventDescription}</p>

        <div className="be-card-meta">
          <div className="be-card-meta-item">
            <CalendarDays size={14} />
            <span>{formatDate(event.eventDate)}</span>
          </div>

          <div className="be-card-meta-item">
            <Clock size={14} />
            <span>
              {formatTime(event.startTime)} – {formatTime(event.endTime)}
            </span>
          </div>

          <div className="be-card-meta-item">
            <Building2 size={14} />
            <span>{event.venueName}</span>
          </div>

          {event.tickets && event.tickets.length > 0 && (
            <div className="be-card-meta-item">
              <Ticket size={14} />
              <span>
                {event.tickets.length} ticket type
                {event.tickets.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="be-card-actions">
          <button
            type="button"
            className="be-btn-primary"
            onClick={() => onViewDetails(event)}
          >
            <ExternalLink size={15} />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const BrowseEvents: React.FC = () => {
  const navigate = useNavigate();
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilters);

  const [events, setEvents] = useState<EventResult[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isLoadingEventTypes, setIsLoadingEventTypes] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const buildParams = (pageNum: number, currentFilters: FilterState) => {
    const params: EventFilterParams = {
      page: pageNum,
      limit: LIMIT,
    };

    if (currentFilters.eventName.trim()) {
      params.eventName = currentFilters.eventName.trim();
    }

    if (currentFilters.venueName.trim()) {
      params.venueName = currentFilters.venueName.trim();
    }

    if (currentFilters.eventTypeName.trim()) {
      params.eventTypeName = currentFilters.eventTypeName.trim();
    }

    if (currentFilters.date) params.date = currentFilters.date;
    if (currentFilters.startTime) params.startTime = currentFilters.startTime;
    if (currentFilters.endTime) params.endTime = currentFilters.endTime;

    if (currentFilters.description.trim()) {
      params.description = currentFilters.description.trim();
    }

    if (currentFilters.location.trim()) {
      params.location = currentFilters.location.trim();
    }

    return params;
  };

  const fetchEventTypes = async () => {
    try {
      setIsLoadingEventTypes(true);
      const data = await getAllEventTypes();
      setEventTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load event types.";
      showAlert(msg, "error");
      setEventTypes([]);
    } finally {
      setIsLoadingEventTypes(false);
    }
  };

  const fetchEvents = async (
    pageNum: number,
    currentFilters: FilterState,
    replace: boolean
  ) => {
    try {
      if (replace) setIsLoading(true);
      else setIsFetchingMore(true);

      const result = await filterEvents(buildParams(pageNum, currentFilters));

      setEvents((prev) =>
        replace ? result.events : [...prev, ...result.events]
      );
      setTotal(result.total);
      setTotalPages(result.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to fetch events.";
      showAlert(msg, "error");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
    fetchEvents(1, initialFilters, true);
    // IMPORTANT: empty dependency array prevents infinite refresh loop
  }, []);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetchingMore &&
          !isLoading &&
          page < totalPages
        ) {
          fetchEvents(page + 1, appliedFilters, false);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [page, totalPages, isFetchingMore, isLoading, appliedFilters]);

  const handleInputFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    fetchEvents(1, filters, true);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    fetchEvents(1, initialFilters, true);
  };

  const handleViewDetails = (event: EventResult) => {
    navigate(`/attendee/events/${event.eventId}`, { state: { event } });
  };

  const hasActiveFilters = Object.values(appliedFilters).some((v) => v !== "");

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
          <h2 className="page-title">Browse Events</h2>
          <p className="page-subtitle">
            Discover upcoming events. Filter by name, venue, type, date, or time
            to find what suits you.
          </p>
        </div>

        <div className="surface-card be-filter-card">
          <div className="be-filter-header">
            <div className="be-filter-title">
              <SlidersHorizontal size={17} />
              <span>Filter Events</span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="be-clear-btn"
                onClick={handleClearFilters}
              >
                <X size={14} />
                <span>Clear filters</span>
              </button>
            )}
          </div>

          <div className="be-filter-grid">
            <div className="be-filter-field">
              <label htmlFor="fe-eventName">Event Name</label>
              <input
                id="fe-eventName"
                name="eventName"
                type="text"
                value={filters.eventName}
                onChange={handleInputFilterChange}
                placeholder="Search by event name"
              />
            </div>

            <div className="be-filter-field">
              <label htmlFor="fe-venueName">Venue Name</label>
              <input
                id="fe-venueName"
                name="venueName"
                type="text"
                value={filters.venueName}
                onChange={handleInputFilterChange}
                placeholder="Search by venue"
              />
            </div>

            <div className="be-filter-field">
              <label htmlFor="fe-eventTypeName">Event Type</label>
              <select
                id="fe-eventTypeName"
                name="eventTypeName"
                value={filters.eventTypeName}
                onChange={handleSelectFilterChange}
                disabled={isLoadingEventTypes}
              >
                <option value="">
                  {isLoadingEventTypes
                    ? "Loading event types..."
                    : "All event types"}
                </option>

                {eventTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="be-filter-field">
              <label htmlFor="fe-location">Location</label>
              <input
                id="fe-location"
                name="location"
                type="text"
                value={filters.location}
                onChange={handleInputFilterChange}
                placeholder="Search by location"
              />
            </div>

            <div className="be-filter-field">
              <label htmlFor="fe-date">Date</label>
              <input
                id="fe-date"
                name="date"
                type="date"
                value={filters.date}
                onChange={handleInputFilterChange}
              />
            </div>

            <div className="be-filter-field">
              <label htmlFor="fe-startTime">Start Time</label>
              <input
                id="fe-startTime"
                name="startTime"
                type="time"
                value={filters.startTime}
                onChange={handleInputFilterChange}
              />
            </div>

            <div className="be-filter-field">
              <label htmlFor="fe-endTime">End Time</label>
              <input
                id="fe-endTime"
                name="endTime"
                type="time"
                value={filters.endTime}
                onChange={handleInputFilterChange}
              />
            </div>

            <div className="be-filter-field">
              <label htmlFor="fe-description">Description</label>
              <input
                id="fe-description"
                name="description"
                type="text"
                value={filters.description}
                onChange={handleInputFilterChange}
                placeholder="Search in description"
              />
            </div>
          </div>

          <div className="be-filter-actions">
            <button
              type="button"
              className="be-btn-primary be-filter-submit"
              onClick={handleApplyFilters}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle size={16} className="be-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Search Events</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!isLoading && (
          <div className="be-results-header">
            <span className="be-results-count">
              {total === 0
                ? "No events found"
                : `${total} event${total !== 1 ? "s" : ""} found`}
            </span>
          </div>
        )}

        {isLoading && (
          <div className="surface-card be-state-card">
            <div className="be-state-inner">
              <LoaderCircle size={24} className="be-spin" />
              <span>Loading events...</span>
            </div>
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="surface-card be-state-card">
            <div className="be-empty">
              <div className="be-empty-icon">
                <CalendarDays size={28} />
              </div>
              <h3>No events found</h3>
              <p>
                {hasActiveFilters
                  ? "No events match your current filters. Try adjusting or clearing them."
                  : "There are no upcoming events at the moment."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="be-btn-primary"
                  onClick={handleClearFilters}
                >
                  <X size={16} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        )}

        {!isLoading && events.length > 0 && (
          <div className="be-grid">
            {events.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="be-sentinel" />

        {isFetchingMore && (
          <div className="be-load-more">
            <LoaderCircle size={20} className="be-spin" />
            <span>Loading more events...</span>
          </div>
        )}

        {!isLoading &&
          !isFetchingMore &&
          events.length > 0 &&
          page >= totalPages && (
            <div className="be-end-message">
              All {total} event{total !== 1 ? "s" : ""} loaded
            </div>
          )}
      </div>
    </>
  );
};

export default BrowseEvents;