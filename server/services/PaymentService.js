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