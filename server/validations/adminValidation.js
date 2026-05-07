const { body , query} = require('express-validator');


exports.approveVenueManagerValidator = [
    body('venueManagerName')
        .notEmpty()
        .withMessage("Venue Manager name should not be empty")
        .trim()
        .escape()
];

exports.rejectVenueManagerValidator = [
    body('venueManagerName')
        .notEmpty()
        .withMessage("Venue Manager name should not be empty")
        .trim()
        .escape()
];


exports.approveEventOrganizerValidator = [
    body('organizerName')
        .notEmpty()
        .withMessage("Event Organizer name should not be empty")
        .trim()
        .escape()
];

exports.rejectEventOrganizerValidator = [
    body('organizerName')
        .notEmpty()
        .withMessage("Event Organizer name should not be empty")
        .trim()
        .escape()
];




exports.approveVenueManagerValidator = [
    body('venueManagerName')
        .notEmpty()
        .withMessage("Venue Manager name should not be empty")
        .trim()
        .escape()
];

exports.rejectVenueManagerValidator = [
    body('venueManagerName')
        .notEmpty()
        .withMessage("Venue Manager name should not be empty")
        .trim()
        .escape()
];

exports.approveEventOrganizerValidator = [
    body('organizerName')
        .notEmpty()
        .withMessage("Event Organizer name should not be empty")
        .trim()
        .escape()
];

exports.rejectEventOrganizerValidator = [
    body('organizerName')
        .notEmpty()
        .withMessage("Event Organizer name should not be empty")
        .trim()
        .escape()
];

/* ---------------- NEW VALIDATORS ---------------- */

exports.getPendingEventOrganizersValidator = [
    query("page")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("limit must be a positive integer"),

    query("query")
        .optional()
        .isString()
        .withMessage("query must be a string")
        .trim()
];

exports.getPendingVenueManagersValidator = [
    query("page")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("limit must be a positive integer"),

    query("query")
        .optional()
        .isString()
        .withMessage("query must be a string")
        .trim()
]

exports.getAllAttendeesValidator = [
    query("page")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("limit must be a positive integer")
];

exports.getAllEventOrganizersValidator = [
    query("page")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("limit must be a positive integer")
];

exports.getAllVenueManagersValidator = [
    query("page")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("limit must be a positive integer")
];

/* ---------------- ATTENDEE ---------------- */

// exports.updateAttendeeValidator = [
//     body("attendeeId")
//         .notEmpty()
//         .withMessage("attendeeId is required")
//         .isInt({ gt: 0 })
//         .withMessage("attendeeId must be a positive integer"),

//     body("email")
//         .notEmpty()
//         .withMessage("email is required")
//         .isEmail()
//         .withMessage("Invalid email"),

//     body("username")
//         .notEmpty()
//         .withMessage("username is required")
//         .trim(),

//     body("password")
//         .notEmpty()
//         .withMessage("password is required")
//         .isLength({ min: 6 })
//         .withMessage("Password must be at least 6 characters"),

//     body("phoneNumber")
//         .notEmpty()
//         .withMessage("phoneNumber is required")
//         .trim()
// ];



exports.updateAttendeeValidator = [
  body("attendeeId")
    .notEmpty()
    .withMessage("attendeeId is required")
    .isInt({ gt: 0 })
    .withMessage("attendeeId must be a positive integer"),

  body("firstName")
    .notEmpty()
    .withMessage("firstName is required")
    .trim(),

  body("lastName")
    .notEmpty()
    .withMessage("lastName is required")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email"),

  body("username")
    .notEmpty()
    .withMessage("username is required")
    .trim(),

  body("phoneNumber")
    .notEmpty()
    .withMessage("phoneNumber is required")
    .trim(),
];


exports.deleteAttendeeValidator = [
    body("attendeeId")
        .notEmpty()
        .withMessage("attendeeId is required")
        .isInt({ gt: 0 })
        .withMessage("attendeeId must be a positive integer")
];

/* ---------------- EVENT ORGANIZER ---------------- */

exports.updateEventOrganizerProfileAdminValidator = [
  body("organizerId")
    .notEmpty()
    .withMessage("organizerId is required")
    .isInt({ gt: 0 })
    .withMessage("organizerId must be a positive integer"),

  body("firstName")
    .notEmpty()
    .withMessage("firstName is required")
    .trim(),

  body("lastName")
    .notEmpty()
    .withMessage("lastName is required")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email"),

  body("username")
    .notEmpty()
    .withMessage("username is required")
    .trim(),

  body("phoneNumber")
    .notEmpty()
    .withMessage("phoneNumber is required")
    .trim(),

  body("organization")
    .notEmpty()
    .withMessage("organization is required")
    .trim(),
];

exports.deleteEventOrganizerValidator = [
    body("organizerId")
        .notEmpty()
        .withMessage("organizerId is required")
        .isInt({ gt: 0 })
        .withMessage("organizerId must be a positive integer")
];

/* ---------------- VENUE MANAGER ---------------- */
exports.updateVenueManagerProfileAdminValidator = [
  body("managerId")
    .notEmpty()
    .withMessage("managerId is required")
    .isInt({ gt: 0 })
    .withMessage("managerId must be a positive integer"),

  body("firstName")
    .notEmpty()
    .withMessage("firstName is required")
    .trim(),

  body("lastName")
    .notEmpty()
    .withMessage("lastName is required")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email"),

  body("username")
    .notEmpty()
    .withMessage("username is required")
    .trim(),

  body("phoneNumber")
    .notEmpty()
    .withMessage("phoneNumber is required")
    .trim(),
];

exports.deleteVenueManagerValidator = [
    body("managerId")
        .notEmpty()
        .withMessage("managerId is required")
        .isInt({ gt: 0 })
        .withMessage("managerId must be a positive integer")
];