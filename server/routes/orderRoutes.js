const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const OrderController = require("../controllers/OrderController");

const router = express.Router();
const orderController = new OrderController();

router.post(
    "/create/buyerId/:buyerId/cartId/:cartId",
    // authenticateToken,
    // restrictTo('Attendee'),
    // countEventBookingReqsValidator,
    // validationRequest,
    orderController.insertOrderController.bind(orderController));
module.exports = router;