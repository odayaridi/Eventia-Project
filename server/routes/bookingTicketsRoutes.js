const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const restrictTo = require("../middleware/restrictTo");

const validationRequest = require("../middleware/validateRequest");
const BookingTicketsController = require("../controllers/BookingTicketsController");
const { getBookingsByAttendeeIdValidator } = require("../validations/bookingsValidation");

const router = express.Router();
const bookingTicketsController = new BookingTicketsController();


router.get(
    "/getAttendeeBookingTickets",
    // authenticateToken,
    // restrictTo('attendee'),
    getBookingsByAttendeeIdValidator,
    validationRequest,
    bookingTicketsController.getAttendeeBookingTicketsController.bind(bookingTicketsController)
)

module.exports = router;