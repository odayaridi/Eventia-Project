const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const restrictTo = require("../middleware/restrictTo");
const BookingController = require("../controllers/BookingController");
const { getBookingsByAttendeeIdValidator, deleteBookingValidator } = require("../validations/bookingsValidation");
const validationRequest = require("../middleware/validateRequest");

const router = express.Router();
const bookingController = new BookingController();

router.post(
    "/create/attendee/:attendeeId/event/:eventId",
    authenticateToken,
    restrictTo('attendee'),
    bookingController.createBookingController.bind(bookingController)
);

router.get(
      "/getAttendeeBookings",
    // authenticateToken,
    // restrictTo('attendee'),
    getBookingsByAttendeeIdValidator,
    validationRequest,
    bookingController.getBookingsByAttendeeIdController.bind(bookingController)
)



router.delete(
  "/delete/eventName/:eventName/bookingId/:bookingId",
//   authenticateToken,
//   restrictTo('attendee'),
  deleteBookingValidator,
  validationRequest,
  bookingController.deleteBookingController.bind(bookingController)
);

module.exports = router;