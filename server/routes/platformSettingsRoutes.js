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
const authenticateToken = require("../middleware/authenticateToken");
const restrictTo = require("../middleware/restrictTo");

const router = express.Router();
const platformSettingsController = new PlatformSettingsController();

/* ==================== EVENT TYPES ==================== */

router.get(
  "/getEventTypeNames",
  authenticateToken,
    restrictTo('admin'),
  platformSettingsController.getEventTypeNamesController.bind(platformSettingsController)
);

router.post(
  "/addEventType",
  authenticateToken,
    restrictTo('admin'),
  addEventTypeValidator,
  validationRequest,
  platformSettingsController.addEventTypeController.bind(platformSettingsController)
);

router.put(
  "/editEventType",
  authenticateToken,
    restrictTo('admin'),
  editEventTypeValidator,
  validationRequest,
  platformSettingsController.editEventTypeController.bind(platformSettingsController)
);

router.put(
  "/deleteEventType",
  authenticateToken,
    restrictTo('admin'),
  deleteEventTypeValidator,
  validationRequest,
  platformSettingsController.deleteEventTypeController.bind(platformSettingsController)
);

/* ==================== TICKET TYPES ==================== */

router.get(
  "/getTicketTypeNames",
  authenticateToken,
    restrictTo('admin'),
  platformSettingsController.getTicketTypeNamesController.bind(platformSettingsController)
);

router.post(
  "/addTicketType",
  authenticateToken,
    restrictTo('admin'),
  addTicketTypeValidator,
  validationRequest,
  platformSettingsController.addTicketTypeController.bind(platformSettingsController)
);

router.put(
  "/editTicketType",
  authenticateToken,
  restrictTo('admin'),
  editTicketTypeValidator,
  validationRequest,
  platformSettingsController.editTicketTypeController.bind(platformSettingsController)
);

router.put(
  "/deleteTicketType",
  authenticateToken,
  restrictTo('admin'),
  deleteTicketTypeValidator,
  validationRequest,
  platformSettingsController.deleteTicketTypeController.bind(platformSettingsController)
);

module.exports = router;