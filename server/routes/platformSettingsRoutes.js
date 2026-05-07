const express = require("express");
const validationRequest = require("../middleware/validateRequest");
const PlatformSettingsController = require("../controllers/PlatformSettingsController");
const {
  addEventTypeValidator,
  editEventTypeValidator,
  deleteEventTypeValidator,
  addTicketTypeValidator,
  editTicketTypeValidator,
  deleteTicketTypeValidator,
} = require("../validations/platformSettingsValidation");

const router = express.Router();
const platformSettingsController = new PlatformSettingsController();

/* ==================== EVENT TYPES ==================== */

router.get(
  "/getEventTypeNames",
  // authenticateToken,
  // restrictTo("Admin"),
  platformSettingsController.getEventTypeNamesController.bind(platformSettingsController)
);

router.post(
  "/addEventType",
  // authenticateToken,
  // restrictTo("Admin"),
  addEventTypeValidator,
  validationRequest,
  platformSettingsController.addEventTypeController.bind(platformSettingsController)
);

router.put(
  "/editEventType",
  // authenticateToken,
  // restrictTo("Admin"),
  editEventTypeValidator,
  validationRequest,
  platformSettingsController.editEventTypeController.bind(platformSettingsController)
);

router.put(
  "/deleteEventType",
  // authenticateToken,
  // restrictTo("Admin"),
  deleteEventTypeValidator,
  validationRequest,
  platformSettingsController.deleteEventTypeController.bind(platformSettingsController)
);

/* ==================== TICKET TYPES ==================== */

router.get(
  "/getTicketTypeNames",
  // authenticateToken,
  // restrictTo("Admin"),
  platformSettingsController.getTicketTypeNamesController.bind(platformSettingsController)
);

router.post(
  "/addTicketType",
  // authenticateToken,
  // restrictTo("Admin"),
  addTicketTypeValidator,
  validationRequest,
  platformSettingsController.addTicketTypeController.bind(platformSettingsController)
);

router.put(
  "/editTicketType",
  // authenticateToken,
  // restrictTo("Admin"),
  editTicketTypeValidator,
  validationRequest,
  platformSettingsController.editTicketTypeController.bind(platformSettingsController)
);

router.put(
  "/deleteTicketType",
  // authenticateToken,
  // restrictTo("Admin"),
  deleteTicketTypeValidator,
  validationRequest,
  platformSettingsController.deleteTicketTypeController.bind(platformSettingsController)
);

module.exports = router;