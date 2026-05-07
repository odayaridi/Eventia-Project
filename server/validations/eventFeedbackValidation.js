const { body,query } = require('express-validator');

exports.sendFeedbackValidator = [
    body('eventId')
        .notEmpty().withMessage('Event ID is required')
        .isInt({ min: 1 }).withMessage('Event ID must be a valid number'),

    body('attendeeId')
        .notEmpty().withMessage('Attendee ID is required')
        .isInt({ min: 1 }).withMessage('Attendee ID must be a valid number'),

    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

    body('comment')
        .optional()
        .isLength({ min: 3 }).withMessage('Comment must be at least 3 characters long')
        .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
];



exports.checkAttendeeRatedValidator = [
  query("attendeeId")
    .notEmpty()
    .withMessage("attendeeId is required")
    .isInt({ gt: 0 })
    .withMessage("attendeeId must be a positive integer"),

  query("eventId")
    .notEmpty()
    .withMessage("eventId is required")
    .isInt({ gt: 0 })
    .withMessage("eventId must be a positive integer"),
];

exports.getAttendeeFeedbacksValidator = [
  query("attendeeId")
    .notEmpty()
    .withMessage("attendeeId is required")
    .isInt({ gt: 0 })
    .withMessage("attendeeId must be a positive integer"),
];




exports.getOrganizerEventsFeedbacksValidator = [
  query("organizerId")
    .notEmpty()
    .withMessage("organizerId is required")
    .isInt({ gt: 0 })
    .withMessage("organizerId must be a positive integer"),

  query("page")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("limit must be a positive integer"),
];




exports.editAttendeeFeedbackValidator = [
  body("attendeeId")
    .notEmpty()
    .withMessage("attendeeId is required")
    .isInt({ gt: 0 })
    .withMessage("attendeeId must be a positive integer"),

  body("eventId")
    .notEmpty()
    .withMessage("eventId is required")
    .isInt({ gt: 0 })
    .withMessage("eventId must be a positive integer"),

  body("rating")
    .notEmpty()
    .withMessage("rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("rating must be between 1 and 5"),

  body("comment")
    .optional({ nullable: true })
    .isLength({ max: 1000 })
    .withMessage("comment must not exceed 1000 characters"),
];
