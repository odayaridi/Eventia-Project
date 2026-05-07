const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const SupportRequestOrganizerController = require("../controllers/SupportRequestOrganizerController");
const { createSupportReqOrganizerValidator } = require("../validations/supportRequestOrganizerValidation");
const { resolveRequestValidator } = require("../validations/supportRequestManagerValidation");

const router = express.Router();
const supportReqOrganizerController = new SupportRequestOrganizerController()

router.post(
    "/create",
    authenticateToken,
    restrictTo('eventOrganizer'),
    createSupportReqOrganizerValidator,
    validationRequest,
    supportReqOrganizerController.createSupportReqController.bind(supportReqOrganizerController)
);





router.get(
    "/getOrganizerRequests",
    // authenticateToken,
    // restrictTo('attendee'),
    supportReqOrganizerController.getOrganizerRequestsController.bind(supportReqOrganizerController)
);


router.put(
    "/resolveOrganizerReq",
    // authenticateToken,
    // restrictTo('attendee'),
    resolveRequestValidator,
    validationRequest,
    supportReqOrganizerController.resolveOrganizerController.bind(supportReqOrganizerController)
);

module.exports = router;