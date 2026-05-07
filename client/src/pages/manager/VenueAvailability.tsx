// import React, { useEffect, useMemo, useState } from "react";
// import {
//   CalendarDays,
//   Clock3,
//   Plus,
//   LoaderCircle,
//   CircleAlert,
//   CalendarClock,
//   Ban,
//   Lock,
//   Wallet,
// } from "lucide-react";
// import "./VenueAvailability.css";
// import {
//   createVenueAvailabiltyForManager,
//   fetchVenueBookedTimes,
//   getALLVenueAvailabilities,
//   type VenueAvailabilityDay,
//   type VenueAvailabilityItem,
// } from "../../api/venueApi";

// type AvailabilityFormState = {
//   date: string;
//   startTime: string;
//   endTime: string;
//   price: string;
// };

// const initialFormState: AvailabilityFormState = {
//   date: "",
//   startTime: "",
//   endTime: "",
//   price: "",
// };

// const VenueAvailablity: React.FC = () => {
//   const [availabilities, setAvailabilities] = useState<VenueAvailabilityDay[]>([]);
//   const [bookedTimes, setBookedTimes] = useState<VenueAvailabilityItem[]>([]);
//   const [form, setForm] = useState<AvailabilityFormState>(initialFormState);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isBookedLoading, setIsBookedLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [pageError, setPageError] = useState("");
//   const [bookedError, setBookedError] = useState("");
//   const [submitError, setSubmitError] = useState("");

//   const managerId = useMemo(() => {
//     const raw = localStorage.getItem("managerId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const sortAvailabilityDays = (days: VenueAvailabilityDay[]): VenueAvailabilityDay[] => {
//     return [...days].sort(
//       (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//     );
//   };

//   const sortAvailabilityItems = (items: VenueAvailabilityItem[]) => {
//     return [...items].sort((a, b) => {
//       const first = new Date(`${a.date}T${a.startTime}`).getTime();
//       const second = new Date(`${b.date}T${b.startTime}`).getTime();
//       return first - second;
//     });
//   };

//   const loadAvailabilities = async () => {
//     if (!managerId || Number.isNaN(managerId)) {
//       setPageError("Manager ID was not found. Please log in again.");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       setPageError("");
//       setIsLoading(true);

//       const data = await getALLVenueAvailabilities(managerId);
//       setAvailabilities(sortAvailabilityDays(data));
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to load venue availabilities.";
//       setPageError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadBookedTimes = async () => {
//     if (!managerId || Number.isNaN(managerId)) {
//       setBookedError("Manager ID was not found. Please log in again.");
//       setIsBookedLoading(false);
//       return;
//     }

//     try {
//       setBookedError("");
//       setIsBookedLoading(true);

//       const data = await fetchVenueBookedTimes(managerId);
//       setBookedTimes(sortAvailabilityItems(data));
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to load booked times.";
//       setBookedError(message);
//     } finally {
//       setIsBookedLoading(false);
//     }
//   };

//   const refreshAllLists = async () => {
//     await Promise.all([loadAvailabilities(), loadBookedTimes()]);
//   };

//   useEffect(() => {
//     refreshAllLists();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const resetForm = () => {
//     setForm(initialFormState);
//     setSubmitError("");
//   };

//   const formatDateForCard = (date: string) => {
//     const parsedDate = new Date(`${date}T00:00:00`);
//     return parsedDate.toLocaleDateString(undefined, {
//       weekday: "short",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const formatTimeForCard = (time: string) => {
//     const [hours = "0", minutes = "0"] = time.split(":");
//     const date = new Date();
//     date.setHours(Number(hours), Number(minutes), 0, 0);
//     return date.toLocaleTimeString(undefined, {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const formatPrice = (price: number | string) => {
//     const numericPrice = Number(price);
//     if (Number.isNaN(numericPrice)) return "$0.00";
//     return `$${numericPrice.toFixed(2)}`;
//   };

//   const handleCreateAvailability = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!managerId || Number.isNaN(managerId)) {
//       setSubmitError("Manager ID was not found. Please log in again.");
//       return;
//     }

//     if (!form.date || !form.startTime || !form.endTime || !form.price) {
//       setSubmitError("Please fill in date, start time, end time, and price.");
//       return;
//     }

//     if (form.endTime <= form.startTime) {
//       setSubmitError("End time must be later than start time.");
//       return;
//     }

//     if (Number(form.price) <= 0) {
//       setSubmitError("Price must be greater than 0.");
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       setSubmitError("");

//       await createVenueAvailabiltyForManager({
//         managerId,
//         date: form.date,
//         startTime: form.startTime,
//         endTime: form.endTime,
//         price: Number(form.price),
//       });

//       resetForm();
//       await refreshAllLists();
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to create venue availability.";
//       setSubmitError(message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const totalSlots = availabilities.reduce((sum, day) => sum + day.slots.length, 0);

//   return (
//     <div className="page-shell">
//       <div className="page-header">
//         <h2 className="page-title">Availability</h2>
//         <p className="page-subtitle">
//           Set your venue&apos;s available hours and prices for each time slot.
//         </p>
//       </div>

//       <div className="surface-card venue-availability-list-card">
//         <div className="venue-availability-section-header">
//           <div className="venue-availability-header-left">
//             <div className="venue-availability-header-icon">
//               <CalendarClock size={19} />
//             </div>
//             <div>
//               <h3 className="venue-availability-section-title">Assigned Availability</h3>
//               <p className="venue-availability-section-subtitle">
//                 All available date, time slots, and prices for your venue.
//               </p>
//             </div>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="venue-availability-state">
//             <LoaderCircle size={22} className="spin-icon" />
//             <span>Loading availabilities...</span>
//           </div>
//         ) : pageError ? (
//           <div className="venue-availability-state venue-availability-error">
//             <CircleAlert size={20} />
//             <span>{pageError}</span>
//           </div>
//         ) : availabilities.length === 0 || totalSlots === 0 ? (
//           <div className="venue-availability-empty">
//             <div className="venue-availability-empty-icon">
//               <Ban size={26} />
//             </div>
//             <h3>No availabilities assigned yet</h3>
//             <p>You have not assigned any availabilities for this venue yet.</p>
//           </div>
//         ) : (
//           <div className="venue-availability-grid">
//             {availabilities.map((day) => (
//               <div className="venue-availability-item" key={day.date}>
//                 <div className="venue-availability-item-top-row">
//                   <div className="venue-availability-item-row">
//                     <CalendarDays size={16} />
//                     <span>{formatDateForCard(day.date)}</span>
//                   </div>
//                   <div className="venue-availability-item-badge">
//                     {day.slots.length} slot{day.slots.length !== 1 ? "s" : ""}
//                   </div>
//                 </div>

//                 <div className="venue-availability-slots-list">
//                   {day.slots.map((slot, slotIdx) => (
//                     <div key={slotIdx} className="venue-availability-slot-row">
//                       <div className="venue-availability-slot-main">
//                         <div className="venue-availability-slot-time">
//                           <Clock3 size={14} />
//                           <span>
//                             {formatTimeForCard(slot.startTime)} –{" "}
//                             {formatTimeForCard(slot.endTime)}
//                           </span>
//                         </div>

//                         <div className="venue-availability-slot-price">
//                           <Wallet size={14} />
//                           <span>{formatPrice(slot.price)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="surface-card venue-availability-list-card">
//         <div className="venue-availability-section-header">
//           <div className="venue-availability-header-left">
//             <div className="venue-availability-header-icon venue-availability-header-icon-booked">
//               <Lock size={19} />
//             </div>
//             <div>
//               <h3 className="venue-availability-section-title">Booked Times</h3>
//               <p className="venue-availability-section-subtitle">
//                 Date and time slots that are already booked for your venue.
//               </p>
//             </div>
//           </div>
//         </div>

//         {isBookedLoading ? (
//           <div className="venue-availability-state">
//             <LoaderCircle size={22} className="spin-icon" />
//             <span>Loading booked times...</span>
//           </div>
//         ) : bookedError ? (
//           <div className="venue-availability-state venue-availability-error">
//             <CircleAlert size={20} />
//             <span>{bookedError}</span>
//           </div>
//         ) : bookedTimes.length === 0 ? (
//           <div className="venue-availability-empty">
//             <div className="venue-availability-empty-icon venue-availability-empty-icon-booked">
//               <Lock size={26} />
//             </div>
//             <h3>No booked times yet</h3>
//             <p>There are currently no booked time slots for this venue.</p>
//           </div>
//         ) : (
//           <div className="venue-availability-grid">
//             {bookedTimes.map((item) => (
//               <div
//                 className="venue-availability-item venue-availability-item-booked"
//                 key={item.id}
//               >
//                 <div className="venue-availability-item-top-row">
//                   <div className="venue-availability-item-row">
//                     <CalendarDays size={16} />
//                     <span>{formatDateForCard(item.date)}</span>
//                   </div>
//                   <div className="venue-availability-item-badge venue-availability-item-badge-booked">
//                     Booked
//                   </div>
//                 </div>

//                 <div className="venue-availability-item-row venue-availability-item-time-row">
//                   <Clock3 size={16} />
//                   <span>
//                     {formatTimeForCard(item.startTime)} –{" "}
//                     {formatTimeForCard(item.endTime)}
//                   </span>
//                 </div>

//                 <div className="venue-availability-item-row venue-availability-item-price-row">
//                   <Wallet size={16} />
//                   <span>{formatPrice(item.price)}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="surface-card venue-availability-form-card">
//         <div className="venue-availability-form-header">
//           <div className="venue-availability-header-left">
//             <div className="venue-availability-header-icon">
//               <Plus size={18} />
//             </div>
//             <div>
//               <h3 className="venue-availability-section-title">Create Availability</h3>
//               <p className="venue-availability-section-subtitle">
//                 Add a new available date, time slot, and price for your venue.
//               </p>
//             </div>
//           </div>
//         </div>

//         <form className="venue-availability-form" onSubmit={handleCreateAvailability}>
//           <div className="venue-availability-form-grid">
//             <div className="venue-availability-field">
//               <label htmlFor="date">Date</label>
//               <div className="venue-availability-input-wrap">
//                 <input
//                   id="date"
//                   name="date"
//                   type="date"
//                   value={form.date}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="venue-availability-time-range">
//               <div className="venue-availability-field">
//                 <label htmlFor="startTime">Start Time</label>
//                 <div className="venue-availability-input-wrap">
//                   <input
//                     id="startTime"
//                     name="startTime"
//                     type="time"
//                     value={form.startTime}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="venue-availability-time-separator">to</div>

//               <div className="venue-availability-field">
//                 <label htmlFor="endTime">End Time</label>
//                 <div className="venue-availability-input-wrap">
//                   <input
//                     id="endTime"
//                     name="endTime"
//                     type="time"
//                     value={form.endTime}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="venue-availability-field">
//               <label htmlFor="price">Price</label>
//               <div className="venue-availability-input-wrap">
//                 <input
//                   id="price"
//                   name="price"
//                   type="number"
//                   min="0.01"
//                   step="0.01"
//                   value={form.price}
//                   onChange={handleChange}
//                   placeholder="Enter slot price"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           {submitError && (
//             <div className="venue-availability-submit-error">{submitError}</div>
//           )}

//           <div className="venue-availability-actions">
//             <button
//               className="venue-availability-create-btn"
//               type="submit"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <LoaderCircle size={18} className="spin-icon" />
//                   <span>Creating...</span>
//                 </>
//               ) : (
//                 <>
//                   <Plus size={18} />
//                   <span>Create</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default VenueAvailablity;


import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Plus,
  LoaderCircle,
  CircleAlert,
  CalendarClock,
  Ban,
  Lock,
  Wallet,
} from "lucide-react";
import "./VenueAvailability.css";
import {
  createVenueAvailabiltyForManager,
  fetchVenueBookedTimes,
  getALLVenueAvailabilities,
  type VenueAvailabilityDay,
  type VenueAvailabilityItem,
} from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

type AvailabilityFormState = {
  date: string;
  startTime: string;
  endTime: string;
  price: string;
};

const initialFormState: AvailabilityFormState = {
  date: "",
  startTime: "",
  endTime: "",
  price: "",
};

const VenueAvailablity: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<VenueAvailabilityDay[]>([]);
  const [bookedTimes, setBookedTimes] = useState<VenueAvailabilityItem[]>([]);
  const [form, setForm] = useState<AvailabilityFormState>(initialFormState);

  const [isLoading, setIsLoading] = useState(true);
  const [isBookedLoading, setIsBookedLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [bookedError, setBookedError] = useState("");

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const managerId = useMemo(() => {
    const raw = localStorage.getItem("managerId");
    return raw ? Number(raw) : null;
  }, []);

  const sortAvailabilityDays = (days: VenueAvailabilityDay[]): VenueAvailabilityDay[] => {
    return [...days].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const sortAvailabilityItems = (items: VenueAvailabilityItem[]) => {
    return [...items].sort((a, b) => {
      const first = new Date(`${a.date}T${a.startTime}`).getTime();
      const second = new Date(`${b.date}T${b.startTime}`).getTime();
      return first - second;
    });
  };

  const loadAvailabilities = async () => {
    if (!managerId || Number.isNaN(managerId)) {
      const msg = "Manager ID was not found. Please log in again.";
      setPageError(msg);
      setIsLoading(false);
      showAlert(msg, "error");
      return;
    }

    try {
      setPageError("");
      setIsLoading(true);

      const data = await getALLVenueAvailabilities(managerId);
      setAvailabilities(sortAvailabilityDays(data));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load venue availabilities.";
      setPageError(message);
      showAlert(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookedTimes = async () => {
    if (!managerId || Number.isNaN(managerId)) {
      const msg = "Manager ID was not found. Please log in again.";
      setBookedError(msg);
      setIsBookedLoading(false);
      showAlert(msg, "error");
      return;
    }

    try {
      setBookedError("");
      setIsBookedLoading(true);

      const data = await fetchVenueBookedTimes(managerId);
      setBookedTimes(sortAvailabilityItems(data));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load booked times.";
      setBookedError(message);
      showAlert(message, "error");
    } finally {
      setIsBookedLoading(false);
    }
  };

  const refreshAllLists = async () => {
    await Promise.all([loadAvailabilities(), loadBookedTimes()]);
  };

  useEffect(() => {
    refreshAllLists();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialFormState);
  };

  const formatDateForCard = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`);
    return parsedDate.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeForCard = (time: string) => {
    const [hours = "0", minutes = "0"] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPrice = (price: number | string) => {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) return "$0.00";
    return `$${numericPrice.toFixed(2)}`;
  };

  const handleCreateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      return;
    }

    if (!form.date || !form.startTime || !form.endTime || !form.price) {
      showAlert("Please fill in date, start time, end time, and price.", "error");
      return;
    }

    if (form.endTime <= form.startTime) {
      showAlert("End time must be later than start time.", "error");
      return;
    }

    if (Number(form.price) <= 0) {
      showAlert("Price must be greater than 0.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      await createVenueAvailabiltyForManager({
        managerId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        price: Number(form.price),
      });

      resetForm();
      await refreshAllLists();
      showAlert("Venue availability created successfully.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create venue availability.";
      showAlert(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSlots = availabilities.reduce((sum, day) => sum + day.slots.length, 0);

  return (
    <>
      <div className="page-shell">
        <div className="page-header">
          <h2 className="page-title">Availability</h2>
          <p className="page-subtitle">
            Set your venue&apos;s available hours and prices for each time slot.
          </p>
        </div>

        <div className="surface-card venue-availability-list-card">
          <div className="venue-availability-section-header">
            <div className="venue-availability-header-left">
              <div className="venue-availability-header-icon">
                <CalendarClock size={19} />
              </div>
              <div>
                <h3 className="venue-availability-section-title">Assigned Availability</h3>
                <p className="venue-availability-section-subtitle">
                  All available date, time slots, and prices for your venue.
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="venue-availability-state">
              <LoaderCircle size={22} className="spin-icon" />
              <span>Loading availabilities...</span>
            </div>
          ) : pageError ? (
            <div className="venue-availability-state venue-availability-error">
              <CircleAlert size={20} />
              <span>{pageError}</span>
            </div>
          ) : availabilities.length === 0 || totalSlots === 0 ? (
            <div className="venue-availability-empty">
              <div className="venue-availability-empty-icon">
                <Ban size={26} />
              </div>
              <h3>No availabilities assigned yet</h3>
              <p>You have not assigned any availabilities for this venue yet.</p>
            </div>
          ) : (
            <div className="venue-availability-grid">
              {availabilities.map((day) => (
                <div className="venue-availability-item" key={day.date}>
                  <div className="venue-availability-item-top-row">
                    <div className="venue-availability-item-row">
                      <CalendarDays size={16} />
                      <span>{formatDateForCard(day.date)}</span>
                    </div>
                    <div className="venue-availability-item-badge">
                      {day.slots.length} slot{day.slots.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="venue-availability-slots-list">
                    {day.slots.map((slot, slotIdx) => (
                      <div key={slotIdx} className="venue-availability-slot-row">
                        <div className="venue-availability-slot-main">
                          <div className="venue-availability-slot-time">
                            <Clock3 size={14} />
                            <span>
                              {formatTimeForCard(slot.startTime)} –{" "}
                              {formatTimeForCard(slot.endTime)}
                            </span>
                          </div>

                          <div className="venue-availability-slot-price">
                            <Wallet size={14} />
                            <span>{formatPrice(slot.price)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card venue-availability-list-card">
          <div className="venue-availability-section-header">
            <div className="venue-availability-header-left">
              <div className="venue-availability-header-icon venue-availability-header-icon-booked">
                <Lock size={19} />
              </div>
              <div>
                <h3 className="venue-availability-section-title">Booked Times</h3>
                <p className="venue-availability-section-subtitle">
                  Date and time slots that are already booked for your venue.
                </p>
              </div>
            </div>
          </div>

          {isBookedLoading ? (
            <div className="venue-availability-state">
              <LoaderCircle size={22} className="spin-icon" />
              <span>Loading booked times...</span>
            </div>
          ) : bookedError ? (
            <div className="venue-availability-state venue-availability-error">
              <CircleAlert size={20} />
              <span>{bookedError}</span>
            </div>
          ) : bookedTimes.length === 0 ? (
            <div className="venue-availability-empty">
              <div className="venue-availability-empty-icon venue-availability-empty-icon-booked">
                <Lock size={26} />
              </div>
              <h3>No booked times yet</h3>
              <p>There are currently no booked time slots for this venue.</p>
            </div>
          ) : (
            <div className="venue-availability-grid">
              {bookedTimes.map((item) => (
                <div
                  className="venue-availability-item venue-availability-item-booked"
                  key={item.id}
                >
                  <div className="venue-availability-item-top-row">
                    <div className="venue-availability-item-row">
                      <CalendarDays size={16} />
                      <span>{formatDateForCard(item.date)}</span>
                    </div>
                    <div className="venue-availability-item-badge venue-availability-item-badge-booked">
                      Booked
                    </div>
                  </div>

                  <div className="venue-availability-item-row venue-availability-item-time-row">
                    <Clock3 size={16} />
                    <span>
                      {formatTimeForCard(item.startTime)} –{" "}
                      {formatTimeForCard(item.endTime)}
                    </span>
                  </div>

                  <div className="venue-availability-item-row venue-availability-item-price-row">
                    <Wallet size={16} />
                    <span>{formatPrice(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card venue-availability-form-card">
          <div className="venue-availability-form-header">
            <div className="venue-availability-header-left">
              <div className="venue-availability-header-icon">
                <Plus size={18} />
              </div>
              <div>
                <h3 className="venue-availability-section-title">Create Availability</h3>
                <p className="venue-availability-section-subtitle">
                  Add a new available date, time slot, and price for your venue.
                </p>
              </div>
            </div>
          </div>

          <form className="venue-availability-form" onSubmit={handleCreateAvailability}>
            <div className="venue-availability-form-grid">
              <div className="venue-availability-field">
                <label htmlFor="date">Date</label>
                <div className="venue-availability-input-wrap">
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="venue-availability-time-range">
                <div className="venue-availability-field">
                  <label htmlFor="startTime">Start Time</label>
                  <div className="venue-availability-input-wrap">
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={form.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="venue-availability-time-separator">to</div>

                <div className="venue-availability-field">
                  <label htmlFor="endTime">End Time</label>
                  <div className="venue-availability-input-wrap">
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={form.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="venue-availability-field">
                <label htmlFor="price">Price</label>
                <div className="venue-availability-input-wrap">
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Enter slot price"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="venue-availability-actions">
              <button
                className="venue-availability-create-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="spin-icon" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Create</span>
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

export default VenueAvailablity;