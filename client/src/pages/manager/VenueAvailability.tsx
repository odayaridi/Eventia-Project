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
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";

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

//   const { open, message, severity, showAlert, handleClose } = useAlert();

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
//       const msg = "Manager ID was not found. Please log in again.";
//       setPageError(msg);
//       setIsLoading(false);
//       showAlert(msg, "error");
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
//       showAlert(message, "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadBookedTimes = async () => {
//     if (!managerId || Number.isNaN(managerId)) {
//       const msg = "Manager ID was not found. Please log in again.";
//       setBookedError(msg);
//       setIsBookedLoading(false);
//       showAlert(msg, "error");
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
//       showAlert(message, "error");
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
//       showAlert("Manager ID was not found. Please log in again.", "error");
//       return;
//     }

//     if (!form.date || !form.startTime || !form.endTime || !form.price) {
//       showAlert("Please fill in date, start time, end time, and price.", "error");
//       return;
//     }

//     if (form.endTime <= form.startTime) {
//       showAlert("End time must be later than start time.", "error");
//       return;
//     }

//     if (Number(form.price) <= 0) {
//       showAlert("Price must be greater than 0.", "error");
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       await createVenueAvailabiltyForManager({
//         managerId,
//         date: form.date,
//         startTime: form.startTime,
//         endTime: form.endTime,
//         price: Number(form.price),
//       });

//       resetForm();
//       await refreshAllLists();
//       showAlert("Venue availability created successfully.", "success");
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to create venue availability.";
//       showAlert(message, "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const totalSlots = availabilities.reduce((sum, day) => sum + day.slots.length, 0);

//   return (
//     <>
//       <div className="page-shell">
//         <div className="page-header">
//           <h2 className="page-title">Availability</h2>
//           <p className="page-subtitle">
//             Set your venue&apos;s available hours and prices for each time slot.
//           </p>
//         </div>

//         <div className="surface-card venue-availability-list-card">
//           <div className="venue-availability-section-header">
//             <div className="venue-availability-header-left">
//               <div className="venue-availability-header-icon">
//                 <CalendarClock size={19} />
//               </div>
//               <div>
//                 <h3 className="venue-availability-section-title">Assigned Availability</h3>
//                 <p className="venue-availability-section-subtitle">
//                   All available date, time slots, and prices for your venue.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {isLoading ? (
//             <div className="venue-availability-state">
//               <LoaderCircle size={22} className="spin-icon" />
//               <span>Loading availabilities...</span>
//             </div>
//           ) : pageError ? (
//             <div className="venue-availability-state venue-availability-error">
//               <CircleAlert size={20} />
//               <span>{pageError}</span>
//             </div>
//           ) : availabilities.length === 0 || totalSlots === 0 ? (
//             <div className="venue-availability-empty">
//               <div className="venue-availability-empty-icon">
//                 <Ban size={26} />
//               </div>
//               <h3>No availabilities assigned yet</h3>
//               <p>You have not assigned any availabilities for this venue yet.</p>
//             </div>
//           ) : (
//             <div className="venue-availability-grid">
//               {availabilities.map((day) => (
//                 <div className="venue-availability-item" key={day.date}>
//                   <div className="venue-availability-item-top-row">
//                     <div className="venue-availability-item-row">
//                       <CalendarDays size={16} />
//                       <span>{formatDateForCard(day.date)}</span>
//                     </div>
//                     <div className="venue-availability-item-badge">
//                       {day.slots.length} slot{day.slots.length !== 1 ? "s" : ""}
//                     </div>
//                   </div>

//                   <div className="venue-availability-slots-list">
//                     {day.slots.map((slot, slotIdx) => (
//                       <div key={slotIdx} className="venue-availability-slot-row">
//                         <div className="venue-availability-slot-main">
//                           <div className="venue-availability-slot-time">
//                             <Clock3 size={14} />
//                             <span>
//                               {formatTimeForCard(slot.startTime)} –{" "}
//                               {formatTimeForCard(slot.endTime)}
//                             </span>
//                           </div>

//                           <div className="venue-availability-slot-price">
//                             <Wallet size={14} />
//                             <span>{formatPrice(slot.price)}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="surface-card venue-availability-list-card">
//           <div className="venue-availability-section-header">
//             <div className="venue-availability-header-left">
//               <div className="venue-availability-header-icon venue-availability-header-icon-booked">
//                 <Lock size={19} />
//               </div>
//               <div>
//                 <h3 className="venue-availability-section-title">Booked Times</h3>
//                 <p className="venue-availability-section-subtitle">
//                   Date and time slots that are already booked for your venue.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {isBookedLoading ? (
//             <div className="venue-availability-state">
//               <LoaderCircle size={22} className="spin-icon" />
//               <span>Loading booked times...</span>
//             </div>
//           ) : bookedError ? (
//             <div className="venue-availability-state venue-availability-error">
//               <CircleAlert size={20} />
//               <span>{bookedError}</span>
//             </div>
//           ) : bookedTimes.length === 0 ? (
//             <div className="venue-availability-empty">
//               <div className="venue-availability-empty-icon venue-availability-empty-icon-booked">
//                 <Lock size={26} />
//               </div>
//               <h3>No booked times yet</h3>
//               <p>There are currently no booked time slots for this venue.</p>
//             </div>
//           ) : (
//             <div className="venue-availability-grid">
//               {bookedTimes.map((item) => (
//                 <div
//                   className="venue-availability-item venue-availability-item-booked"
//                   key={item.id}
//                 >
//                   <div className="venue-availability-item-top-row">
//                     <div className="venue-availability-item-row">
//                       <CalendarDays size={16} />
//                       <span>{formatDateForCard(item.date)}</span>
//                     </div>
//                     <div className="venue-availability-item-badge venue-availability-item-badge-booked">
//                       Booked
//                     </div>
//                   </div>

//                   <div className="venue-availability-item-row venue-availability-item-time-row">
//                     <Clock3 size={16} />
//                     <span>
//                       {formatTimeForCard(item.startTime)} –{" "}
//                       {formatTimeForCard(item.endTime)}
//                     </span>
//                   </div>

//                   <div className="venue-availability-item-row venue-availability-item-price-row">
//                     <Wallet size={16} />
//                     <span>{formatPrice(item.price)}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="surface-card venue-availability-form-card">
//           <div className="venue-availability-form-header">
//             <div className="venue-availability-header-left">
//               <div className="venue-availability-header-icon">
//                 <Plus size={18} />
//               </div>
//               <div>
//                 <h3 className="venue-availability-section-title">Create Availability</h3>
//                 <p className="venue-availability-section-subtitle">
//                   Add a new available date, time slot, and price for your venue.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <form className="venue-availability-form" onSubmit={handleCreateAvailability}>
//             <div className="venue-availability-form-grid">
//               <div className="venue-availability-field">
//                 <label htmlFor="date">Date</label>
//                 <div className="venue-availability-input-wrap">
//                   <input
//                     id="date"
//                     name="date"
//                     type="date"
//                     value={form.date}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="venue-availability-time-range">
//                 <div className="venue-availability-field">
//                   <label htmlFor="startTime">Start Time</label>
//                   <div className="venue-availability-input-wrap">
//                     <input
//                       id="startTime"
//                       name="startTime"
//                       type="time"
//                       value={form.startTime}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="venue-availability-time-separator">to</div>

//                 <div className="venue-availability-field">
//                   <label htmlFor="endTime">End Time</label>
//                   <div className="venue-availability-input-wrap">
//                     <input
//                       id="endTime"
//                       name="endTime"
//                       type="time"
//                       value={form.endTime}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="venue-availability-field">
//                 <label htmlFor="price">Price</label>
//                 <div className="venue-availability-input-wrap">
//                   <input
//                     id="price"
//                     name="price"
//                     type="number"
//                     min="0.01"
//                     step="0.01"
//                     value={form.price}
//                     onChange={handleChange}
//                     placeholder="Enter slot price"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="venue-availability-actions">
//               <button
//                 className="venue-availability-create-btn"
//                 type="submit"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <LoaderCircle size={18} className="spin-icon" />
//                     <span>Creating...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Plus size={18} />
//                     <span>Create</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       <AlertSnackbar
//         open={open}
//         message={message}
//         severity={severity}
//         onClose={handleClose}
//       />
//     </>
//   );
// };

// export default VenueAvailablity;



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
//   Pencil,
//   Trash2,
//   X,
//   Save,
// } from "lucide-react";
// import "./VenueAvailability.css";
// import {
//   createVenueAvailabiltyForManager,
//   deleteVenueAvailability,
//   fetchVenueBookedTimes,
//   getALLVenueAvailabilities,
//   updateVenueAvailability,
//   type VenueAvailabilityDay,
//   type VenueAvailabilityItem,
//   type VenueAvailabilitySlot,
// } from "../../api/venueApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";

// type AvailabilityFormState = {
//   date: string;
//   startTime: string;
//   endTime: string;
//   price: string;
// };

// type EditableAvailabilitySlot = VenueAvailabilitySlot & {
//   date: string;
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

//   const [editForm, setEditForm] = useState<AvailabilityFormState>(initialFormState);
//   const [editingSlot, setEditingSlot] = useState<EditableAvailabilitySlot | null>(null);
//   const [deleteTargetSlot, setDeleteTargetSlot] =
//     useState<EditableAvailabilitySlot | null>(null);

//   const [isLoading, setIsLoading] = useState(true);
//   const [isBookedLoading, setIsBookedLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const [pageError, setPageError] = useState("");
//   const [bookedError, setBookedError] = useState("");

//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const managerId = useMemo(() => {
//     const raw = localStorage.getItem("managerId");
//     return raw ? Number(raw) : null;
//   }, []);

//   useEffect(() => {
//     const hasOpenModal = !!editingSlot || !!deleteTargetSlot;
//     if (hasOpenModal) {
//       document.body.classList.add("modal-open");
//     } else {
//       document.body.classList.remove("modal-open");
//     }
//     return () => {
//       document.body.classList.remove("modal-open");
//     };
//   }, [editingSlot, deleteTargetSlot]);

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
//       const msg = "Manager ID was not found. Please log in again.";
//       setPageError(msg);
//       setIsLoading(false);
//       showAlert(msg, "error");
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
//       showAlert(message, "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadBookedTimes = async () => {
//     if (!managerId || Number.isNaN(managerId)) {
//       const msg = "Manager ID was not found. Please log in again.";
//       setBookedError(msg);
//       setIsBookedLoading(false);
//       showAlert(msg, "error");
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
//       showAlert(message, "error");
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

//   const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const resetForm = () => {
//     setForm(initialFormState);
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

//   const openEditModal = (dayDate: string, slot: VenueAvailabilitySlot) => {
//     setEditingSlot({ ...slot, date: dayDate });
//     setEditForm({
//       date: dayDate,
//       startTime: slot.startTime?.slice(0, 5) || "",
//       endTime: slot.endTime?.slice(0, 5) || "",
//       price: String(slot.price),
//     });
//   };

//   const openDeleteModal = (dayDate: string, slot: VenueAvailabilitySlot) => {
//     setDeleteTargetSlot({ ...slot, date: dayDate });
//   };

//   const handleCreateAvailability = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!managerId || Number.isNaN(managerId)) {
//       showAlert("Manager ID was not found. Please log in again.", "error");
//       return;
//     }
//     if (!form.date || !form.startTime || !form.endTime || !form.price) {
//       showAlert("Please fill in date, start time, end time, and price.", "error");
//       return;
//     }
//     if (form.endTime <= form.startTime) {
//       showAlert("End time must be later than start time.", "error");
//       return;
//     }
//     if (Number(form.price) <= 0) {
//       showAlert("Price must be greater than 0.", "error");
//       return;
//     }
//     try {
//       setIsSubmitting(true);
//       await createVenueAvailabiltyForManager({
//         managerId,
//         date: form.date,
//         startTime: form.startTime,
//         endTime: form.endTime,
//         price: Number(form.price),
//       });
//       resetForm();
//       await refreshAllLists();
//       showAlert("Venue availability created successfully.", "success");
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to create venue availability.";
//       showAlert(message, "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleUpdateAvailability = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!managerId || Number.isNaN(managerId)) {
//       showAlert("Manager ID was not found. Please log in again.", "error");
//       return;
//     }
//     if (!editingSlot) return;
//     if (!editForm.date || !editForm.startTime || !editForm.endTime || !editForm.price) {
//       showAlert("Please fill in date, start time, end time, and price.", "error");
//       return;
//     }
//     if (editForm.endTime <= editForm.startTime) {
//       showAlert("End time must be later than start time.", "error");
//       return;
//     }
//     if (Number(editForm.price) <= 0) {
//       showAlert("Price must be greater than 0.", "error");
//       return;
//     }
//     try {
//       setIsUpdating(true);
//       await updateVenueAvailability({
//         venueAvailabilityId: editingSlot.id,
//         managerId,
//         date: editForm.date,
//         startTime: editForm.startTime,
//         endTime: editForm.endTime,
//         price: Number(editForm.price),
//       });
//       setEditingSlot(null);
//       setEditForm(initialFormState);
//       await refreshAllLists();
//       showAlert("Venue availability updated successfully.", "success");
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to update venue availability.";
//       showAlert(message, "error");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleDeleteAvailability = async () => {
//     if (!managerId || Number.isNaN(managerId)) {
//       showAlert("Manager ID was not found. Please log in again.", "error");
//       return;
//     }
//     if (!deleteTargetSlot) return;
//     try {
//       setIsDeleting(true);
//       await deleteVenueAvailability({
//         venueAvailabilityId: deleteTargetSlot.id,
//         managerId,
//       });
//       setDeleteTargetSlot(null);
//       await refreshAllLists();
//       showAlert("Venue availability deleted successfully.", "success");
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to delete venue availability.";
//       showAlert(message, "error");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const totalSlots = availabilities.reduce((sum, day) => sum + day.slots.length, 0);

//   return (
//     <>
//       <div className="page-shell">
//         <div className="page-header">
//           <h2 className="page-title">Availability</h2>
//           <p className="page-subtitle">
//             Set your venue&apos;s available hours and prices for each time slot.
//           </p>
//         </div>

//         <div className="surface-card venue-availability-list-card">
//           <div className="venue-availability-section-header">
//             <div className="venue-availability-header-left">
//               <div className="venue-availability-header-icon">
//                 <CalendarClock size={19} />
//               </div>
//               <div>
//                 <h3 className="venue-availability-section-title">Assigned Availability</h3>
//                 <p className="venue-availability-section-subtitle">
//                   All available date, time slots, and prices for your venue.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {isLoading ? (
//             <div className="venue-availability-state">
//               <LoaderCircle size={22} className="spin-icon" />
//               <span>Loading availabilities...</span>
//             </div>
//           ) : pageError ? (
//             <div className="venue-availability-state venue-availability-error">
//               <CircleAlert size={20} />
//               <span>{pageError}</span>
//             </div>
//           ) : availabilities.length === 0 || totalSlots === 0 ? (
//             <div className="venue-availability-empty">
//               <div className="venue-availability-empty-icon">
//                 <Ban size={26} />
//               </div>
//               <h3>No availabilities assigned yet</h3>
//               <p>You have not assigned any availabilities for this venue yet.</p>
//             </div>
//           ) : (
//             <div className="venue-availability-grid">
//               {availabilities.map((day) => (
//                 <div className="venue-availability-item" key={day.date}>
//                   <div className="venue-availability-item-top-row">
//                     <div className="venue-availability-item-row">
//                       <CalendarDays size={16} />
//                       <span>{formatDateForCard(day.date)}</span>
//                     </div>
//                     <div className="venue-availability-item-badge">
//                       {day.slots.length} slot{day.slots.length !== 1 ? "s" : ""}
//                     </div>
//                   </div>

//                   <div className="venue-availability-slots-list">
//                     {day.slots.map((slot) => (
//                       <div key={slot.id} className="venue-availability-slot-row">
//                         <div className="venue-availability-slot-actions-bar">
//                           <button
//                             type="button"
//                             className="venue-availability-slot-action venue-availability-slot-edit"
//                             onClick={() => openEditModal(day.date, slot)}
//                             title="Update availability"
//                           >
//                             <Pencil size={14} />
//                           </button>

//                           <button
//                             type="button"
//                             className="venue-availability-slot-action venue-availability-slot-delete"
//                             onClick={() => openDeleteModal(day.date, slot)}
//                             title="Delete availability"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>

//                         <div className="venue-availability-slot-main">
//                           <div className="venue-availability-slot-time">
//                             <Clock3 size={14} />
//                             <span>
//                               {formatTimeForCard(slot.startTime)} –{" "}
//                               {formatTimeForCard(slot.endTime)}
//                             </span>
//                           </div>

//                           <div className="venue-availability-slot-price">
//                             <Wallet size={14} />
//                             <span>{formatPrice(slot.price)}</span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="surface-card venue-availability-list-card">
//           <div className="venue-availability-section-header">
//             <div className="venue-availability-header-left">
//               <div className="venue-availability-header-icon venue-availability-header-icon-booked">
//                 <Lock size={19} />
//               </div>
//               <div>
//                 <h3 className="venue-availability-section-title">Booked Times</h3>
//                 <p className="venue-availability-section-subtitle">
//                   Date and time slots that are already booked for your venue.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {isBookedLoading ? (
//             <div className="venue-availability-state">
//               <LoaderCircle size={22} className="spin-icon" />
//               <span>Loading booked times...</span>
//             </div>
//           ) : bookedError ? (
//             <div className="venue-availability-state venue-availability-error">
//               <CircleAlert size={20} />
//               <span>{bookedError}</span>
//             </div>
//           ) : bookedTimes.length === 0 ? (
//             <div className="venue-availability-empty">
//               <div className="venue-availability-empty-icon venue-availability-empty-icon-booked">
//                 <Lock size={26} />
//               </div>
//               <h3>No booked times yet</h3>
//               <p>There are currently no booked time slots for this venue.</p>
//             </div>
//           ) : (
//             <div className="venue-availability-grid">
//               {bookedTimes.map((item) => (
//                 <div
//                   className="venue-availability-item venue-availability-item-booked"
//                   key={item.id}
//                 >
//                   <div className="venue-availability-item-top-row">
//                     <div className="venue-availability-item-row">
//                       <CalendarDays size={16} />
//                       <span>{formatDateForCard(item.date)}</span>
//                     </div>
//                     <div className="venue-availability-item-badge venue-availability-item-badge-booked">
//                       Booked
//                     </div>
//                   </div>

//                   <div className="venue-availability-item-row venue-availability-item-time-row">
//                     <Clock3 size={16} />
//                     <span>
//                       {formatTimeForCard(item.startTime)} –{" "}
//                       {formatTimeForCard(item.endTime)}
//                     </span>
//                   </div>

//                   <div className="venue-availability-item-row venue-availability-item-price-row">
//                     <Wallet size={16} />
//                     <span>{formatPrice(item.price)}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="surface-card venue-availability-form-card">
//           <div className="venue-availability-form-header">
//             <div className="venue-availability-header-left">
//               <div className="venue-availability-header-icon">
//                 <Plus size={18} />
//               </div>
//               <div>
//                 <h3 className="venue-availability-section-title">Create Availability</h3>
//                 <p className="venue-availability-section-subtitle">
//                   Add a new available date, time slot, and price for your venue.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <form className="venue-availability-form" onSubmit={handleCreateAvailability}>
//             <div className="venue-availability-form-grid">
//               <div className="venue-availability-field">
//                 <label htmlFor="date">Date</label>
//                 <div className="venue-availability-input-wrap">
//                   <input
//                     id="date"
//                     name="date"
//                     type="date"
//                     value={form.date}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="venue-availability-time-range">
//                 <div className="venue-availability-field">
//                   <label htmlFor="startTime">Start Time</label>
//                   <div className="venue-availability-input-wrap">
//                     <input
//                       id="startTime"
//                       name="startTime"
//                       type="time"
//                       value={form.startTime}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="venue-availability-time-separator">to</div>
//                 <div className="venue-availability-field">
//                   <label htmlFor="endTime">End Time</label>
//                   <div className="venue-availability-input-wrap">
//                     <input
//                       id="endTime"
//                       name="endTime"
//                       type="time"
//                       value={form.endTime}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="venue-availability-field">
//                 <label htmlFor="price">Price</label>
//                 <div className="venue-availability-input-wrap">
//                   <input
//                     id="price"
//                     name="price"
//                     type="number"
//                     min="0.01"
//                     step="0.01"
//                     value={form.price}
//                     onChange={handleChange}
//                     placeholder="Enter slot price"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="venue-availability-actions">
//               <button
//                 className="venue-availability-create-btn"
//                 type="submit"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <LoaderCircle size={18} className="spin-icon" />
//                     <span>Creating...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Plus size={18} />
//                     <span>Create</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {editingSlot && (
//         <div className="venue-availability-modal-backdrop" role="dialog" aria-modal="true">
//           <div className="venue-availability-modal">
//             <div className="venue-availability-modal-header">
//               <div>
//                 <h3>Update Availability</h3>
//                 <p>Edit the selected available slot.</p>
//               </div>
//               <button
//                 type="button"
//                 className="venue-availability-modal-close"
//                 onClick={() => setEditingSlot(null)}
//                 disabled={isUpdating}
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <form className="venue-availability-modal-form" onSubmit={handleUpdateAvailability}>
//               <div className="venue-availability-field">
//                 <label htmlFor="editDate">Date</label>
//                 <div className="venue-availability-input-wrap">
//                   <input
//                     id="editDate"
//                     name="date"
//                     type="date"
//                     value={editForm.date}
//                     onChange={handleEditChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="venue-availability-time-range">
//                 <div className="venue-availability-field">
//                   <label htmlFor="editStartTime">Start Time</label>
//                   <div className="venue-availability-input-wrap">
//                     <input
//                       id="editStartTime"
//                       name="startTime"
//                       type="time"
//                       value={editForm.startTime}
//                       onChange={handleEditChange}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="venue-availability-time-separator">to</div>
//                 <div className="venue-availability-field">
//                   <label htmlFor="editEndTime">End Time</label>
//                   <div className="venue-availability-input-wrap">
//                     <input
//                       id="editEndTime"
//                       name="endTime"
//                       type="time"
//                       value={editForm.endTime}
//                       onChange={handleEditChange}
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="venue-availability-field">
//                 <label htmlFor="editPrice">Price</label>
//                 <div className="venue-availability-input-wrap">
//                   <input
//                     id="editPrice"
//                     name="price"
//                     type="number"
//                     min="0.01"
//                     step="0.01"
//                     value={editForm.price}
//                     onChange={handleEditChange}
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="venue-availability-modal-actions">
//                 <button
//                   type="button"
//                   className="venue-availability-modal-cancel"
//                   onClick={() => setEditingSlot(null)}
//                   disabled={isUpdating}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="venue-availability-modal-save"
//                   disabled={isUpdating}
//                 >
//                   {isUpdating ? (
//                     <>
//                       <LoaderCircle size={17} className="spin-icon" />
//                       Updating...
//                     </>
//                   ) : (
//                     <>
//                       <Save size={17} />
//                       Update
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {deleteTargetSlot && (
//         <div className="venue-availability-modal-backdrop" role="dialog" aria-modal="true">
//           <div className="venue-availability-modal venue-availability-delete-modal">
//             <div className="venue-availability-modal-header">
//               <div>
//                 <h3>Delete Availability?</h3>
//                 <p>This action cannot be undone.</p>
//               </div>
//               <button
//                 type="button"
//                 className="venue-availability-modal-close"
//                 onClick={() => setDeleteTargetSlot(null)}
//                 disabled={isDeleting}
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="venue-availability-delete-summary">
//               <div>
//                 <strong>{formatDateForCard(deleteTargetSlot.date)}</strong>
//               </div>
//               <div>
//                 {formatTimeForCard(deleteTargetSlot.startTime)} –{" "}
//                 {formatTimeForCard(deleteTargetSlot.endTime)}
//               </div>
//               <div>{formatPrice(deleteTargetSlot.price)}</div>
//             </div>

//             <div className="venue-availability-modal-actions">
//               <button
//                 type="button"
//                 className="venue-availability-modal-cancel"
//                 onClick={() => setDeleteTargetSlot(null)}
//                 disabled={isDeleting}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 className="venue-availability-modal-delete"
//                 onClick={handleDeleteAvailability}
//                 disabled={isDeleting}
//               >
//                 {isDeleting ? (
//                   <>
//                     <LoaderCircle size={17} className="spin-icon" />
//                     Deleting...
//                   </>
//                 ) : (
//                   <>
//                     <Trash2 size={17} />
//                     Delete
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
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
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import "./VenueAvailability.css";
import {
  createVenueAvailabiltyForManager,
  deleteVenueAvailability,
  fetchVenueBookedTimes,
  getALLVenueAvailabilities,
  updateVenueAvailability,
  type VenueAvailabilityDay,
  type VenueAvailabilityItem,
  type VenueAvailabilitySlot,
} from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

type AvailabilityFormState = {
  date: string;
  startTime: string;
  endTime: string;
  price: string;
};

type EditableAvailabilitySlot = VenueAvailabilitySlot & {
  date: string;
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

  const [editForm, setEditForm] = useState<AvailabilityFormState>(initialFormState);
  const [editingSlot, setEditingSlot] = useState<EditableAvailabilitySlot | null>(null);
  const [deleteTargetSlot, setDeleteTargetSlot] =
    useState<EditableAvailabilitySlot | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isBookedLoading, setIsBookedLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [bookedError, setBookedError] = useState("");

  const { open, message, severity, showAlert, handleClose } = useAlert();

  const managerId = useMemo(() => {
    const raw = localStorage.getItem("managerId");
    return raw ? Number(raw) : null;
  }, []);

  useEffect(() => {
    const hasOpenModal = !!editingSlot || !!deleteTargetSlot;
    if (hasOpenModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [editingSlot, deleteTargetSlot]);

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
      const msg =
        error instanceof Error ? error.message : "Failed to load venue availabilities.";
      setPageError(msg);
      showAlert(msg, "error");
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
      const msg =
        error instanceof Error ? error.message : "Failed to load booked times.";
      setBookedError(msg);
      showAlert(msg, "error");
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(initialFormState);

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

  const openEditModal = (dayDate: string, slot: VenueAvailabilitySlot) => {
    setEditingSlot({ ...slot, date: dayDate });
    setEditForm({
      date: dayDate,
      startTime: slot.startTime?.slice(0, 5) || "",
      endTime: slot.endTime?.slice(0, 5) || "",
      price: String(slot.price),
    });
  };

  const openDeleteModal = (dayDate: string, slot: VenueAvailabilitySlot) => {
    setDeleteTargetSlot({ ...slot, date: dayDate });
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
      const msg =
        error instanceof Error ? error.message : "Failed to create venue availability.";
      showAlert(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      return;
    }
    if (!editingSlot) return;
    if (!editForm.date || !editForm.startTime || !editForm.endTime || !editForm.price) {
      showAlert("Please fill in date, start time, end time, and price.", "error");
      return;
    }
    if (editForm.endTime <= editForm.startTime) {
      showAlert("End time must be later than start time.", "error");
      return;
    }
    if (Number(editForm.price) <= 0) {
      showAlert("Price must be greater than 0.", "error");
      return;
    }
    try {
      setIsUpdating(true);
      await updateVenueAvailability({
        venueAvailabilityId: editingSlot.id,
        managerId,
        date: editForm.date,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        price: Number(editForm.price),
      });
      setEditingSlot(null);
      setEditForm(initialFormState);
      await refreshAllLists();
      showAlert("Venue availability updated successfully.", "success");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to update venue availability.";
      showAlert(msg, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAvailability = async () => {
    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      return;
    }
    if (!deleteTargetSlot) return;
    try {
      setIsDeleting(true);
      await deleteVenueAvailability({
        venueAvailabilityId: deleteTargetSlot.id,
        managerId,
      });
      setDeleteTargetSlot(null);
      await refreshAllLists();
      showAlert("Venue availability deleted successfully.", "success");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to delete venue availability.";
      showAlert(msg, "error");
    } finally {
      setIsDeleting(false);
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

        {/* ── Assigned Availability ── */}
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
                    {day.slots.map((slot) => (
                      <div key={slot.id} className="venue-availability-slot-row">
                        <div className="venue-availability-slot-actions-bar">
                          <button
                            type="button"
                            className="venue-availability-slot-action venue-availability-slot-edit"
                            onClick={() => openEditModal(day.date, slot)}
                            title="Update availability"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="venue-availability-slot-action venue-availability-slot-delete"
                            onClick={() => openDeleteModal(day.date, slot)}
                            title="Delete availability"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

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

        {/* ── Booked Times ── */}
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

        {/* ── Create Availability ── */}
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

      {/* ── Edit Modal ── */}
      {editingSlot && (
        <div
          className="venue-availability-modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="venue-availability-modal">
            <div className="venue-availability-modal-header">
              <div>
                <h3>Update Availability</h3>
                <p>Edit the selected available slot.</p>
              </div>
              <button
                type="button"
                className="venue-availability-modal-close"
                onClick={() => setEditingSlot(null)}
                disabled={isUpdating}
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="venue-availability-modal-form"
              onSubmit={handleUpdateAvailability}
            >
              <div className="venue-availability-field">
                <label htmlFor="editDate">Date</label>
                <div className="venue-availability-input-wrap">
                  <input
                    id="editDate"
                    name="date"
                    type="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="venue-availability-time-range">
                <div className="venue-availability-field">
                  <label htmlFor="editStartTime">Start Time</label>
                  <div className="venue-availability-input-wrap">
                    <input
                      id="editStartTime"
                      name="startTime"
                      type="time"
                      value={editForm.startTime}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
                <div className="venue-availability-time-separator">to</div>
                <div className="venue-availability-field">
                  <label htmlFor="editEndTime">End Time</label>
                  <div className="venue-availability-input-wrap">
                    <input
                      id="editEndTime"
                      name="endTime"
                      type="time"
                      value={editForm.endTime}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="venue-availability-field">
                <label htmlFor="editPrice">Price</label>
                <div className="venue-availability-input-wrap">
                  <input
                    id="editPrice"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="venue-availability-modal-actions">
                <button
                  type="button"
                  className="venue-availability-modal-cancel"
                  onClick={() => setEditingSlot(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="venue-availability-modal-save"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <LoaderCircle size={17} className="spin-icon" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteTargetSlot && (
        <div
          className="venue-availability-modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="venue-availability-modal venue-availability-delete-modal">
            <div className="venue-availability-modal-header">
              <div>
                <h3>Delete Availability?</h3>
                <p>This action cannot be undone.</p>
              </div>
              <button
                type="button"
                className="venue-availability-modal-close"
                onClick={() => setDeleteTargetSlot(null)}
                disabled={isDeleting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="venue-availability-delete-summary">
              <div>
                <strong>{formatDateForCard(deleteTargetSlot.date)}</strong>
              </div>
              <div>
                {formatTimeForCard(deleteTargetSlot.startTime)} –{" "}
                {formatTimeForCard(deleteTargetSlot.endTime)}
              </div>
              <div>{formatPrice(deleteTargetSlot.price)}</div>
            </div>

            <div className="venue-availability-modal-actions">
              <button
                type="button"
                className="venue-availability-modal-cancel"
                onClick={() => setDeleteTargetSlot(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="venue-availability-modal-delete"
                onClick={handleDeleteAvailability}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <LoaderCircle size={17} className="spin-icon" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AlertSnackbar rendered last so it sits above modals */}
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