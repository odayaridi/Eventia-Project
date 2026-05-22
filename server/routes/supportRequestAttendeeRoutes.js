const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const { createSupportReqAttendeeValidator } = require("../validations/createSupportReqAttendeeValidator");
const SupportRequestAttendeeController = require("../controllers/SupportRequestAttendeeController");
const { resolveRequestValidator } = require("../validations/supportRequestManagerValidation");

const router = express.Router();
const supportReqAttendeeController = new SupportRequestAttendeeController();

// Attendee Support Request
router.post(
    "/create",
    authenticateToken,
    restrictTo('attendee'),
    createSupportReqAttendeeValidator,
    validationRequest,
    supportReqAttendeeController.createSupportReqController.bind(supportReqAttendeeController)
);



router.get(
    "/getAttendeeRequests",
    authenticateToken,
    restrictTo('attendee'),
    supportReqAttendeeController.getAttendeeRequestsController.bind(supportReqAttendeeController)
);


router.put(
    "/resolveAttendeeReq",
    authenticateToken,
    restrictTo('attendee'),
    resolveRequestValidator,
    validationRequest,
    supportReqAttendeeController.resolveAttendeeController.bind(supportReqAttendeeController)
);


module.exports = router;