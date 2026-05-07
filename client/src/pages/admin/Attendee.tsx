import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  PencilLine,
  Trash2,
  CircleAlert,
  X,
  Save,
} from "lucide-react";
import { Paper } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import "./Attendee.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getAllAttendees,
  updateAttendeeAdmin,
  deleteAttendeeAdmin,
  type AdminAttendeeItem,
} from "../../api/adminApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

type AttendeeRow = AdminAttendeeItem & {
  id: string;
};

const Attendee: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [rows, setRows] = useState<AttendeeRow[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(true);
  const [processingRowId, setProcessingRowId] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<AttendeeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendeeRow | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const data = await getAllAttendees(page, pageSize);

      const safeRows = (data.attendees || []).map((item, index) => ({
        id: `attendee-${page}-${index}-${item.attendeeId}`,
        ...item,
      }));

      setRows(safeRows);
      setTotal(Number(data.total || 0));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load attendees.";
      showAlert(errorMessage, "error");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [page, pageSize]);

  const openEditModal = (row: AttendeeRow) => {
    setEditTarget(row);
    setFirstName(row.firstName || "");
    setLastName(row.lastName || "");
    setEmail(row.email || "");
    setUsername(row.username || "");
    setPhoneNumber(row.phoneNumber || "");
  };

  const closeEditModal = () => {
    if (processingRowId) return;
    setEditTarget(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setPhoneNumber("");
  };

  const openDeleteModal = (row: AttendeeRow) => {
    setDeleteTarget(row);
  };

  const closeDeleteModal = () => {
    if (processingRowId) return;
    setDeleteTarget(null);
  };

  const refreshAfterDelete = async () => {
    if (rows.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
      return;
    }

    await fetchData(false);
  };

  const handleUpdate = async () => {
    if (!editTarget) return;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !username.trim() ||
      !phoneNumber.trim()
    ) {
      showAlert("All fields are required.", "warning");
      return;
    }

    try {
      setProcessingRowId(editTarget.id);

      await updateAttendeeAdmin({
        attendeeId: editTarget.attendeeId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        
        phoneNumber: phoneNumber.trim(),
      });

      showAlert("Attendee updated successfully.", "success");
      closeEditModal();
      await fetchData(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update attendee.";
      showAlert(errorMessage, "error");
    } finally {
      setProcessingRowId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setProcessingRowId(deleteTarget.id);
      await deleteAttendeeAdmin(deleteTarget.attendeeId);
      showAlert("Attendee deleted successfully.", "success");
      closeDeleteModal();
      await refreshAfterDelete();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete attendee.";
      showAlert(errorMessage, "error");
    } finally {
      setProcessingRowId(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "firstName",
      headerName: "First Name",
      flex: 0.9,
      minWidth: 140,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 0.9,
      minWidth: 140,
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.4,
      minWidth: 220,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 150,
      valueGetter: (value) => value || "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 230,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const isBusy = processingRowId === params.row.id;

        return (
          <div className="admin-management-actions-cell">
            <button
              type="button"
              className="admin-management-update-btn"
              onClick={() => openEditModal(params.row)}
              disabled={isBusy}
            >
              <PencilLine size={15} />
              <span>Update</span>
            </button>

            <button
              type="button"
              className="admin-management-delete-btn"
              onClick={() => openDeleteModal(params.row)}
              disabled={isBusy}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        );
      },
    },
  ];

  const paginationModel = useMemo(
    () => ({ page: page - 1, pageSize }),
    [page, pageSize]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    const newPage = model.page + 1;
    const newPageSize = model.pageSize;

    if (newPage !== page) setPage(newPage);

    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1);
    }
  };

  return (
    <>
      <div className="page-shell admin-management-page-shell">
        <div className="page-header">
          <h1 className="page-title">Attendees</h1>
          <p className="page-subtitle">
            Manage attendee accounts, review their account data, and update or
            soft-delete records when necessary.
          </p>
        </div>

        <section className="surface-card admin-management-section-card">
          <div className="admin-management-table-header">
            <div className="admin-management-title-wrap">
              <div className="admin-management-title-icon">
                <Users size={18} />
              </div>

              <div>
                <h2 className="admin-management-section-title">Attendees Table</h2>
                <p className="admin-management-section-subtitle">
                  Browse all attendee accounts with paginated loading and account controls.
                </p>
              </div>
            </div>
          </div>

          {!loading && total === 0 ? (
            <div className="admin-management-state-box empty">
              <div className="admin-management-empty-icon">
                <CircleAlert size={22} />
              </div>
              <h3>No attendees found</h3>
              <p>There are currently no attendee accounts available.</p>
            </div>
          ) : (
            <Paper elevation={0} className="admin-management-table-paper">
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
                getRowHeight={() => 72}
                className="admin-management-data-grid"
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
                    outline: "none !important",
                  },

                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },

                  "& .MuiDataGrid-cell--textCenter": {
                    justifyContent: "center",
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

                  "& .MuiDataGrid-columnSeparator": {
                    display: "none",
                  },
                }}
              />
            </Paper>
          )}

          <AlertSnackbar
            open={open}
            message={message}
            severity={severity}
            onClose={handleClose}
          />
        </section>
      </div>

      {editTarget && (
        <div className="admin-management-modal-overlay" onClick={closeEditModal}>
          <div
            className="admin-management-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-management-modal-header">
              <div>
                <h3 className="admin-management-modal-title">Update Attendee</h3>
                <p className="admin-management-modal-subtitle">
                  Update attendee account information below.
                </p>
              </div>

              <button
                type="button"
                className="admin-management-close-btn"
                onClick={closeEditModal}
                disabled={!!processingRowId}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-management-form-row">
              <div className="admin-management-form-group">
                <label>First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="admin-management-form-group">
                <label>Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-management-form-group">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="admin-management-form-group">
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>


            <div className="admin-management-form-group">
              <label>Phone Number</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="admin-management-save-btn"
              onClick={handleUpdate}
              disabled={!!processingRowId}
            >
              <Save size={16} />
              <span>{processingRowId ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-management-modal-overlay" onClick={closeDeleteModal}>
          <div
            className="admin-management-confirm-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete attendee?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget.firstName} {deleteTarget.lastName}
              </strong>
              ? This will perform a soft delete.
            </p>

            <div className="admin-management-confirm-actions">
              <button
                type="button"
                className="admin-management-cancel-btn"
                onClick={closeDeleteModal}
                disabled={!!processingRowId}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-management-delete-confirm-btn"
                onClick={handleDelete}
                disabled={!!processingRowId}
              >
                {processingRowId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Attendee;