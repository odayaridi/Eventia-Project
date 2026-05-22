const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const EventVenueRequestController = require("../controllers/EventVenueRequestController");
const { countEventBookingReqsValidator, getEventVenueRequestsValidator, countEventRequestsValidator } = require("../validations/eventVenueRequestsValidation");

const router = express.Router();
const eventVenueRequestsController = new EventVenueRequestController();

router.get(
    "/countEventBookingRequests",
    authenticateToken,
    restrictTo('eventOrganizer'),
    countEventBookingReqsValidator,
    validationRequest,
    eventVenueRequestsController.countEventBookingReqsController.bind(eventVenueRequestsController)
);


//It gets all event booking requests by orhganizerId in the booking requrst section
router.get(
    "/getById",
    authenticateToken,
    restrictTo('eventOrganizer'),
    getEventVenueRequestsValidator,
    validationRequest,
    eventVenueRequestsController.getEventVenueRequestsController.bind(eventVenueRequestsController)
);

router.get(
    "/countEventRequests",
    authenticateToken,
    restrictTo('venueManager'),
    countEventRequestsValidator,
    validationRequest,
    eventVenueRequestsController.countEventRequestsController.bind(eventVenueRequestsController)
);



module.exports = router;