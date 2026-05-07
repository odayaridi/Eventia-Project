const pool = require("../config/database");

class BookingRepository {

    constructor(){}

    async insertBookingRepository(attendeeId,eventId,totalPrice){

        const sql = `
        INSERT INTO bookings(attendee_id,event_id,total_price)
        VALUES(?,?,?)
        `;

        const [result] =
            await pool.query(sql,[attendeeId,eventId,totalPrice]);

        return result;
    }
async getBookingsByAttendeeIdRepo(attendeeId) {
  const sql = `
    SELECT 
        e.id AS eventId,
        b.id AS bookingId,
        e.name AS eventName,
        ety.name AS eventType,
       DATE_FORMAT(e.date, '%Y-%m-%d') AS eventDate,
        CONCAT(e.start_time, ' - ', e.end_time) AS eventTime,
        v.name AS venueName,
        b.total_price AS totalPrice,

        JSON_ARRAYAGG(
          JSON_OBJECT(
            'ticketType', tt.name,
            'quantity', bt.quantity,
            'priceSnapshot', bt.price_snapshot
          )
        ) AS tickets

    FROM bookings b
    JOIN events e ON e.id = b.event_id 
    JOIN eventtypes ety ON ety.id = e.event_type_id  
    JOIN venueavailability va ON va.id = e.venue_availability_id 
    JOIN venues v ON v.id = va.venue_id 
    JOIN bookingtickets bt ON bt.booking_id = b.id 
    JOIN eventtickets etk ON etk.id = bt.event_ticket_id 
    JOIN tickettypes tt ON tt.id = etk.ticket_type_id

    WHERE b.attendee_id = ?

    GROUP BY 
      b.id, e.name, ety.name, e.date, e.start_time, e.end_time, v.name, b.total_price
  `;

  const [rows] = await pool.query(sql, [attendeeId]);

  const formattedRows = rows.map(row => ({
    ...row,
    tickets: JSON.parse(row.tickets || "[]")
  }));

  return formattedRows;
}


async deleteBookingRepo(bookingId) {
  const sql = `
    DELETE FROM bookings
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [bookingId]);
  return result;
}
}

module.exports = BookingRepository;