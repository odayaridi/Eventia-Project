const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");

const authenticateToken = require("../middleware/authenticateToken");
const CartTicketsController = require("../controllers/CartTicketsController");
const { addCartTicketsValidator } = require("../validations/cartTicketsValidation");

const router = express.Router();
const cartTicketsController = new CartTicketsController();


router.post(
    "/addToCart",
    // authenticateToken,
    // restrictTo('Attendee'),
    addCartTicketsValidator,
    validationRequest,
    cartTicketsController.addCartTicketsController.bind(cartTicketsController)
);


router.get(
    "/get/attendeeId/:attendeeId",
    // authenticateToken,
    // restrictTo('Attendee'),
    // addCartTicketsValidator,
    // validationRequest,
    cartTicketsController.getCartTicketsController.bind(cartTicketsController)
);



router.delete(
    "/deleteCartEvent",
    // authenticateToken,
    // restrictTo('Attendee'),
    // addCartTicketsValidator,
    // validationRequest,
    cartTicketsController.deleteEventCartController.bind(cartTicketsController)
);



module.exports = router;