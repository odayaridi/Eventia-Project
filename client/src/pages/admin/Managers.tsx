import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
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
import "./Managers.css";
import { useAlert } from "../../hooks/useAlert";
import {
  getAllVenueManagers,
  updateVenueManagerAdmin,
  deleteVenueManagerAdmin,
  type AdminManagerItem,
} from "../../api/adminApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

type ManagerRow = AdminManagerItem & {
  id: string;
};

const Managers: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [rows, setRows] = useState<ManagerRow[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(true);
  const [processingRowId, setProcessingRowId] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<ManagerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagerRow | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const data = await getAllVenueManagers(page, pageSize);

      const safeRows = (data.venueManagers || []).map((item, index) => ({
        id: `manager-${page}-${index}-${item.managerId}`,
        ...item,
      }));

      setRows(safeRows);
      setTotal(Number(data.total || 0));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load venue managers.";
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

  const openEditModal = (row: ManagerRow) => {
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

  const openDeleteModal = (row: ManagerRow) => {
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

      await updateVenueManagerAdmin({
        managerId: editTarget.managerId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      showAlert("Venue manager updated successfully.", "success");
      closeEditModal();
      await fetchData(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update venue manager.";
      showAlert(errorMessage, "error");
    } finally {
      setProcessingRowId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setProcessingRowId(deleteTarget.id);
      await deleteVenueManagerAdmin(deleteTarget.managerId);
      showAlert("Venue manager deleted successfully.", "success");
      closeDeleteModal();
      await refreshAfterDelete();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete venue manager.";
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
          <h1 className="page-title">Managers</h1>
          <p className="page-subtitle">
            Manage venue manager accounts, maintain account information, and
            perform safe soft-delete operations when needed.
          </p>
        </div>

        <section className="surface-card admin-management-section-card">
          <div className="admin-management-table-header">
            <div className="admin-management-title-wrap">
              <div className="admin-management-title-icon">
                <Building2 size={18} />
              </div>

              <div>
                <h2 className="admin-management-section-title">
                  Venue Managers Table
                </h2>
                <p className="admin-management-section-subtitle">
                  Browse all venue manager accounts with update and soft-delete actions.
                </p>
              </div>
            </div>
          </div>

          {!loading && total === 0 ? (
            <div className="admin-management-state-box empty">
              <div className="admin-management-empty-icon">
                <CircleAlert size={22} />
              </div>
              <h3>No venue managers found</h3>
              <p>There are currently no venue manager accounts available.</p>
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
        </section>

        <AlertSnackbar
          open={open}
          message={message}
          severity={severity}
          onClose={handleClose}
        />
      </div>

      {editTarget && (
        <div className="admin-management-modal-overlay" onClick={closeEditModal}>
          <div
            className="admin-management-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-management-modal-header">
              <div>
                <h3 className="admin-management-modal-title">
                  Update Venue Manager
                </h3>
                <p className="admin-management-modal-subtitle">
                  Update venue manager account information below.
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
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
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
            <h3>Delete venue manager?</h3>
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

export default Managers;