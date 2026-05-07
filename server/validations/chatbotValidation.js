const { body } = require("express-validator");

exports.askChatbotValidator = [
    body("prompt")
        .notEmpty()
        .withMessage("Prompt is required")
        .isString()
        .withMessage("Prompt must be a string")
        .isLength({ min: 2, max: 500 })
        .withMessage("Prompt must be between 2 and 500 characters")
];