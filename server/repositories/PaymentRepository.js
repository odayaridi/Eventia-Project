const pool = require("../config/database");

class PaymentRepository {
    constructor() {}

    // ── Insert a pending payment record when checkout session is created ──
    async insertPaymentRepo({ attendeeId, eventId, stripeSessionId, amount, currency, ticketsSnapshot }) {
        const sql = `
            INSERT INTO Payments
                (attendee_id, event_id, stripe_session_id, amount, currency, status_id, tickets_snapshot)
            VALUES
                (?, ?, ?, ?, ?,
                 (SELECT id FROM PaymentStatus WHERE name = 'pending'),
                 ?)
        `;
        const [result] = await pool.query(sql, [
            attendeeId,
            eventId,
            stripeSessionId,
            amount,
            currency,
            JSON.stringify(ticketsSnapshot),
        ]);
        return result;
    }

    // ── Find a pending payment by stripe session id ──
    async getPaymentBySessionId(stripeSessionId) {
        const sql = `
            SELECT
                p.*,
                ps.name AS statusName
            FROM Payments p
            JOIN PaymentStatus ps ON ps.id = p.status_id
            WHERE p.stripe_session_id = ?
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, [stripeSessionId]);
        return rows[0] || null;
    }

    // ── Mark payment completed and attach booking + payment intent ──
    async markPaymentCompleted({ stripeSessionId, stripePaymentIntent, bookingId }) {
        const sql = `
            UPDATE Payments
            SET
                status_id             = (SELECT id FROM PaymentStatus WHERE name = 'completed'),
                stripe_payment_intent = ?,
                booking_id            = ?,
                updated_at            = NOW()
            WHERE stripe_session_id = ?
        `;
        const [result] = await pool.query(sql, [stripePaymentIntent, bookingId, stripeSessionId]);
        return result;
    }

    // ── Mark payment failed ──
    async markPaymentFailed(stripeSessionId) {
        const sql = `
            UPDATE Payments
            SET
                status_id  = (SELECT id FROM PaymentStatus WHERE name = 'failed'),
                updated_at = NOW()
            WHERE stripe_session_id = ?
        `;
        const [result] = await pool.query(sql, [stripeSessionId]);
        return result;
    }







      async getBookingConfirmationDetailsByBookingId(bookingId) {
    const sql = `
      SELECT 
        b.id AS bookingId,
        u.email,
        u.username,
        e.name AS eventName,
        e.date AS eventDate,
        e.start_time AS startTime,
        e.end_time AS endTime,
        v.name AS venueName,
        p.amount,
        p.currency
      FROM Bookings b
      INNER JOIN Attendees a ON b.attendee_id = a.id
      INNER JOIN Users u ON a.user_id = u.id
      INNER JOIN Events e ON b.event_id = e.id
      INNER JOIN VenueAvailability va ON e.venue_availability_id = va.id
      INNER JOIN Venues v ON va.venue_id = v.id
      INNER JOIN Payments p ON p.booking_id = b.id
      WHERE b.id = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [bookingId]);
    return rows[0] || null;
  }
}

module.exports = PaymentRepository;