// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   Search,
//   MapPin,
//   Users,
//   Building2,
//   X,
//   LoaderCircle,
//   ChevronLeft,
//   ChevronRight,
//   Link as LinkIcon,
//   CalendarDays,
//   Clock,
//   MessageSquare,
//   Info,
//   SlidersHorizontal,
//   ImageOff,
//   Wallet,
// } from "lucide-react";
// import "./BrowseVenues.css";
// import {
//   filterVenues,
//   type VenueFilterParams,
//   type VenueResult,
// } from "../../api/venueApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";

// type FilterState = {
//   name: string;
//   location: string;
//   facilities: string;
//   capacity: string;
//   date: string;
//   start_time: string;
//   end_time: string;
// };

// const initialFilters: FilterState = {
//   name: "",
//   location: "",
//   facilities: "",
//   capacity: "",
//   date: "",
//   start_time: "",
//   end_time: "",
// };

// const BASE_IMAGE_URL = `${import.meta.env.VITE_API_BASE_URL}/uploads/venueImages/`;
// const LIMIT = 9;

// interface ImageSliderProps {
//   images: string[];
//   venueName: string;
//   tall?: boolean;
// }

// const ImageSlider: React.FC<ImageSliderProps> = ({
//   images,
//   venueName,
//   tall = false,
// }) => {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     setCurrent(0);
//   }, [images]);

//   const resolveUrl = (img: string) =>
//     img.startsWith("http") ? img : BASE_IMAGE_URL + img;

//   const prev = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
//   };

//   const next = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
//   };

//   if (!images || images.length === 0) {
//     return (
//       <div className={`bv-slider bv-slider-empty${tall ? " bv-slider-tall" : ""}`}>
//         <ImageOff size={32} />
//         <span>No images</span>
//       </div>
//     );
//   }

//   return (
//     <div className={`bv-slider${tall ? " bv-slider-tall" : ""}`}>
//       <img
//         src={resolveUrl(images[current])}
//         alt={`${venueName} image ${current + 1}`}
//         className="bv-slider-img"
//       />

//       {images.length > 1 && (
//         <>
//           <button
//             className="bv-slider-btn bv-slider-prev"
//             onClick={prev}
//             aria-label="Previous"
//             type="button"
//           >
//             <ChevronLeft size={18} />
//           </button>

//           <button
//             className="bv-slider-btn bv-slider-next"
//             onClick={next}
//             aria-label="Next"
//             type="button"
//           >
//             <ChevronRight size={18} />
//           </button>

//           <div className="bv-slider-dots">
//             {images.map((_, i) => (
//               <button
//                 key={i}
//                 className={`bv-slider-dot${i === current ? " bv-slider-dot-active" : ""}`}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setCurrent(i);
//                 }}
//                 aria-label={`Go to image ${i + 1}`}
//                 type="button"
//               />
//             ))}
//           </div>

//           <div className="bv-slider-counter">
//             {current + 1} / {images.length}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// interface VenueCardProps {
//   venue: VenueResult;
//   onViewInfo: (venue: VenueResult) => void;
// }

// const VenueCard: React.FC<VenueCardProps> = ({ venue, onViewInfo }) => {
//   return (
//     <div className="bv-card">
//       <ImageSlider images={venue.images} venueName={venue.name} />

//       <div className="bv-card-body">
//         <h3 className="bv-card-name">{venue.name}</h3>

//         <div className="bv-card-meta">
//           <div className="bv-card-meta-item">
//             <MapPin size={14} />
//             <span>{venue.location}</span>
//           </div>

//           <div className="bv-card-meta-item">
//             <Users size={14} />
//             <span>{venue.capacity} attendees</span>
//           </div>
//         </div>

//         <p className="bv-card-facilities">
//           <Building2 size={13} />
//           <span>{venue.facilities}</span>
//         </p>

//         <div className="bv-card-actions">
//           <button
//             className="bv-btn-outline"
//             type="button"
//             disabled
//             title="Coming soon"
//           >
//             <MessageSquare size={15} />
//             <span>Message</span>
//           </button>

//           <button
//             className="bv-btn-primary"
//             type="button"
//             onClick={() => onViewInfo(venue)}
//           >
//             <Info size={15} />
//             <span>View Info</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// interface ViewInfoModalProps {
//   venue: VenueResult;
//   onClose: () => void;
// }

// const ViewInfoModal: React.FC<ViewInfoModalProps> = ({ venue, onClose }) => {
//   const totalSlots = Array.isArray(venue.availabilities)
//     ? venue.availabilities.reduce((sum, a) => sum + (a.slots?.length ?? 0), 0)
//     : 0;

//   const hasAvailabilityDates =
//     Array.isArray(venue.availabilities) && venue.availabilities.length > 0;

//   const hasAvailableSlots = totalSlots > 0;

//   const formatPrice = (price: number | string) => {
//     const numeric = Number(price);
//     if (Number.isNaN(numeric)) return "$0.00";
//     return `$${numeric.toFixed(2)}`;
//   };

//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };

//     document.addEventListener("keydown", handler);
//     return () => document.removeEventListener("keydown", handler);
//   }, [onClose]);

//   return (
//     <div className="bv-modal-overlay" onClick={onClose}>
//       <div className="bv-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="bv-modal-header">
//           <div>
//             <h3>{venue.name}</h3>
//             <p>Full venue information</p>
//           </div>

//           <button
//             className="bv-close-btn"
//             onClick={onClose}
//             aria-label="Close"
//             type="button"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <div className="bv-modal-body">
//           <ImageSlider images={venue.images} venueName={venue.name} tall />

//           <div className="bv-modal-info-grid">
//             <div className="bv-modal-info-item">
//               <div className="bv-modal-info-label">
//                 <MapPin size={15} />
//                 <span>Location</span>
//               </div>
//               <p className="bv-modal-info-value">{venue.location}</p>
//             </div>

//             <div className="bv-modal-info-item">
//               <div className="bv-modal-info-label">
//                 <Users size={15} />
//                 <span>Capacity</span>
//               </div>
//               <p className="bv-modal-info-value">{venue.capacity} attendees</p>
//             </div>

//             <div className="bv-modal-info-item bv-modal-info-full">
//               <div className="bv-modal-info-label">
//                 <Building2 size={15} />
//                 <span>Facilities</span>
//               </div>
//               <p className="bv-modal-info-value">{venue.facilities}</p>
//             </div>

//             <div className="bv-modal-info-item bv-modal-info-full">
//               <div className="bv-modal-info-label">
//                 <LinkIcon size={15} />
//                 <span>Location Link</span>
//               </div>
//               <a
//                 href={venue.location_link}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="bv-modal-link"
//               >
//                 {venue.location_link}
//               </a>
//             </div>

//             <div className="bv-modal-info-item">
//               <div className="bv-modal-info-label">
//                 <CalendarDays size={15} />
//                 <span>Created At</span>
//               </div>
//               <p className="bv-modal-info-value">{venue.created_at}</p>
//             </div>
//           </div>

//           <div className="bv-modal-avail-section">
//             <h4 className="bv-modal-avail-title">
//               <CalendarDays size={16} />
//               <span>Available Slots</span>
//               {hasAvailableSlots && (
//                 <span className="bv-avail-badge">{totalSlots}</span>
//               )}
//             </h4>

//             {hasAvailabilityDates && hasAvailableSlots ? (
//               <div className="bv-avail-list">
//                 {venue.availabilities.map((avail, dateIdx) => (
//                   <div key={dateIdx} className="bv-avail-date-group">
//                     <div className="bv-avail-date-header">
//                       <CalendarDays size={14} />
//                       <span>{avail.date}</span>
//                       <span className="bv-avail-slots-count">
//                         {avail.slots.length} slot
//                         {avail.slots.length !== 1 ? "s" : ""}
//                       </span>
//                     </div>

//                     <div className="bv-avail-slots">
//                       {avail.slots.map((slot, slotIdx) => (
//                         <div key={slotIdx} className="bv-avail-slot-pill">
//                           <div className="bv-avail-slot-time">
//                             <Clock size={12} />
//                             <span>
//                               {slot.start_time.slice(0, 5)} –{" "}
//                               {slot.end_time.slice(0, 5)}
//                             </span>
//                           </div>

//                           <div className="bv-avail-slot-price">
//                             <Wallet size={12} />
//                             <span>{formatPrice(slot.price)}</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="bv-avail-empty">
//                 No available time slots for this venue at the moment.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const BrowseVenues: React.FC = () => {
//   const [filters, setFilters] = useState<FilterState>(initialFilters);
//   const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);

//   const [venues, setVenues] = useState<VenueResult[]>([]);
//   const [total, setTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [page, setPage] = useState(1);

//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isFetchingMore, setIsFetchingMore] = useState(false);

//   const [selectedVenue, setSelectedVenue] = useState<VenueResult | null>(null);

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const sentinelRef = useRef<HTMLDivElement | null>(null);
//   const observerRef = useRef<IntersectionObserver | null>(null);
//   const didInitialFetchRef = useRef(false);

//   const buildParams = (pageNum: number, currentFilters: FilterState): VenueFilterParams => {
//     const params: VenueFilterParams = {
//       page: pageNum,
//       limit: LIMIT,
//     };

//     if (currentFilters.name.trim()) params.name = currentFilters.name.trim();
//     if (currentFilters.location.trim()) params.location = currentFilters.location.trim();
//     if (currentFilters.facilities.trim()) params.facilities = currentFilters.facilities.trim();
//     if (currentFilters.capacity.trim()) params.capacity = Number(currentFilters.capacity);
//     if (currentFilters.date) params.date = currentFilters.date;
//     if (currentFilters.start_time) params.start_time = currentFilters.start_time;
//     if (currentFilters.end_time) params.end_time = currentFilters.end_time;

//     return params;
//   };

//   const fetchVenues = useCallback(
//     async (
//       pageNum: number,
//       currentFilters: FilterState,
//       mode: "initial" | "search" | "more"
//     ) => {
//       try {
//         if (mode === "initial") setIsInitialLoading(true);
//         if (mode === "search") setIsSearching(true);
//         if (mode === "more") setIsFetchingMore(true);

//         const params = buildParams(pageNum, currentFilters);
//         const result = await filterVenues(params);

//         setVenues((prev) =>
//           mode === "more" ? [...prev, ...result.venues] : result.venues
//         );
//         setTotal(result.total);
//         setTotalPages(result.totalPages || 1);
//         setPage(pageNum);
//       } catch (error) {
//         const msg =
//           error instanceof Error ? error.message : "Failed to fetch venues.";
//         showAlert(msg, "error");
//       } finally {
//         if (mode === "initial") setIsInitialLoading(false);
//         if (mode === "search") setIsSearching(false);
//         if (mode === "more") setIsFetchingMore(false);
//       }
//     },
//     [showAlert]
//   );

//   useEffect(() => {
//     if (didInitialFetchRef.current) return;
//     didInitialFetchRef.current = true;
//     fetchVenues(1, initialFilters, "initial");
//   }, [fetchVenues]);

//   useEffect(() => {
//     if (observerRef.current) observerRef.current.disconnect();

//     if (!sentinelRef.current) return;
//     if (isInitialLoading || isSearching || isFetchingMore) return;
//     if (page >= totalPages) return;
//     if (venues.length === 0) return;

//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         const first = entries[0];
//         if (first?.isIntersecting) {
//           fetchVenues(page + 1, appliedFilters, "more");
//         }
//       },
//       {
//         root: null,
//         rootMargin: "220px",
//         threshold: 0,
//       }
//     );

//     observerRef.current.observe(sentinelRef.current);

//     return () => observerRef.current?.disconnect();
//   }, [
//     page,
//     totalPages,
//     isInitialLoading,
//     isSearching,
//     isFetchingMore,
//     appliedFilters,
//     venues.length,
//     fetchVenues,
//   ]);

//   const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleApplyFilters = async () => {
//     setAppliedFilters(filters);
//     await fetchVenues(1, filters, "search");
//   };

//   const handleClearFilters = async () => {
//     setFilters(initialFilters);
//     setAppliedFilters(initialFilters);
//     await fetchVenues(1, initialFilters, "search");
//   };

//   const hasActiveFilters = Object.values(appliedFilters).some(
//     (value) => value.trim() !== ""
//   );

//   return (
//     <>
//       <div className="page-shell">
//         <div className="page-header">
//           <div>
//             <h1 className="page-title">Browse Venues</h1>
//             <p className="page-subtitle">
//               Discover venues, explore details, and check available slots.
//             </p>
//           </div>
//         </div>

//         <div className="surface-card bv-filter-card">
//           <div className="bv-filter-header">
//             <div className="bv-filter-title">
//               <SlidersHorizontal size={17} />
//               <span>Filter Venues</span>
//             </div>

//             <button
//               type="button"
//               className="bv-clear-btn"
//               onClick={handleClearFilters}
//               disabled={isSearching || isInitialLoading}
//             >
//               <X size={14} />
//               <span>Clear</span>
//             </button>
//           </div>

//           <div className="bv-filter-grid">
//             <div className="bv-filter-field">
//               <label htmlFor="f-name">Venue Name</label>
//               <input
//                 id="f-name"
//                 name="name"
//                 type="text"
//                 value={filters.name}
//                 onChange={handleFilterChange}
//                 placeholder="e.g. Grand Hall"
//               />
//             </div>

//             <div className="bv-filter-field">
//               <label htmlFor="f-location">Location</label>
//               <input
//                 id="f-location"
//                 name="location"
//                 type="text"
//                 value={filters.location}
//                 onChange={handleFilterChange}
//                 placeholder="e.g. Beirut"
//               />
//             </div>

//             <div className="bv-filter-field">
//               <label htmlFor="f-facilities">Facilities</label>
//               <input
//                 id="f-facilities"
//                 name="facilities"
//                 type="text"
//                 value={filters.facilities}
//                 onChange={handleFilterChange}
//                 placeholder="e.g. Stage, WiFi"
//               />
//             </div>

//             <div className="bv-filter-field">
//               <label htmlFor="f-capacity">Min. Capacity</label>
//               <input
//                 id="f-capacity"
//                 name="capacity"
//                 type="number"
//                 min="1"
//                 value={filters.capacity}
//                 onChange={handleFilterChange}
//                 placeholder="e.g. 200"
//               />
//             </div>

//             <div className="bv-filter-field">
//               <label htmlFor="f-date">Date</label>
//               <input
//                 id="f-date"
//                 name="date"
//                 type="date"
//                 value={filters.date}
//                 onChange={handleFilterChange}
//               />
//             </div>

//             <div className="bv-filter-field">
//               <label htmlFor="f-start">Start Time</label>
//               <input
//                 id="f-start"
//                 name="start_time"
//                 type="time"
//                 value={filters.start_time}
//                 onChange={handleFilterChange}
//               />
//             </div>

//             <div className="bv-filter-field">
//               <label htmlFor="f-end">End Time</label>
//               <input
//                 id="f-end"
//                 name="end_time"
//                 type="time"
//                 value={filters.end_time}
//                 onChange={handleFilterChange}
//               />
//             </div>
//           </div>

//           <div className="bv-filter-actions">
//             <button
//               type="button"
//               className="bv-btn-primary bv-filter-submit"
//               onClick={handleApplyFilters}
//               disabled={isSearching || isInitialLoading}
//             >
//               {isSearching ? (
//                 <>
//                   <LoaderCircle size={16} className="bv-spin" />
//                   <span>Searching...</span>
//                 </>
//               ) : (
//                 <>
//                   <Search size={16} />
//                   <span>Search Venues</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {!isInitialLoading && (
//           <div className="bv-results-header">
//             <span className="bv-results-count">
//               {isSearching
//                 ? "Searching venues..."
//                 : total === 0
//                 ? "No venues found"
//                 : `${total} venue${total !== 1 ? "s" : ""} found`}
//             </span>
//           </div>
//         )}

//         {isInitialLoading ? (
//           <div className="surface-card bv-state-card">
//             <div className="bv-state-inner">
//               <LoaderCircle size={24} className="bv-spin" />
//               <span>Loading venues...</span>
//             </div>
//           </div>
//         ) : (
//           <>
//             {!isSearching && venues.length === 0 && (
//               <div className="surface-card bv-state-card">
//                 <div className="bv-empty">
//                   <div className="bv-empty-icon">
//                     <Building2 size={28} />
//                   </div>
//                   <h3>No venues found</h3>
//                   <p>
//                     {hasActiveFilters
//                       ? "No venues match your current filters. Try adjusting or clearing them."
//                       : "There are no venues available at the moment."}
//                   </p>

//                   {hasActiveFilters && (
//                     <button
//                       type="button"
//                       className="bv-btn-primary"
//                       onClick={handleClearFilters}
//                     >
//                       <X size={16} />
//                       <span>Clear Filters</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}

//             {venues.length > 0 && (
//               <div className="bv-grid">
//                 {venues.map((venue) => (
//                   <VenueCard
//                     key={venue.id}
//                     venue={venue}
//                     onViewInfo={setSelectedVenue}
//                   />
//                 ))}
//               </div>
//             )}

//             {isSearching && venues.length > 0 && (
//               <div className="bv-load-more">
//                 <LoaderCircle size={20} className="bv-spin" />
//                 <span>Refreshing venues...</span>
//               </div>
//             )}
//           </>
//         )}

//         <div ref={sentinelRef} className="bv-sentinel" />

//         {isFetchingMore && (
//           <div className="bv-load-more">
//             <LoaderCircle size={20} className="bv-spin" />
//             <span>Loading more venues...</span>
//           </div>
//         )}

//         {!isInitialLoading &&
//           !isSearching &&
//           !isFetchingMore &&
//           venues.length > 0 &&
//           page >= totalPages && (
//             <div className="bv-end-message">
//               All {total} venue{total !== 1 ? "s" : ""} loaded
//             </div>
//           )}
//       </div>

//       {selectedVenue && (
//         <ViewInfoModal
//           venue={selectedVenue}
//           onClose={() => setSelectedVenue(null)}
//         />
//       )}

//       <AlertSnackbar
//         open={open}
//         message={message}
//         severity={severity}
//         onClose={handleClose}
//       />
//     </>
//   );
// };

// export default BrowseVenues;




import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Users,
  Building2,
  X,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  CalendarDays,
  Clock,
  MessageSquare,
  Info,
  SlidersHorizontal,
  ImageOff,
  Wallet,
} from "lucide-react";
import "./BrowseVenues.css";
import {
  filterVenues,
  type VenueFilterParams,
  type VenueResult,
} from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

type FilterState = {
  name: string;
  location: string;
  facilities: string;
  capacity: string;
  date: string;
  start_time: string;
  end_time: string;
};

const initialFilters: FilterState = {
  name: "",
  location: "",
  facilities: "",
  capacity: "",
  date: "",
  start_time: "",
  end_time: "",
};

const BASE_IMAGE_URL = `${import.meta.env.VITE_API_BASE_URL}/uploads/venueImages/`;
const LIMIT = 9;

interface ImageSliderProps {
  images: string[];
  venueName: string;
  tall?: boolean;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  venueName,
  tall = false,
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [images]);

  const resolveUrl = (img: string) =>
    img.startsWith("http") ? img : BASE_IMAGE_URL + img;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bv-slider bv-slider-empty${tall ? " bv-slider-tall" : ""}`}>
        <ImageOff size={32} />
        <span>No images</span>
      </div>
    );
  }

  return (
    <div className={`bv-slider${tall ? " bv-slider-tall" : ""}`}>
      <img
        src={resolveUrl(images[current])}
        alt={`${venueName} image ${current + 1}`}
        className="bv-slider-img"
      />

      {images.length > 1 && (
        <>
          <button
            className="bv-slider-btn bv-slider-prev"
            onClick={prev}
            aria-label="Previous"
            type="button"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            className="bv-slider-btn bv-slider-next"
            onClick={next}
            aria-label="Next"
            type="button"
          >
            <ChevronRight size={18} />
          </button>

          <div className="bv-slider-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`bv-slider-dot${i === current ? " bv-slider-dot-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                aria-label={`Go to image ${i + 1}`}
                type="button"
              />
            ))}
          </div>

          <div className="bv-slider-counter">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

interface VenueCardProps {
  venue: VenueResult;
  onViewInfo: (venue: VenueResult) => void;
  onMessage: (venueId: number) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  onViewInfo,
  onMessage,
}) => {
  return (
    <div className="bv-card">
      <ImageSlider images={venue.images} venueName={venue.name} />

      <div className="bv-card-body">
        <h3 className="bv-card-name">{venue.name}</h3>

        <div className="bv-card-meta">
          <div className="bv-card-meta-item">
            <MapPin size={14} />
            <span>{venue.location}</span>
          </div>

          <div className="bv-card-meta-item">
            <Users size={14} />
            <span>{venue.capacity} attendees</span>
          </div>
        </div>

        <p className="bv-card-facilities">
          <Building2 size={13} />
          <span>{venue.facilities}</span>
        </p>

        <div className="bv-card-actions">
          <button
            className="bv-btn-outline bv-message-btn"
            type="button"
            onClick={() => onMessage(venue.id)}
          >
            <MessageSquare size={15} />
            <span>Message</span>
          </button>

          <button
            className="bv-btn-primary"
            type="button"
            onClick={() => onViewInfo(venue)}
          >
            <Info size={15} />
            <span>View Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ViewInfoModalProps {
  venue: VenueResult;
  onClose: () => void;
}

const ViewInfoModal: React.FC<ViewInfoModalProps> = ({ venue, onClose }) => {
  const totalSlots = Array.isArray(venue.availabilities)
    ? venue.availabilities.reduce((sum, a) => sum + (a.slots?.length ?? 0), 0)
    : 0;

  const hasAvailabilityDates =
    Array.isArray(venue.availabilities) && venue.availabilities.length > 0;

  const hasAvailableSlots = totalSlots > 0;

  const formatPrice = (price: number | string) => {
    const numeric = Number(price);
    if (Number.isNaN(numeric)) return "$0.00";
    return `$${numeric.toFixed(2)}`;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="bv-modal-overlay" onClick={onClose}>
      <div className="bv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bv-modal-header">
          <div>
            <h3>{venue.name}</h3>
            <p>Full venue information</p>
          </div>

          <button
            className="bv-close-btn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bv-modal-body">
          <ImageSlider images={venue.images} venueName={venue.name} tall />

          <div className="bv-modal-info-grid">
            <div className="bv-modal-info-item">
              <div className="bv-modal-info-label">
                <MapPin size={15} />
                <span>Location</span>
              </div>
              <p className="bv-modal-info-value">{venue.location}</p>
            </div>

            <div className="bv-modal-info-item">
              <div className="bv-modal-info-label">
                <Users size={15} />
                <span>Capacity</span>
              </div>
              <p className="bv-modal-info-value">{venue.capacity} attendees</p>
            </div>

            <div className="bv-modal-info-item bv-modal-info-full">
              <div className="bv-modal-info-label">
                <Building2 size={15} />
                <span>Facilities</span>
              </div>
              <p className="bv-modal-info-value">{venue.facilities}</p>
            </div>

            <div className="bv-modal-info-item bv-modal-info-full">
              <div className="bv-modal-info-label">
                <LinkIcon size={15} />
                <span>Location Link</span>
              </div>
              <a
                href={venue.location_link}
                target="_blank"
                rel="noreferrer"
                className="bv-modal-link"
              >
                {venue.location_link}
              </a>
            </div>

            <div className="bv-modal-info-item">
              <div className="bv-modal-info-label">
                <CalendarDays size={15} />
                <span>Created At</span>
              </div>
              <p className="bv-modal-info-value">{venue.created_at}</p>
            </div>
          </div>

          <div className="bv-modal-avail-section">
            <h4 className="bv-modal-avail-title">
              <CalendarDays size={16} />
              <span>Available Slots</span>
              {hasAvailableSlots && (
                <span className="bv-avail-badge">{totalSlots}</span>
              )}
            </h4>

            {hasAvailabilityDates && hasAvailableSlots ? (
              <div className="bv-avail-list">
                {venue.availabilities.map((avail, dateIdx) => (
                  <div key={dateIdx} className="bv-avail-date-group">
                    <div className="bv-avail-date-header">
                      <CalendarDays size={14} />
                      <span>{avail.date}</span>
                      <span className="bv-avail-slots-count">
                        {avail.slots.length} slot
                        {avail.slots.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="bv-avail-slots">
                      {avail.slots.map((slot, slotIdx) => (
                        <div key={slotIdx} className="bv-avail-slot-pill">
                          <div className="bv-avail-slot-time">
                            <Clock size={12} />
                            <span>
                              {slot.start_time.slice(0, 5)} –{" "}
                              {slot.end_time.slice(0, 5)}
                            </span>
                          </div>

                          <div className="bv-avail-slot-price">
                            <Wallet size={12} />
                            <span>{formatPrice(slot.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bv-avail-empty">
                No available time slots for this venue at the moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BrowseVenues: React.FC = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);

  const [venues, setVenues] = useState<VenueResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState<VenueResult | null>(null);

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const didInitialFetchRef = useRef(false);

  const buildParams = (pageNum: number, currentFilters: FilterState): VenueFilterParams => {
    const params: VenueFilterParams = {
      page: pageNum,
      limit: LIMIT,
    };

    if (currentFilters.name.trim()) params.name = currentFilters.name.trim();
    if (currentFilters.location.trim()) params.location = currentFilters.location.trim();
    if (currentFilters.facilities.trim()) params.facilities = currentFilters.facilities.trim();
    if (currentFilters.capacity.trim()) params.capacity = Number(currentFilters.capacity);
    if (currentFilters.date) params.date = currentFilters.date;
    if (currentFilters.start_time) params.start_time = currentFilters.start_time;
    if (currentFilters.end_time) params.end_time = currentFilters.end_time;

    return params;
  };

  const fetchVenues = useCallback(
    async (
      pageNum: number,
      currentFilters: FilterState,
      mode: "initial" | "search" | "more"
    ) => {
      try {
        if (mode === "initial") setIsInitialLoading(true);
        if (mode === "search") setIsSearching(true);
        if (mode === "more") setIsFetchingMore(true);

        const params = buildParams(pageNum, currentFilters);
        const result = await filterVenues(params);

        setVenues((prev) =>
          mode === "more" ? [...prev, ...result.venues] : result.venues
        );
        setTotal(result.total);
        setTotalPages(result.totalPages || 1);
        setPage(pageNum);
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Failed to fetch venues.";
        showAlert(msg, "error");
      } finally {
        if (mode === "initial") setIsInitialLoading(false);
        if (mode === "search") setIsSearching(false);
        if (mode === "more") setIsFetchingMore(false);
      }
    },
    [showAlert]
  );

  useEffect(() => {
    if (didInitialFetchRef.current) return;
    didInitialFetchRef.current = true;
    fetchVenues(1, initialFilters, "initial");
  }, [fetchVenues]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    if (!sentinelRef.current) return;
    if (isInitialLoading || isSearching || isFetchingMore) return;
    if (page >= totalPages) return;
    if (venues.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          fetchVenues(page + 1, appliedFilters, "more");
        }
      },
      {
        root: null,
        rootMargin: "220px",
        threshold: 0,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [
    page,
    totalPages,
    isInitialLoading,
    isSearching,
    isFetchingMore,
    appliedFilters,
    venues.length,
    fetchVenues,
  ]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = async () => {
    setAppliedFilters(filters);
    await fetchVenues(1, filters, "search");
  };

  const handleClearFilters = async () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    await fetchVenues(1, initialFilters, "search");
  };

  const handleMessageVenue = (venueId: number) => {
    navigate(`/organizer/chat-room/venue/${venueId}`);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(
    (value) => value.trim() !== ""
  );

  return (
    <>
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">Browse Venues</h1>
            <p className="page-subtitle">
              Discover venues, explore details, and check available slots.
            </p>
          </div>
        </div>

        <div className="surface-card bv-filter-card">
          <div className="bv-filter-header">
            <div className="bv-filter-title">
              <SlidersHorizontal size={17} />
              <span>Filter Venues</span>
            </div>

            <button
              type="button"
              className="bv-clear-btn"
              onClick={handleClearFilters}
              disabled={isSearching || isInitialLoading}
            >
              <X size={14} />
              <span>Clear</span>
            </button>
          </div>

          <div className="bv-filter-grid">
            <div className="bv-filter-field">
              <label htmlFor="f-name">Venue Name</label>
              <input
                id="f-name"
                name="name"
                type="text"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="e.g. Grand Hall"
              />
            </div>

            <div className="bv-filter-field">
              <label htmlFor="f-location">Location</label>
              <input
                id="f-location"
                name="location"
                type="text"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g. Beirut"
              />
            </div>

            <div className="bv-filter-field">
              <label htmlFor="f-facilities">Facilities</label>
              <input
                id="f-facilities"
                name="facilities"
                type="text"
                value={filters.facilities}
                onChange={handleFilterChange}
                placeholder="e.g. Stage, WiFi"
              />
            </div>

            <div className="bv-filter-field">
              <label htmlFor="f-capacity">Min. Capacity</label>
              <input
                id="f-capacity"
                name="capacity"
                type="number"
                min="1"
                value={filters.capacity}
                onChange={handleFilterChange}
                placeholder="e.g. 200"
              />
            </div>

            <div className="bv-filter-field">
              <label htmlFor="f-date">Date</label>
              <input
                id="f-date"
                name="date"
                type="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>

            <div className="bv-filter-field">
              <label htmlFor="f-start">Start Time</label>
              <input
                id="f-start"
                name="start_time"
                type="time"
                value={filters.start_time}
                onChange={handleFilterChange}
              />
            </div>

            <div className="bv-filter-field">
              <label htmlFor="f-end">End Time</label>
              <input
                id="f-end"
                name="end_time"
                type="time"
                value={filters.end_time}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="bv-filter-actions">
            <button
              type="button"
              className="bv-btn-primary bv-filter-submit"
              onClick={handleApplyFilters}
              disabled={isSearching || isInitialLoading}
            >
              {isSearching ? (
                <>
                  <LoaderCircle size={16} className="bv-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Search Venues</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!isInitialLoading && (
          <div className="bv-results-header">
            <span className="bv-results-count">
              {isSearching
                ? "Searching venues..."
                : total === 0
                ? "No venues found"
                : `${total} venue${total !== 1 ? "s" : ""} found`}
            </span>
          </div>
        )}

        {isInitialLoading ? (
          <div className="surface-card bv-state-card">
            <div className="bv-state-inner">
              <LoaderCircle size={24} className="bv-spin" />
              <span>Loading venues...</span>
            </div>
          </div>
        ) : (
          <>
            {!isSearching && venues.length === 0 && (
              <div className="surface-card bv-state-card">
                <div className="bv-empty">
                  <div className="bv-empty-icon">
                    <Building2 size={28} />
                  </div>
                  <h3>No venues found</h3>
                  <p>
                    {hasActiveFilters
                      ? "No venues match your current filters. Try adjusting or clearing them."
                      : "There are no venues available at the moment."}
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="bv-btn-primary"
                      onClick={handleClearFilters}
                    >
                      <X size={16} />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {venues.length > 0 && (
              <div className="bv-grid">
                {venues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onViewInfo={setSelectedVenue}
                    onMessage={handleMessageVenue}
                  />
                ))}
              </div>
            )}

            {isSearching && venues.length > 0 && (
              <div className="bv-load-more">
                <LoaderCircle size={20} className="bv-spin" />
                <span>Refreshing venues...</span>
              </div>
            )}
          </>
        )}

        <div ref={sentinelRef} className="bv-sentinel" />

        {isFetchingMore && (
          <div className="bv-load-more">
            <LoaderCircle size={20} className="bv-spin" />
            <span>Loading more venues...</span>
          </div>
        )}

        {!isInitialLoading &&
          !isSearching &&
          !isFetchingMore &&
          venues.length > 0 &&
          page >= totalPages && (
            <div className="bv-end-message">
              All {total} venue{total !== 1 ? "s" : ""} loaded
            </div>
          )}
      </div>

      {selectedVenue && (
        <ViewInfoModal
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      )}

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </>
  );
};

export default BrowseVenues;