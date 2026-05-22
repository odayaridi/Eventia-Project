const express = require("express");
const validationRequest = require("../middleware/validateRequest");
const {
  getAttendeeProfileValidator,
  getEventOrganizerProfileValidator,
  getVenueManagerProfileValidator,
  editAttendeeProfileValidator,
} = require("../validations/profileValidation");
const ProfileController = require("../controllers/ProfileController");
const authenticateToken = require("../middleware/authenticateToken");
const restrictTo = require("../middleware/restrictTo");

const router = express.Router();
const profileController = new ProfileController();

router.get(
  "/getAttendeeProfile",
  authenticateToken,
  restrictTo("attendee"),
  getAttendeeProfileValidator,
  validationRequest,
  profileController.getAttendeeProfileController.bind(profileController)
);

router.get(
  "/getEventOrganizerProfile",
  authenticateToken,
  restrictTo("eventOrganizer"),
  getEventOrganizerProfileValidator,
  validationRequest,
  profileController.getEventOrganizerProfileController.bind(profileController)
);

router.get(
  "/getVenueManagerProfile",
  authenticateToken,
  restrictTo("venueManager"),
  getVenueManagerProfileValidator,
  validationRequest,
  profileController.getVenueManagerProfileController.bind(profileController)
);

router.put(
  "/editAttendeeProfile",
  authenticateToken,
  restrictTo("attendee"),
  editAttendeeProfileValidator,
  validationRequest,
  profileController.editAttendeeProfileController.bind(profileController)
);

module.exports = router;