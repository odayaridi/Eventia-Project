const { body } = require("express-validator");

exports.createSupportReqAttendeeValidator = [
    
    body("attendeeId")
        .notEmpty()
        .withMessage("Attendee ID is required")
        .isInt({ min: 1 })
        .withMessage("Attendee ID must be a valid integer"),

    body("subject")
        .notEmpty()
        .withMessage("Subject is required")
        .isLength({ min: 3, max: 255 })
        .withMessage("Subject must be between 3 and 255 characters")
        .trim(),

    body("message")
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ min: 5 })
        .withMessage("Message must be at least 5 characters long")
        .trim()
];