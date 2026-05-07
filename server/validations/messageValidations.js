const { body, param, query } = require("express-validator");

exports.createOrGetConversationValidator = [
  body("organizerId")
    .notEmpty()
    .withMessage("Organizer ID is required")
    .isInt({ gt: 0 })
    .withMessage("Organizer ID must be a positive integer"),

  body("managerId")
    .notEmpty()
    .withMessage("Manager ID is required")
    .isInt({ gt: 0 })
    .withMessage("Manager ID must be a positive integer"),

  body("venueId")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("Venue ID must be a positive integer"),
];

exports.getMessagesValidator = [
  param("conversationId")
    .notEmpty()
    .withMessage("Conversation ID is required")
    .isInt({ gt: 0 })
    .withMessage("Conversation ID must be a positive integer"),
];

exports.getVenuesChattingValidator = [
  query("organizerId")
    .notEmpty()
    .withMessage("Organizer ID is required")
    .isInt({ gt: 0 })
    .withMessage("Organizer ID must be a positive integer"),
];



exports.getOrganizersChattingValidator = [
  query("managerId")
    .notEmpty()
    .withMessage("Manager ID is required")
    .isInt({ gt: 0 })
    .withMessage("Manager ID must be a positive integer"),
];









exports.getOrganizerUnreadSummaryValidator = [
  query("organizerId")
    .notEmpty()
    .withMessage("Organizer ID is required")
    .isInt({ gt: 0 })
    .withMessage("Organizer ID must be a positive integer"),
];

exports.getManagerUnreadSummaryValidator = [
  query("managerId")
    .notEmpty()
    .withMessage("Manager ID is required")
    .isInt({ gt: 0 })
    .withMessage("Manager ID must be a positive integer"),
];

exports.markConversationReadValidator = [
  param("conversationId")
    .notEmpty()
    .withMessage("Conversation ID is required")
    .isInt({ gt: 0 })
    .withMessage("Conversation ID must be a positive integer"),

  body("readerUserId")
    .notEmpty()
    .withMessage("Reader user ID is required")
    .isInt({ gt: 0 })
    .withMessage("Reader user ID must be a positive integer"),
];