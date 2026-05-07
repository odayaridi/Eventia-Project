const { body } = require("express-validator");

exports.createSupportReqManagerValidator = [
    
    body("managerId")
        .notEmpty()
        .withMessage("Manager ID is required")
        .isInt({ min: 1 })
        .withMessage("Manager ID must be a valid integer"),

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


exports.resolveRequestValidator = [
  body("id")
    .notEmpty()
    .withMessage("Request ID is required")
    .isInt({ min: 1 })
    .withMessage("Request ID must be valid"),
];