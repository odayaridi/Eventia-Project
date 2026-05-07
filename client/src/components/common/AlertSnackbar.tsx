import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import type { AlertColor } from "@mui/material/Alert";

/**
 * Props for the AlertSnackbar component.
 */
interface AlertSnackbarProps {
  /**
   * Controls whether the snackbar is visible or not.
   */
  open: boolean;

  /**
   * The message(s) to display in the snackbar.
   * Can be a single string or an array of strings.
   */
  message: string | string[];

  /**
   * The severity of the alert. Determines the color and icon.
   * Defaults to "info".
   */
  severity?: AlertColor;

  /**
   * Callback function called when the snackbar is closed.
   * Receives the event and a reason string.
   */
  onClose?: (event?: React.SyntheticEvent | Event, reason?: string) => void;
}

/**
 * Utility function to capitalize the first letter of a string.
 * Returns an empty string if input is falsy.
 *
 * @param text - The string to capitalize.
 * @returns The input string with the first letter capitalized.
 */
const capitalizeFirstLetter = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * AlertSnackbar component renders one or more Material-UI Snackbars
 * with Alert components inside.
 *
 * Supports multiple messages and automatically capitalizes the first
 * letter of each message. Snackbars are displayed at the top center
 * of the screen and auto-hide after 3000ms.
 *
 * @param open - Whether the snackbar is open.
 * @param message - The message(s) to display.
 * @param severity - The severity level of the alert (info, success, warning, error).
 * @param onClose - Callback when the snackbar is closed.
 * @returns A React component rendering one or more snackbars with alerts.
 */
export default function AlertSnackbar({
  open,
  message,
  severity = "info",
  onClose,
}: AlertSnackbarProps) {
  // Ensure messages is always an array for consistent mapping
  const messages = Array.isArray(message) ? message : [message];

  return (
    <>
      {messages.map((msg, index) => (
        <Snackbar
          key={index} // Unique key for each snackbar instance
          open={open} // Controls visibility
          autoHideDuration={3000} // Auto-hide after 3 seconds
          onClose={onClose} // Close handler
          anchorOrigin={{ vertical: "top", horizontal: "center" }} // Snackbar position
          sx={{ mt: index * 7 }} // Spacing for stacked snackbars
        >
          <Alert
            severity={severity} // Alert severity style
            variant="filled" // Filled variant for better visibility
            sx={{ width: "100%" }} // Full width alert
            onClose={onClose} // Close button handler
          >
            {capitalizeFirstLetter(msg)} {/* Capitalized message */}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
