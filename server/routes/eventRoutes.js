const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const EventController = require("../controllers/EventController");
const { createEventValidator, approveEventVenueRequestValidator, filterEventsValidation, getEventsByOrganizerValidator, updateEventValidator, deleteEventValidator } = require("../validations/eventValidation");
// const uploadImages = require("../middleware/uploadImagesMiddleware");
const createUploadMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();
const eventController = new EventController();



//this will be used in the Ticket types section to filter tickets according to a certain event type
router.get(
    "/getEventNames/:organizerId",
    // authenticateToken,
    // restrictTo('attendee'),
    eventController.getEventNamesController.bind(eventController)
);



router.get(
    "/getUpcomingEventNames/:organizerId",
    // authenticateToken,
    // restrictTo('attendee'),
    eventController.getUpcomingEventNamesController.bind(eventController)
);




router.get(
    "/getEndedEventNames/:organizerId",
    // authenticateToken,
    // restrictTo('attendee'),
    eventController.getEndedEventNamesController.bind(eventController)
);


router.get(
    "/filterEvents",
    // authenticateToken,
    // restrictTo('attendee'),
    filterEventsValidation,
    validationRequest,
    eventController.filterEventsController.bind(eventController)
);




// // Attendee Support Request
// router.post(
//     "/createEvent",

//     // 👇 Multer FIRST
//     uploadImages.single("image"), 

//     createEventValidator,
//     validationRequest,

//     eventController.createEventController.bind(eventController)
// );




// router.put(
//     "/updateEvent",
//     uploadImages.single("image"),         // optional image file
//     updateEventValidator,
//     validationRequest,
//     eventController.updateEventController.bind(eventController)
// );



// 👇 Create image uploader
const uploadImages = createUploadMiddleware({
    uploadDir: 'public/uploads/eventsImages',
    fileType: 'image'
});

router.post(
    "/createEvent",

    uploadImages.single("image"),

    createEventValidator,
    validationRequest,

    eventController.createEventController.bind(eventController)
);

router.put(
    "/updateEvent",

    uploadImages.single("image"),

    updateEventValidator,
    validationRequest,

    eventController.updateEventController.bind(eventController)
);



router.put(
    "/approveEventVenueReq",
    authenticateToken,
    restrictTo('venueManager'),
    approveEventVenueRequestValidator,
    validationRequest,
    eventController.approveEventVenueRequestController.bind(eventController)
);


router.put(
    "/rejectEventVenueReq",
    authenticateToken,
    restrictTo('venueManager'),
    approveEventVenueRequestValidator,
    validationRequest,
    eventController.rejectEventVenueRequestController.bind(eventController)
);


router.get(
    "/getEvents/:organizerId",
    // authenticateToken,
    // restrictTo('eventOrganizer'),
    getEventsByOrganizerValidator,
    validationRequest,
    eventController.getEventsByOrganizer.bind(eventController)
);













// 1. Total events
router.get(
    "/dashboard/totalEvents/:organizerId",
    eventController.getDashboardTotalEventsController.bind(eventController)
);
 
// 2. Total tickets sold
router.get(
    "/dashboard/totalTicketsSold/:organizerId",
    eventController.getDashboardTicketsSoldController.bind(eventController)
);
 
// 3. Total revenue
router.get(
    "/dashboard/totalRevenue/:organizerId",
    eventController.getDashboardTotalRevenueController.bind(eventController)
);
 
// 4. Avg attendance rate
router.get(
    "/dashboard/avgAttendance/:organizerId",
    eventController.getDashboardAvgAttendanceController.bind(eventController)
);
 
// 5. Revenue per event (bar chart)
router.get(
    "/dashboard/revenuePerEvent/:organizerId",
    eventController.getDashboardRevenuePerEventController.bind(eventController)
);
 
// 6. Events this month
router.get(
    "/dashboard/eventsThisMonth/:organizerId",
    eventController.getDashboardEventsThisMonthController.bind(eventController)
);
 
// 7. Pending venue requests
router.get(
    "/dashboard/pendingVenueRequests/:organizerId",
    eventController.getDashboardPendingVenueRequestsController.bind(eventController)
);
 
// 8. Total announcements
router.get(
    "/dashboard/totalAnnouncements/:organizerId",
    eventController.getDashboardTotalAnnouncementsController.bind(eventController)
);
 
// 9. Total feedbacks
router.get(
    "/dashboard/totalFeedbacks/:organizerId",
    eventController.getDashboardTotalFeedbacksController.bind(eventController)
);


router.delete(
  "/deleteEvent/:eventId",
//   authenticateToken,
//   restrictTo('eventOrganizer'),
  deleteEventValidator,
  validationRequest,
  eventController.deleteEventController.bind(eventController)
);


module.exports = router;