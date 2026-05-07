import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin,
  Users,
  Link as LinkIcon,
  Building2,
  Plus,
  Pencil,
  CalendarDays,
  X,
  LoaderCircle,
  ImagePlus,
  Images,
  Trash2,
} from "lucide-react";
import "./MyVenue.css";
import {
  createVenueForManager,
  managerVenueExists,
  retrieveVenueInfo,
  updateVenueInfo,
  type VenueInfo,
} from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

type FormState = {
  name: string;
  location: string;
  locationLink: string;
  capacity: string;
  facilities: string;
};

const initialFormState: FormState = {
  name: "",
  location: "",
  locationLink: "",
  capacity: "",
  facilities: "",
};

const MAX_IMAGES = 5;

const MyVenue: React.FC = () => {
  const [venueExists, setVenueExists] = useState<boolean | null>(null);
  const [venueInfo, setVenueInfo] = useState<VenueInfo | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>(initialFormState);
  const [editForm, setEditForm] = useState<FormState>(initialFormState);

  // --- Image states ---
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [createImagePreviews, setCreateImagePreviews] = useState<string[]>([]);

  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  // existing images from server (shown when no new images selected)
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // --- Alert snackbar ---
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const managerId = useMemo(() => {
    const raw = localStorage.getItem("managerId");
    return raw ? Number(raw) : null;
  }, []);

  const loadVenueState = async () => {
    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      setIsPageLoading(false);
      return;
    }

    try {
      setIsPageLoading(true);

      const exists = await managerVenueExists(managerId);
      setVenueExists(exists);

      if (exists) {
        const info = await retrieveVenueInfo(managerId);
        setVenueInfo(info);
      } else {
        setVenueInfo(null);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load venue information.";
      showAlert(msg, "error");
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    loadVenueState();
  }, []);

  useEffect(() => {
    const hasOpenModal = isCreateModalOpen || isEditModalOpen;
    if (hasOpenModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isCreateModalOpen, isEditModalOpen]);

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      createImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      editImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Create image handlers ---
  const handleCreateImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - createImages.length;
    const toAdd = files.slice(0, remaining);

    const previews = toAdd.map((f) => URL.createObjectURL(f));
    setCreateImages((prev) => [...prev, ...toAdd]);
    setCreateImagePreviews((prev) => [...prev, ...previews]);

    // Reset input so same file can be re-selected if removed
    if (createFileInputRef.current) createFileInputRef.current.value = "";
  };

  const removeCreateImage = (index: number) => {
    URL.revokeObjectURL(createImagePreviews[index]);
    setCreateImages((prev) => prev.filter((_, i) => i !== index));
    setCreateImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Edit image handlers ---
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - editImages.length;
    const toAdd = files.slice(0, remaining);

    const previews = toAdd.map((f) => URL.createObjectURL(f));
    setEditImages((prev) => [...prev, ...toAdd]);
    setEditImagePreviews((prev) => [...prev, ...previews]);

    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const removeEditImage = (index: number) => {
    URL.revokeObjectURL(editImagePreviews[index]);
    setEditImages((prev) => prev.filter((_, i) => i !== index));
    setEditImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm(initialFormState);
    createImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setCreateImages([]);
    setCreateImagePreviews([]);
  };

  const resetEditForm = () => {
    setEditForm(initialFormState);
    editImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setEditImages([]);
    setEditImagePreviews([]);
    setExistingImages([]);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isSubmitting) return;
    setIsCreateModalOpen(false);
    resetForm();
  };

  const openEditModal = () => {
    if (!venueInfo) return;

    setEditForm({
      name: venueInfo.name,
      location: venueInfo.location,
      locationLink: venueInfo.locationLink,
      capacity: String(venueInfo.capacity),
      facilities: venueInfo.facilities,
    });

    setExistingImages(venueInfo.images || []);
    setEditImages([]);
    setEditImagePreviews([]);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (isSubmitting) return;
    setIsEditModalOpen(false);
    resetEditForm();
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      return;
    }

    if (createImages.length === 0) {
      showAlert("Please upload at least 1 image.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      await createVenueForManager(
        {
          name: form.name.trim(),
          location: form.location.trim(),
          locationLink: form.locationLink.trim(),
          capacity: Number(form.capacity),
          facilities: form.facilities.trim(),
          managerId,
        },
        createImages
      );

      setIsCreateModalOpen(false);
      resetForm();
      showAlert("Venue created successfully.", "success");
      await loadVenueState();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to create venue.";
      showAlert(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVenue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      return;
    }

    if (!venueInfo?.id) {
      showAlert("Venue ID was not found.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      await updateVenueInfo(
        {
          id: venueInfo.id,
          name: editForm.name.trim(),
          location: editForm.location.trim(),
          locationLink: editForm.locationLink.trim(),
          capacity: Number(editForm.capacity),
          facilities: editForm.facilities.trim(),
          managerId,
        },
        editImages.length > 0 ? editImages : undefined
      );

      setIsEditModalOpen(false);
      resetEditForm();
      showAlert("Venue updated successfully.", "success");
      await loadVenueState();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to update venue.";
      showAlert(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <h2 className="page-title">My Venue</h2>
          <p className="page-subtitle">
            Manage your venue information and availability details.
          </p>
        </div>

        <div className="surface-card myvenue-state-card">
          <div className="myvenue-loading">
            <LoaderCircle size={22} className="spin-icon" />
            <span>Loading venue information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />

      <div className="page-shell">
        <div className="page-header myvenue-header-row">
          <div>
            <h2 className="page-title">My Venue</h2>
            <p className="page-subtitle">
              View and manage your venue profile information.
            </p>
          </div>

          {venueExists ? (
            <button
              className="myvenue-primary-btn"
              type="button"
              onClick={openEditModal}
            >
              <Pencil size={17} />
              <span>Edit Venue</span>
            </button>
          ) : (
          <></>
          )}
        </div>

        {venueExists && venueInfo ? (
          <div className="surface-card myvenue-card">
            <div className="myvenue-card-top">
              <div className="myvenue-title-wrap">
                <div className="myvenue-title-icon">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="myvenue-card-title">{venueInfo.name}</h3>
                  <p className="myvenue-card-subtitle">Registered venue information</p>
                </div>
              </div>
            </div>

            {/* Images gallery */}
            {venueInfo.images && venueInfo.images.length > 0 && (
              <div className="myvenue-gallery">
                {venueInfo.images.map((src, i) => (
                  <div key={i} className="myvenue-gallery-item">
                    <img src={src} alt={`Venue image ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}

            <div className="myvenue-info-grid">
              <div className="myvenue-info-item">
                <div className="myvenue-info-label">
                  <MapPin size={16} />
                  <span>Location</span>
                </div>
                <p className="myvenue-info-value">{venueInfo.location}</p>
              </div>

              <div className="myvenue-info-item">
                <div className="myvenue-info-label">
                  <Users size={16} />
                  <span>Capacity</span>
                </div>
                <p className="myvenue-info-value">{venueInfo.capacity} attendees</p>
              </div>

              <div className="myvenue-info-item myvenue-info-item-full">
                <div className="myvenue-info-label">
                  <LinkIcon size={16} />
                  <span>Location Link</span>
                </div>
                <a
                  href={venueInfo.locationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="myvenue-link"
                >
                  {venueInfo.locationLink}
                </a>
              </div>

              <div className="myvenue-info-item myvenue-info-item-full">
                <div className="myvenue-info-label">
                  <Building2 size={16} />
                  <span>Facilities</span>
                </div>
                <p className="myvenue-info-value">{venueInfo.facilities}</p>
              </div>

              <div className="myvenue-info-item">
                <div className="myvenue-info-label">
                  <CalendarDays size={16} />
                  <span>Created At</span>
                </div>
                <p className="myvenue-info-value">{venueInfo.createdAt}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="surface-card myvenue-empty-card">
            <div className="myvenue-empty-icon">
              <Building2 size={28} />
            </div>

            <h3>No venue created yet</h3>
            <p>
              You do not currently have a venue profile. Create your venue now to start
              managing availability and booking requests.
            </p>

            <button className="myvenue-primary-btn" type="button" onClick={openCreateModal}>
              <Plus size={18} />
              <span>Create Venue</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================
          CREATE MODAL
      ============================ */}
      {isCreateModalOpen && (
        <div className="myvenue-modal-overlay" onClick={closeCreateModal}>
          <div className="myvenue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="myvenue-modal-header">
              <div>
                <h3>Create Venue</h3>
                <p>Fill in the venue details to create your venue profile.</p>
              </div>

              <button
                type="button"
                className="myvenue-close-btn"
                onClick={closeCreateModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="myvenue-form" onSubmit={handleCreateVenue}>
              <div className="myvenue-form-grid">
                <div className="myvenue-field">
                  <label htmlFor="name">Venue Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter venue name"
                    required
                  />
                </div>

                <div className="myvenue-field">
                  <label htmlFor="capacity">Capacity</label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="Enter venue capacity"
                    required
                  />
                </div>

                <div className="myvenue-field myvenue-field-full">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Enter venue location"
                    required
                  />
                </div>

                <div className="myvenue-field myvenue-field-full">
                  <label htmlFor="locationLink">Location Link</label>
                  <input
                    id="locationLink"
                    name="locationLink"
                    type="text"
                    value={form.locationLink}
                    onChange={handleChange}
                    placeholder="Paste Google Maps link"
                    required
                  />
                </div>

                <div className="myvenue-field myvenue-field-full">
                  <label htmlFor="facilities">Facilities</label>
                  <textarea
                    id="facilities"
                    name="facilities"
                    rows={4}
                    value={form.facilities}
                    onChange={handleChange}
                    placeholder="Example: Stage, Sound System, Lighting, WiFi"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="myvenue-field myvenue-field-full">
                  <label>
                    Venue Images
                    <span className="myvenue-img-count">
                      {createImages.length}/{MAX_IMAGES}
                    </span>
                  </label>

                  <input
                    ref={createFileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="myvenue-hidden-input"
                    onChange={handleCreateImageSelect}
                  />

                  {createImagePreviews.length > 0 && (
                    <div className="myvenue-img-preview-grid">
                      {createImagePreviews.map((src, i) => (
                        <div key={i} className="myvenue-img-thumb">
                          <img src={src} alt={`Preview ${i + 1}`} />
                          <button
                            type="button"
                            className="myvenue-img-remove"
                            onClick={() => removeCreateImage(i)}
                            aria-label="Remove image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}

                      {createImages.length < MAX_IMAGES && (
                        <button
                          type="button"
                          className="myvenue-img-add-more"
                          onClick={() => createFileInputRef.current?.click()}
                        >
                          <Plus size={20} />
                          <span>Add more</span>
                        </button>
                      )}
                    </div>
                  )}

                  {createImagePreviews.length === 0 && (
                    <button
                      type="button"
                      className="myvenue-upload-zone"
                      onClick={() => createFileInputRef.current?.click()}
                    >
                      <ImagePlus size={24} />
                      <span className="myvenue-upload-title">Click to upload images</span>
                      <span className="myvenue-upload-hint">
                        JPEG, PNG, WebP — up to 5 images, 5MB each
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="myvenue-modal-actions">
                <button
                  type="button"
                  className="myvenue-cancel-btn"
                  onClick={closeCreateModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  className="myvenue-primary-btn"
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
      )}

      {/* ============================
          EDIT MODAL
      ============================ */}
      {isEditModalOpen && (
        <div className="myvenue-modal-overlay" onClick={closeEditModal}>
          <div className="myvenue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="myvenue-modal-header">
              <div>
                <h3>Edit Venue</h3>
                <p>Update your venue details.</p>
              </div>

              <button
                type="button"
                className="myvenue-close-btn"
                onClick={closeEditModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="myvenue-form" onSubmit={handleUpdateVenue}>
              <div className="myvenue-form-grid">
                <div className="myvenue-field">
                  <label htmlFor="edit-name">Venue Name</label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="Enter venue name"
                    required
                  />
                </div>

                <div className="myvenue-field">
                  <label htmlFor="edit-capacity">Capacity</label>
                  <input
                    id="edit-capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    value={editForm.capacity}
                    onChange={handleEditChange}
                    placeholder="Enter venue capacity"
                    required
                  />
                </div>

                <div className="myvenue-field myvenue-field-full">
                  <label htmlFor="edit-location">Location</label>
                  <input
                    id="edit-location"
                    name="location"
                    type="text"
                    value={editForm.location}
                    onChange={handleEditChange}
                    placeholder="Enter venue location"
                    required
                  />
                </div>

                <div className="myvenue-field myvenue-field-full">
                  <label htmlFor="edit-locationLink">Location Link</label>
                  <input
                    id="edit-locationLink"
                    name="locationLink"
                    type="text"
                    value={editForm.locationLink}
                    onChange={handleEditChange}
                    placeholder="Paste Google Maps link"
                    required
                  />
                </div>

                <div className="myvenue-field myvenue-field-full">
                  <label htmlFor="edit-facilities">Facilities</label>
                  <textarea
                    id="edit-facilities"
                    name="facilities"
                    rows={4}
                    value={editForm.facilities}
                    onChange={handleEditChange}
                    placeholder="Example: Stage, Sound System, Lighting, WiFi"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="myvenue-field myvenue-field-full">
                  <label>
                    Venue Images
                    <span className="myvenue-img-count">
                      {editImages.length > 0
                        ? `${editImages.length}/${MAX_IMAGES} new`
                        : `${existingImages.length} current`}
                    </span>
                  </label>

                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="myvenue-hidden-input"
                    onChange={handleEditImageSelect}
                  />

                  {/* Show new image previews if any selected */}
                  {editImagePreviews.length > 0 ? (
                    <>
                      <p className="myvenue-img-replace-note">
                        <Images size={14} />
                        New images will replace the current ones upon saving.
                      </p>
                      <div className="myvenue-img-preview-grid">
                        {editImagePreviews.map((src, i) => (
                          <div key={i} className="myvenue-img-thumb">
                            <img src={src} alt={`Preview ${i + 1}`} />
                            <button
                              type="button"
                              className="myvenue-img-remove"
                              onClick={() => removeEditImage(i)}
                              aria-label="Remove image"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}

                        {editImages.length < MAX_IMAGES && (
                          <button
                            type="button"
                            className="myvenue-img-add-more"
                            onClick={() => editFileInputRef.current?.click()}
                          >
                            <Plus size={20} />
                            <span>Add more</span>
                          </button>
                        )}
                      </div>
                    </>
                  ) : existingImages.length > 0 ? (
                    /* Show existing server images */
                    <>
                      <div className="myvenue-img-preview-grid">
                        {existingImages.map((src, i) => (
                          <div key={i} className="myvenue-img-thumb myvenue-img-thumb-existing">
                            <img src={src} alt={`Current image ${i + 1}`} />
                            <div className="myvenue-img-existing-badge">Current</div>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="myvenue-img-add-more"
                          onClick={() => editFileInputRef.current?.click()}
                        >
                          <Pencil size={18} />
                          <span>Replace</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="myvenue-upload-zone"
                      onClick={() => editFileInputRef.current?.click()}
                    >
                      <ImagePlus size={24} />
                      <span className="myvenue-upload-title">Click to upload images</span>
                      <span className="myvenue-upload-hint">
                        JPEG, PNG, WebP — up to 5 images, 5MB each
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="myvenue-modal-actions">
                <button
                  type="button"
                  className="myvenue-cancel-btn"
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  className="myvenue-primary-btn"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={18} className="spin-icon" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Pencil size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyVenue;