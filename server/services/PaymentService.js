// const Stripe = require("stripe");
// const PaymentRepository = require("../repositories/PaymentRepository");
// const BookingService = require("./BookingService");

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// class PaymentService {
//     constructor() {
//         this.paymentRepo = new PaymentRepository();
//         this.bookingService = new BookingService();
//     }

//     // ─────────────────────────────────────────────────────────────────────────
//     // createCheckoutSessionService
//     //   - Builds Stripe line items from event ticket data
//     //   - Creates a Stripe Checkout session
//     //   - Persists a pending Payment record (NO booking yet)
//     //   - Returns the session URL so the frontend can redirect
//     // ─────────────────────────────────────────────────────────────────────────
//     async createCheckoutSessionService({ attendeeId, eventId, tickets }) {
//         if (!tickets || tickets.length === 0) {
//             const { HttpError } = require("../utils/HttpError");
//             throw new HttpError("No tickets selected", 400);
//         }

//         // Build Stripe line items
//         // Each entry in tickets: { eventTicketId, quantity, ticketTypeName, ticketPrice }
//         const lineItems = tickets.map((t) => ({
//             price_data: {
//                 currency: "usd",
//                 product_data: {
//                     name: t.ticketTypeName,
//                 },
//                 // Stripe expects amount in CENTS
//                 unit_amount: Math.round(parseFloat(t.ticketPrice) * 100),
//             },
//             quantity: t.quantity,
//         }));

//         // Total in dollars for our DB record
//         const totalAmount = tickets.reduce(
//             (sum, t) => sum + parseFloat(t.ticketPrice) * t.quantity,
//             0
//         );

//         // Tickets snapshot stored in metadata (and in our DB)
//         // metadata values must be strings
//         const ticketsSnapshot = tickets.map((t) => ({
//             eventTicketId: t.eventTicketId,
//             quantity: t.quantity,
//         }));

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             mode: "payment",
//             line_items: lineItems,
//             // success_url and cancel_url — frontend routes
//             success_url: `${process.env.FRONTEND_URL}/attendee/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${process.env.FRONTEND_URL}/attendee/browse`,
//             // Store all context in metadata so the webhook can reconstruct the booking
//             metadata: {
//                 attendeeId: String(attendeeId),
//                 eventId: String(eventId),
//                 tickets: JSON.stringify(ticketsSnapshot),
//             },
//         });

//         // Persist a PENDING payment — no booking record yet
//         await this.paymentRepo.insertPaymentRepo({
//             attendeeId,
//             eventId,
//             stripeSessionId: session.id,
//             amount: totalAmount,
//             currency: "usd",
//             ticketsSnapshot,
//         });

//         return { url: session.url, sessionId: session.id };
//     }

//     // ─────────────────────────────────────────────────────────────────────────
//     // handleWebhookService
//     //   - Called with the raw request body (Buffer) and Stripe-Signature header
//     //   - Verifies the webhook signature
//     //   - On checkout.session.completed → creates booking in DB
//     //   - Idempotent: if payment already completed, skips silently
//     // ─────────────────────────────────────────────────────────────────────────
//     async handleWebhookService(rawBody, signature) {
//         let event;

//         try {
//             event = stripe.webhooks.constructEvent(
//                 rawBody,
//                 signature,
//                 process.env.STRIPE_WEBHOOK_SECRET
//             );
//         } catch (err) {
//             throw new Error(`Webhook signature verification failed: ${err.message}`);
//         }

//         if (event.type === "checkout.session.completed") {
//             const session = event.data.object;
//             await this._fulfillOrder(session);
//         }

//         // You can add more event types here (e.g. payment_intent.payment_failed)
//         if (event.type === "checkout.session.expired") {
//             const session = event.data.object;
//             await this.paymentRepo.markPaymentFailed(session.id).catch(() => {});
//         }

//         return { received: true };
//     }

//     // ─────────────────────────────────────────────────────────────────────────
//     // _fulfillOrder  (private)
//     //   - Idempotency: check payment record is still 'pending' before acting
//     //   - Calls createBookingService to insert booking + tickets + QR codes
//     //   - Updates payment record to 'completed'
//     // ─────────────────────────────────────────────────────────────────────────
//     async _fulfillOrder(session) {
//         const payment = await this.paymentRepo.getPaymentBySessionId(session.id);

//         // Guard: only process once (idempotency)
//         if (!payment || payment.statusName !== "pending") {
//             return;
//         }

//         const { attendeeId, eventId, tickets } = session.metadata;
//         const parsedTickets = JSON.parse(tickets); // [{eventTicketId, quantity}]

//         // Create booking in DB (your existing logic)
//         const { bookingId } = await this.bookingService.createBookingService(
//             attendeeId,
//             eventId,
//             parsedTickets
//         );

//         // Mark payment completed and link to booking
//         await this.paymentRepo.markPaymentCompleted({
//             stripeSessionId: session.id,
//             stripePaymentIntent: session.payment_intent,
//             bookingId,
//         });
//     }
// }

// module.exports = PaymentService;


const Stripe = require("stripe");
const PaymentRepository = require("../repositories/PaymentRepository");
const BookingService = require("./BookingService");
const buildBookingConfirmationEmail = require("../utils/emailTemplates");
const sendMail = require("../utils/mailer");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  constructor() {
    this.paymentRepo = new PaymentRepository();
    this.bookingService = new BookingService();
  }

  async createCheckoutSessionService({ attendeeId, eventId, tickets }) {
    if (!tickets || tickets.length === 0) {
      const HttpError = require("../utils/HttpError");
      throw new HttpError("No tickets selected", 400);
    }

    const lineItems = tickets.map((t) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: t.ticketTypeName,
        },
        unit_amount: Math.round(parseFloat(t.ticketPrice) * 100),
      },
      quantity: t.quantity,
    }));

    const totalAmount = tickets.reduce(
      (sum, t) => sum + parseFloat(t.ticketPrice) * t.quantity,
      0
    );

    const ticketsSnapshot = tickets.map((t) => ({
      eventTicketId: t.eventTicketId,
      quantity: t.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/attendee/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/attendee/browse`,
      metadata: {
        attendeeId: String(attendeeId),
        eventId: String(eventId),
        tickets: JSON.stringify(ticketsSnapshot),
      },
    });

    await this.paymentRepo.insertPaymentRepo({
      attendeeId,
      eventId,
      stripeSessionId: session.id,
      amount: totalAmount,
      currency: "usd",
      ticketsSnapshot,
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhookService(rawBody, signature) {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await this._fulfillOrder(session);
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      await this.paymentRepo.markPaymentFailed(session.id).catch(() => {});
    }

    return { received: true };
  }

  async _fulfillOrder(session) {
    const payment = await this.paymentRepo.getPaymentBySessionId(session.id);

    if (!payment || payment.statusName !== "pending") {
      return;
    }

    const { attendeeId, eventId, tickets } = session.metadata;
    const parsedTickets = JSON.parse(tickets);

    const { bookingId } = await this.bookingService.createBookingService(
      attendeeId,
      eventId,
      parsedTickets
    );

    await this.paymentRepo.markPaymentCompleted({
      stripeSessionId: session.id,
      stripePaymentIntent: session.payment_intent,
      bookingId,
    });

    const bookingDetails =
      await this.paymentRepo.getBookingConfirmationDetailsByBookingId(bookingId);

    if (bookingDetails?.email) {
      const html = buildBookingConfirmationEmail({
        username: bookingDetails.username,
        bookingId: bookingDetails.bookingId,
        eventName: bookingDetails.eventName,
        eventDate: bookingDetails.eventDate,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        venueName: bookingDetails.venueName,
        totalAmount: bookingDetails.amount,
        currency: bookingDetails.currency,
      });

      await sendMail(
        bookingDetails.email,
        `Booking Confirmed - ${bookingDetails.eventName}`,
        html
      );
    }
  }
}

module.exports = PaymentService;