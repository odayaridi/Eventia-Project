const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const VenueAvailabilityController = require("../controllers/VenueAvailabilityController");
const { createVenueAvailabilityValidator, getVenueAvailabilitiesValidator } = require("../validations/venueAvailabilityValidation");

const {
  updateVenueAvailabilityValidator,
  deleteVenueAvailabilityValidator,
} = require("../validations/venueAvailabilityValidation");


const router = express.Router();
const venueAvailablityController = new VenueAvailabilityController();
router.post(
    "/createVenueAvailability",
    authenticateToken,
    restrictTo("venueManager"),
    createVenueAvailabilityValidator,
    validationRequest,
    venueAvailablityController.createVenueAvailabilityController.bind(venueAvailablityController)
);


router.get(
    "/getVenueAvailablities",
    authenticateToken,
    restrictTo("venueManager"),
    getVenueAvailabilitiesValidator,
    validationRequest,
    venueAvailablityController.getVenueAvailabilitiesController.bind(venueAvailablityController)
);


router.get(
    "/getVenueBookedTimes",
    authenticateToken,
    restrictTo("venueManager"),
    getVenueAvailabilitiesValidator,
    validationRequest,
    venueAvailablityController.getVenueBookedTimesController.bind(venueAvailablityController)
);




router.get(
    "/dashboard/upcomingReservations",
    authenticateToken,
    restrictTo("venueManager"),
    venueAvailablityController.getUpcomingReservationsController.bind(venueAvailablityController)
);
 
router.get(
    "/dashboard/bookingByStatus",
    authenticateToken,
    restrictTo("venueManager"),
    venueAvailablityController.getBookingByStatusController.bind(venueAvailablityController)
);
 


router.put(
  "/updateVenueAvailability/:venueAvailabilityId",
  authenticateToken,
  restrictTo("venueManager"),
  updateVenueAvailabilityValidator,
  validationRequest,
  venueAvailablityController.updateVenueAvailabilityController.bind(venueAvailablityController)
);

router.delete(
  "/deleteVenueAvailability/:venueAvailabilityId",
  authenticateToken,
  restrictTo("venueManager"),
  deleteVenueAvailabilityValidator,
  validationRequest,
  venueAvailablityController.deleteVenueAvailabilityController.bind(venueAvailablityController)
);


module.exports = router;
