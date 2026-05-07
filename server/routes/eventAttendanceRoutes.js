const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const EventAttendanceController = require("../controllers/EventAttendanceController");
const {
    insertEventAttendanceValidator,
    getFinishedOrganizerEventNamesValidator,
    getAttendanceRowsValidator,
    getAttendanceSummaryValidator
} = require("../validations/eventAttendanceValidation");

const router = express.Router();
const eventAttendanceController = new EventAttendanceController();

router.post(
    "/checkInAttendee",
    // authenticateToken,
    // restrictTo('eventOrganizer'),
    insertEventAttendanceValidator,
    validationRequest,
    eventAttendanceController.insertEventAttendanceController.bind(eventAttendanceController)
);

router.get(
    "/getFinishedOrganizerEventNames",
    // authenticateToken,
    // restrictTo('eventOrganizer'),
    getFinishedOrganizerEventNamesValidator,
    validationRequest,
    eventAttendanceController.getFinishedOrganizerEventNamesController.bind(eventAttendanceController)
);

router.get(
    "/getAttendedAttendeesByEvent",
    // authenticateToken,
    // restrictTo('eventOrganizer'),
    getAttendanceRowsValidator,
    validationRequest,
    eventAttendanceController.getAttendedAttendeesByEventController.bind(eventAttendanceController)
);

router.get(
    "/getUnattendedAttendeesByEvent",
    // authenticateToken,
    // restrictTo('eventOrganizer'),
    getAttendanceRowsValidator,
    validationRequest,
    eventAttendanceController.getUnattendedAttendeesByEventController.bind(eventAttendanceController)
);

router.get(
    "/getAttendanceSummary",
    // authenticateToken,
    // restrictTo('eventOrganizer'),
    getAttendanceSummaryValidator,
    validationRequest,
    eventAttendanceController.getAttendanceSummaryController.bind(eventAttendanceController)
);




router.get(
  "/getEventAttendancePieChart/:eventName",
  // authenticateToken,
  // restrictTo('eventOrganizer'),
//   getEventAttendancePieChartValidator,
//   validationRequest,
  eventAttendanceController.getEventAttendancePieChartController.bind(eventAttendanceController)
);

module.exports = router;