const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const restrictTo = require("../middleware/restrictTo");

const validationRequest = require("../middleware/validateRequest");
const EventFeedbackController = require("../controllers/EventFeedbackController");
const { sendFeedbackValidator, checkAttendeeRatedValidator, getAttendeeFeedbacksValidator, getOrganizerEventsFeedbacksValidator, editAttendeeFeedbackValidator } = require("../validations/eventFeedbackValidation");
const router = express.Router();
const eventFeedbackController = new EventFeedbackController();

router.post(
    "/sendFeedback",
    // authenticateToken,
    // restrictTo('attendee'),
    sendFeedbackValidator,
    validationRequest,
    eventFeedbackController.sendFeedbackController.bind(eventFeedbackController)
);


router.get(
    '/checkAttendeeRated',
       // authenticateToken,
    // restrictTo('attendee'),
    checkAttendeeRatedValidator,
    validationRequest,
    eventFeedbackController.checkAttendeeRatedController.bind(eventFeedbackController)
)



router.get(
  "/getAttendeeFeedbacks",
//   authenticateToken,
//   restrictTo("attendee"),
  getAttendeeFeedbacksValidator,
  validationRequest,
  eventFeedbackController.getAttendeeFeedbacksController.bind(eventFeedbackController)
);



router.get(
  "/getOrganizerEventsFeedbacks",
//   authenticateToken,
//   restrictTo("eventOrganizer"),
  getOrganizerEventsFeedbacksValidator,
  validationRequest,
  eventFeedbackController.getOrganizerEventsFeedbacksController.bind(eventFeedbackController)
);





const { body, query } = require("express-validator");

router.post(
  "/analyzeEventFeedbackSummary",
  [
    body("organizerId")
      .notEmpty()
      .withMessage("organizerId is required")
      .isInt({ gt: 0 })
      .withMessage("organizerId must be a positive integer"),

    body("eventName")
      .notEmpty()
      .withMessage("eventName is required")
      .isString()
      .withMessage("eventName must be a string")
      .trim(),
  ],
  validationRequest,
  eventFeedbackController.analyzeEventFeedbackSummaryController.bind(eventFeedbackController)
);









router.put(
  "/editAttendeeFeedback",
  // authenticateToken,
  // restrictTo("attendee"),
  editAttendeeFeedbackValidator,
  validationRequest,
  eventFeedbackController.editAttendeeFeedbackController.bind(eventFeedbackController)
);


module.exports = router;