const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const AdminController = require("../controllers/AdminController");
const { 
    approveVenueManagerValidator,
    rejectVenueManagerValidator,
    approveEventOrganizerValidator,
    rejectEventOrganizerValidator,
    getPendingEventOrganizersValidator,
    getPendingVenueManagersValidator,
    getAllAttendeesValidator,
    updateAttendeeValidator,
    deleteAttendeeValidator,
    getAllEventOrganizersValidator,
    updateEventOrganizerProfileAdminValidator,
    deleteEventOrganizerValidator,
    getAllVenueManagersValidator,
    updateVenueManagerProfileAdminValidator,
    deleteVenueManagerValidator
} = require("../validations/adminValidation");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();
const adminController = new AdminController();

// Venue Manager Approval / Rejection
router.put(
    "/acceptVenueManager",
    authenticateToken,
    restrictTo('admin'),
    approveVenueManagerValidator,
    validationRequest,
    adminController.acceptVenueManagerController.bind(adminController)
);

router.put(
    "/rejectVenueManager",
    authenticateToken,
    restrictTo('admin'),
    rejectVenueManagerValidator,
    validationRequest,
    adminController.rejectVenueManagerController.bind(adminController)
);

// Event Organizer Approval / Rejection
router.put(
    "/acceptEventOrganizer",
    authenticateToken,
    restrictTo('admin'),
    approveEventOrganizerValidator,
    validationRequest,
    adminController.acceptEventOrganizerController.bind(adminController)
);

router.put(
    "/rejectEventOrganizer",
   authenticateToken,
    restrictTo('admin'),
    rejectEventOrganizerValidator,
    validationRequest,
    adminController.rejectEventOrganizerController.bind(adminController)
);






router.get(
    "/getPendingEventOrganizers",
   authenticateToken,
    restrictTo('admin'),
    getPendingEventOrganizersValidator,
    validationRequest,
    adminController.getPendingEventOrganizersController.bind(adminController)
);

router.get(
    "/getPendingVenueManagers",
    authenticateToken,
    restrictTo('admin'),
    getPendingVenueManagersValidator,
    validationRequest,
    adminController.getPendingVenueManagersController.bind(adminController)
);



/* ==================== ATTENDEES ==================== */

router.get(
    "/getAllAttendees",
     authenticateToken,
    restrictTo('admin'),
    getAllAttendeesValidator,
    validationRequest,
    adminController.getAllAttendeesController.bind(adminController)
);

router.put(
    "/updateAttendee",
     authenticateToken,
    restrictTo('admin'),
    updateAttendeeValidator,
    validationRequest,
    adminController.updateAttendeeController.bind(adminController)
);

router.put(
    "/deleteAttendee",
      authenticateToken,
    restrictTo('admin'),
    deleteAttendeeValidator,
    validationRequest,
    adminController.deleteAttendeeController.bind(adminController)
);

/* ==================== EVENT ORGANIZERS ==================== */

router.get(
    "/getAllEventOrganizers",
     authenticateToken,
    restrictTo('admin'),
    getAllEventOrganizersValidator,
    validationRequest,
    adminController.getAllEventOrganizersController.bind(adminController)
);

router.put(
    "/updateEventOrganizerProfileAdmin",
     authenticateToken,
    restrictTo('admin'),
    updateEventOrganizerProfileAdminValidator,
    validationRequest,
    adminController.updateEventOrganizerProfileAdminController.bind(adminController)
);

router.put(
    "/deleteEventOrganizer",
     authenticateToken,
    restrictTo('admin'),
    deleteEventOrganizerValidator,
    validationRequest,
    adminController.deleteEventOrganizerController.bind(adminController)
);

/* ==================== VENUE MANAGERS ==================== */

router.get(
    "/getAllVenueManagers",
     authenticateToken,
    restrictTo('admin'),
    getAllVenueManagersValidator,
    validationRequest,
    adminController.getAllVenueManagersController.bind(adminController)
);

router.put(
    "/updateVenueManagerProfileAdmin",
      authenticateToken,
    restrictTo('admin'),
    updateVenueManagerProfileAdminValidator,
    validationRequest,
    adminController.updateVenueManagerProfileAdminController.bind(adminController)
);

router.put(
    "/deleteVenueManager",
    authenticateToken,
    restrictTo('admin'),
    deleteVenueManagerValidator,
    validationRequest,
    adminController.deleteVenueManagerController.bind(adminController)
);




router.get(
    "/dashboard/countAllUsers",
    adminController.countAllUsersController.bind(adminController)
);
 
router.get(
    "/dashboard/countEventsAndVenues",
    adminController.countEventsAndVenuesController.bind(adminController)
);
 
router.get(
    "/dashboard/countPendingUsers",
    adminController.countPendingUsersController.bind(adminController)
);
 
router.get(
    "/dashboard/countVenueManagers",
    adminController.countVenueManagersController.bind(adminController)
);
 
router.get(
    "/dashboard/countEventOrganizers",
    adminController.countEventOrganizersController.bind(adminController)
);
 




module.exports = router;