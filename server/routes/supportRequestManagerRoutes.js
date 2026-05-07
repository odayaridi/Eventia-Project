const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const { createSupportReqManagerValidator, resolveRequestValidator } = require("../validations/supportRequestManagerValidation");
const SupportRequestManagerController = require("../controllers/SupportRequestManagerController");

const router = express.Router();
const supportReqManagerController = new SupportRequestManagerController();

// Venue Manager Support Request
router.post(
    "/create",
    authenticateToken,
    restrictTo('venueManager'),
    createSupportReqManagerValidator,
    validationRequest,
    supportReqManagerController.createSupportReqController.bind(supportReqManagerController)
);




router.get(
    "/getManagerRequests",
    // authenticateToken,
    // restrictTo('admin'),
    supportReqManagerController.getManagerRequestsController.bind(supportReqManagerController)
);


router.put(
    "/resolveManagerReq",
    // authenticateToken,
    // restrictTo('admin'),
    resolveRequestValidator,
    validationRequest,
    supportReqManagerController.resolveManagerController.bind(supportReqManagerController)
);

module.exports = router;