const { body, query } = require('express-validator');

exports.insertEventAttendanceValidator = [
    body('ticketCode')
         .notEmpty().withMessage("Ticket Code should be provided"),
];

exports.getFinishedOrganizerEventNamesValidator = [
    query("organizerId")
        .notEmpty()
        .withMessage("Organizer ID is required")
        .isInt({ gt: 0 })
        .withMessage("Organizer ID must be a positive integer"),
];

exports.getAttendanceRowsValidator = [
    query("eventId")
        .notEmpty()
        .withMessage("Event ID is required")
        .isInt({ gt: 0 })
        .withMessage("Event ID must be a positive integer"),
];

exports.getAttendanceSummaryValidator = [
    query("eventId")
        .notEmpty()
        .withMessage("Event ID is required")
        .isInt({ gt: 0 })
        .withMessage("Event ID must be a positive integer"),
];