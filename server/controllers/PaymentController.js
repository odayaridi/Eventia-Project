const PaymentService = require("../services/PaymentService");

class PaymentController {
    constructor() {
        this.paymentService = new PaymentService();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /payment/checkout
    // Body: { attendeeId, eventId, tickets: [{eventTicketId, quantity, ticketTypeName, ticketPrice}] }
    // Returns: { url } — the Stripe hosted checkout URL
    // ─────────────────────────────────────────────────────────────────────────
    async createStripeSession(req, res, next) {
        try {
            const { attendeeId, eventId, tickets } = req.body;

            if (!attendeeId || !eventId || !tickets || tickets.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "attendeeId, eventId and at least one ticket are required.",
                });
            }

            const result = await this.paymentService.createCheckoutSessionService({
                attendeeId,
                eventId,
                tickets,
            });

            return res.status(200).json({ success: true, url: result.url });
        } catch (error) {
            next(error);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /payment/webhook
    // Called by Stripe — must receive the RAW body (not JSON parsed)
    // ─────────────────────────────────────────────────────────────────────────
    async stripeWebhook(req, res, next) {
        const signature = req.headers["stripe-signature"];

        if (!signature) {
            return res.status(400).json({ error: "Missing stripe-signature header" });
        }

        try {
            // req.body is a raw Buffer here (see route config below)
            await this.paymentService.handleWebhookService(req.body, signature);
            return res.status(200).json({ received: true });
        } catch (error) {
           next(error)
        }
    }
}

module.exports = PaymentController;