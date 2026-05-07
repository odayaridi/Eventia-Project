const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const VenueController = require("../controllers/VenueController");
const { createVenueValidator, updateVenueValidator, fetchEventRequestsValidator, hasVenueValidator, getVenueInfoValidator, getVenueAvailabilityTimesValidator, getVenueAvailabilityDatesValidator } = require("../validations/venueValidation");
const createUploadMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();
const venueController = new VenueController();


// 👇 Create uploader for venue images
const uploadVenueImages = createUploadMiddleware({
    uploadDir: "public/uploads/venueImages",
    fileType: "image"
});

// ============================
// CREATE VENUE
// ============================
router.post(
    "/createVenue",

    uploadVenueImages.array("images", 5), // 👈 1 to 5 images

    createVenueValidator,
    validationRequest,

    venueController.createVenueController.bind(venueController)
);

// ============================
// UPDATE VENUE
// ============================
router.put(
    "/updateVenue",

    authenticateToken,
    restrictTo("venueManager"),

    uploadVenueImages.array("images", 5),

    updateVenueValidator,
    validationRequest,

    venueController.updateVenueController.bind(venueController)
);

// ============================
// GET VENUE INFO
// ============================
router.get(
    "/getVenueInfo",

    getVenueInfoValidator,
    validationRequest,

    venueController.getVenueInfoController.bind(venueController)
);












router.get(
    "/filterVenues",
    // authenticateToken,
    // restrictTo("eventOrganizer"),
    venueController.filterVenuesController.bind(venueController)
);

router.get(
    "/getVenuesNames",
    // authenticateToken,
    // restrictTo("eventOrganizer"),
    venueController.getVenuesNamesController.bind(venueController)
);

router.get(
    "/getVenueAvailabilityDates",
    // authenticateToken,
    // restrictTo("eventOrganizer"),
    getVenueAvailabilityDatesValidator,
    validationRequest,
    venueController.getVenueAvailabilityDatesController.bind(venueController)
);

router.get(
    "/getVenueAvailabilityTimes",
    // authenticateToken,
    // restrictTo("eventOrganizer"),,
    getVenueAvailabilityTimesValidator,
    validationRequest,
    venueController.getVenueAvailabilityTimesController.bind(venueController)
);



router.get(
    "/fetchEventRequests",
    authenticateToken,
    restrictTo("venueManager"),
    fetchEventRequestsValidator,
    validationRequest,
    venueController.fetchEventRequestsController.bind(venueController)
);



router.get(
    "/hasVenue",
    authenticateToken,
    restrictTo("venueManager"),
    hasVenueValidator,
    validationRequest,
    venueController.hasVenueController.bind(venueController)
);















router.get(
    "/dashboard/bookingStats/:managerId",
    // authenticateToken,
    // restrictTo("venueManager"),
    venueController.getVenueDashboardStatsController.bind(venueController)
);


module.exports = router;