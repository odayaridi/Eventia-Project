const { body } = require("express-validator");

exports.addEventTypeValidator = [
  body("name")
    .notEmpty()
    .withMessage("Event type name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Event type name must be at least 2 characters"),
];

exports.editEventTypeValidator = [
  body("id")
    .notEmpty()
    .withMessage("Event type id is required")
    .isInt({ gt: 0 })
    .withMessage("Event type id must be a positive integer"),

  body("name")
    .notEmpty()
    .withMessage("New event type name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Event type name must be at least 2 characters"),
];

exports.deleteEventTypeValidator = [
  body("id")
    .notEmpty()
    .withMessage("Event type id is required")
    .isInt({ gt: 0 })
    .withMessage("Event type id must be a positive integer"),
];

exports.addTicketTypeValidator = [
  body("name")
    .notEmpty()
    .withMessage("Ticket type name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Ticket type name must be at least 2 characters"),
];

exports.editTicketTypeValidator = [
  body("id")
    .notEmpty()
    .withMessage("Ticket type id is required")
    .isInt({ gt: 0 })
    .withMessage("Ticket type id must be a positive integer"),

  body("name")
    .notEmpty()
    .withMessage("New ticket type name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Ticket type name must be at least 2 characters"),
];

exports.deleteTicketTypeValidator = [
  body("id")
    .notEmpty()
    .withMessage("Ticket type id is required")
    .isInt({ gt: 0 })
    .withMessage("Ticket type id must be a positive integer"),
];