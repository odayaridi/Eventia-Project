const pool = require("../config/database");

class BookingTicketsRepository {
  constructor() {}

  /**
   * Insert a new BookingTicket
   * @param {number} bookingId
   * @param {number} eventTicketId
   * @param {number} quantity
   * @param {number} priceSnapshot
   */
  async insertBookingTicketRepo(bookingId, eventTicketId, quantity, priceSnapshot) {
    const sql = `
      INSERT INTO BookingTickets
        (booking_id, event_ticket_id, quantity, price_snapshot)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [bookingId, eventTicketId, quantity, priceSnapshot]);
    return result;
  }

  /**
   * Get BookingTicket by ID
   * @param {number} bookingTicketId
   */
  async getById(bookingTicketId) {
    const sql = `
      SELECT 
        id AS bookingTicketId,
        booking_id AS bookingId,
        event_ticket_id AS eventTicketId,
        quantity,
        price_snapshot AS priceSnapshot,
        created_at AS createdAt
      FROM BookingTickets
      WHERE id = ?
    `;
    const [rows] = await pool.query(sql, [bookingTicketId]);
    return rows[0];
  }


 
  
// async getAttendeeBookingTicketsRepo(attendeeId) {
//   const sql = `
//     SELECT 
//       e.name AS eventName,
//       DATE_FORMAT(e.date, '%Y-%m-%d') AS eventDate,
//       CONCAT(e.start_time, ' - ', e.end_time) AS eventTime,
//       v.name AS venueName,
//       t.qr_code AS qrCode,
//       bt.quantity AS quantity,
//       bt.price_snapshot * bt.quantity AS price,
//       tt.name AS ticketTypeName,
//       DATE_FORMAT(t.created_at,'%Y-%m-%d %H:%i') AS purchased

//     FROM bookings b
//     JOIN bookingtickets bt 
//       ON b.id = bt.booking_id

//     JOIN eventtickets et 
//       ON et.id = bt.event_ticket_id

//     JOIN events e 
//       ON e.id = et.event_id

//     JOIN venueavailability va
//       ON va.id = e.venue_availability_id

//     JOIN venues v
//       ON v.id = va.venue_id

//     JOIN tickettypes tt 
//       ON tt.id = et.ticket_type_id

//     JOIN tickets t 
//       ON t.booking_ticket_id = bt.id

//     WHERE b.attendee_id = ?
//   `;

//   const [rows] = await pool.query(sql, [attendeeId]);
//   return rows;
// }



async getAttendeeBookingTicketsRepo(attendeeId) {
  const sql = `
    SELECT 
      bt.id AS bookingTicketId,

      e.name AS eventName,
      DATE_FORMAT(e.date, '%Y-%m-%d') AS eventDate,
      CONCAT(e.start_time, ' - ', e.end_time) AS eventTime,

      v.name AS venueName,

      tt.name AS ticketTypeName,

      bt.quantity,
      bt.price_snapshot,

      t.id AS ticketId,
      t.qr_code AS qrCode,
      DATE_FORMAT(t.created_at,'%Y-%m-%d %H:%i') AS purchased

    FROM bookings b

    JOIN bookingtickets bt 
      ON b.id = bt.booking_id

    JOIN eventtickets et 
      ON et.id = bt.event_ticket_id

    JOIN events e 
      ON e.id = et.event_id

    JOIN venueavailability va
      ON va.id = e.venue_availability_id

    JOIN venues v
      ON v.id = va.venue_id

    JOIN tickettypes tt 
      ON tt.id = et.ticket_type_id

    JOIN tickets t 
      ON t.booking_ticket_id = bt.id

    WHERE b.attendee_id = ?

    ORDER BY bt.id;
  `;

  const [rows] = await pool.query(sql, [attendeeId]);

  // 🔥 GROUPING LOGIC
  const grouped = {};

  rows.forEach(row => {
    if (!grouped[row.bookingTicketId]) {
      grouped[row.bookingTicketId] = {
        bookingTicketId: row.bookingTicketId,

        eventName: row.eventName,
        eventDate: row.eventDate,
        eventTime: row.eventTime,
        venueName: row.venueName,

        ticketType: row.ticketTypeName,

        quantity: row.quantity,
        price: row.price_snapshot * row.quantity,

        tickets: []
      };
    }

    grouped[row.bookingTicketId].tickets.push({
      ticketId: row.ticketId,
      qr: row.qrCode,
      purchased: row.purchased
    });
  });

  return Object.values(grouped);
}



  async getEventIdByBookingTicketId(bookingTicketId) {
      const sql = 'SELECT event_id AS eventId FROM bookingtickets bt JOIN bookings b ON b.id = bt.booking_id WHERE bt.id = ?';
      const [result] = await pool.query(sql,[bookingTicketId]);
      return result[0]?.eventId;
  }


  async getBookingTicketsByBookingId(bookingId){
     const sql = 'SELECT * from bookingtickets where booking_id  = ?';
     const [result] = await pool.query(sql,[bookingId]);
     return result;
  }
}

module.exports = BookingTicketsRepository;