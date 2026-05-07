const {param, query } = require("express-validator");

exports.getBookingsByAttendeeIdValidator = [
query('attendeeId')
         .notEmpty().withMessage("OrganizerId should not be empty"),
];




exports.deleteBookingValidator = [
  param('bookingId')
    .notEmpty().withMessage("bookingId should not be empty")
    .isInt().withMessage("bookingId must be an integer"),
];