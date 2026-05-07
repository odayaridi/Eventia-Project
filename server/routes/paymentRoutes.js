const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const PaymentController = require("../controllers/PaymentController");

const router = express.Router();
const paymentController = new PaymentController();



// ─────────────────────────────────────────────────────────────────────────────
// POST /payment/checkout
// Authenticated attendee only — creates a Stripe Checkout session
// ─────────────────────────────────────────────────────────────────────────────
router.post(
    "/checkout",
    authenticateToken,
    paymentController.createStripeSession.bind(paymentController)
);

module.exports = router;

