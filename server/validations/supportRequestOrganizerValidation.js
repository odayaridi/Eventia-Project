const { body } = require("express-validator");

exports.createSupportReqOrganizerValidator = [

    body("organizerId")
        .notEmpty()
        .withMessage("Organizer ID is required")
        .isInt({ min: 1 })
        .withMessage("Organizer ID must be a valid integer"),

    body("subject")
        .notEmpty()
        .withMessage("Subject is required"),
     

    body("message")
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ min: 5 })
        .withMessage("Message must be at least 5 characters long")
        .trim()
];