import { useState } from "react";
import type { AlertColor } from "@mui/material/Alert";

/**
 * Custom hook to manage alert/snackbar state in the application.
 * Provides state and helper functions to show or close alerts.
 */
export const useAlert = () => {
  // Whether the alert is currently open
  const [open, setOpen] = useState(false);

  // Message(s) to display in the alert
  const [message, setMessage] = useState<string | string[]>("");

  // Severity level of the alert (info, success, warning, error)
  const [severity, setSeverity] = useState<AlertColor>("info");

  /**
   * Opens the alert with a given message and severity
   * @param msg - The message or messages to display
   * @param sev - Severity of the alert (default is "info")
   */
  const showAlert = (msg: string | string[], sev: AlertColor = "info") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  /**
   * Closes the alert
   */
  const closeAlert = () => {
    setOpen(false);
  };

  /**
   * Handles closing the alert, ignoring clickaway events
   * @param event - Optional synthetic or native event
   * @param reason - Optional reason string
   */
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  // Object containing current alert state
  const alertInfo = { open, message, severity };

  // Return alert state and helper functions
  return { ...alertInfo, showAlert, handleClose, closeAlert, alertInfo };
};
