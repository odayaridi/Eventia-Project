const { query, body } = require("express-validator");

exports.getAttendeeProfileValidator = [
  query("attendeeId")
    .notEmpty()
    .withMessage("attendeeId is required")
    .isInt({ gt: 0 })
    .withMessage("attendeeId must be a positive integer"),
];

exports.getEventOrganizerProfileValidator = [
  query("organizerId")
    .notEmpty()
    .withMessage("organizerId is required")
    .isInt({ gt: 0 })
    .withMessage("organizerId must be a positive integer"),
];

exports.getVenueManagerProfileValidator = [
  query("managerId")
    .notEmpty()
    .withMessage("managerId is required")
    .isInt({ gt: 0 })
    .withMessage("managerId must be a positive integer"),
];

exports.editAttendeeProfileValidator = [
  body("attendeeId")
    .notEmpty()
    .withMessage("attendeeId is required")
    .isInt({ gt: 0 })
    .withMessage("attendeeId must be a positive integer"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email"),

  body("username")
    .optional()
    .notEmpty()
    .withMessage("Username cannot be empty"),

  body("phoneNumber")
    .optional()
    .notEmpty()
    .withMessage("Phone number cannot be empty")
];