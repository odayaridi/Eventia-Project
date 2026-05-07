// ticketValidation.js
const { body } = require("express-validator");

exports.validateTicket = [
    body("ticketCode")
        .notEmpty()
        .withMessage("Ticket code is required")
        .isString()
        .withMessage("Ticket code must be a string"),
];