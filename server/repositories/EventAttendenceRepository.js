const pool = require("../config/database");

class EventAttendanceRepository {
  constructor() {}

  /**
   * Insert a new attendance record
   * @param {Object} attendanceData
   * attendanceData = { ticketId, eventId, checkInTime }
   */
  async insertEventAttendanceRepo(attendanceData) {
    const { ticketId, eventId, checkInTime } = attendanceData;
    const sql = `
      INSERT INTO EventAttendance
        (ticket_id, event_id, check_in_time)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(sql, [ticketId, eventId, checkInTime]);
    return result;
  }

  /**
   * Count attendance for a ticket (used for QR with multiple entries)
   * @param {number} ticketId
   */
  async countByTicket(ticketId) {
    const sql = `
      SELECT COUNT(*) AS attendanceCount
      FROM EventAttendance
      WHERE ticket_id = ?
    `;
    const [rows] = await pool.query(sql, [ticketId]);
    return rows[0]?.attendanceCoun;
  }

  async checkAttendeeAttendanceExists(eventId,ticketId){
     const sql = 'SELECT id FROM eventattendance WHERE event_id = ? AND ticket_id = ?';
     const [rows] = await pool.query(sql,[eventId,ticketId]);
     return rows[0];
  }

  /**
   * Get all attendance records for a specific event
   * @param {number} eventId
   */
  async getAttendanceByEvent(eventId) {
    const sql = `
      SELECT 
        id AS attendanceId,
        ticket_id AS ticketId,
        event_id AS eventId,
        check_in_time AS checkInTime,
        created_at AS createdAt
      FROM EventAttendance
      WHERE event_id = ?
    `;
    const [rows] = await pool.query(sql, [eventId]);
    return rows;
  }


    async getFinishedOrganizerEventNamesRepo(organizerId) {
    const sql = `
      SELECT 
        e.id AS eventId,
        e.name AS eventName
      FROM events e
      WHERE e.organizer_id = ?
       -- AND e.date < CURDATE()
        AND e.venue_availability_id IS NOT NULL
      ORDER BY e.date DESC, e.name ASC
    `;

    const [rows] = await pool.query(sql, [organizerId]);
    return rows;
  }

  async getAttendedAttendeesByEventRepo(eventId) {
    const sql = `
      SELECT
        a.id AS attendeeId,
        u.username,
        u.email,
        u.phone_number AS phoneNumber,
        GROUP_CONCAT(DISTINCT tt.name ORDER BY tt.name SEPARATOR ',') AS ticketTypes
      FROM bookings b
      JOIN attendees a ON a.id = b.attendee_id
      JOIN users u ON u.id = a.user_id
      JOIN bookingtickets bt ON bt.booking_id = b.id
      JOIN eventtickets et ON et.id = bt.event_ticket_id
      JOIN tickettypes tt ON tt.id = et.ticket_type_id
      WHERE b.event_id = ?
        AND u.is_deleted = 0
      GROUP BY a.id, u.username, u.email, u.phone_number
      ORDER BY u.username ASC
    `;

    const [rows] = await pool.query(sql, [eventId]);

    return rows.map(row => ({
      ...row,
      ticketTypes: row.ticketTypes ? row.ticketTypes.split(",") : []
    }));
  }

  async getUnattendedAttendeesByEventRepo(eventId) {
    const sql = `
     SELECT 
  a.id AS attendeeId,
  u.username,
  u.email,
  u.phone_number AS phoneNumber,
  GROUP_CONCAT(DISTINCT tt.name ORDER BY tt.name) AS ticketTypes
FROM bookings b
JOIN attendees a ON a.id = b.attendee_id
JOIN users u ON u.id = a.user_id
JOIN bookingtickets bt ON bt.booking_id = b.id
JOIN tickets t ON t.booking_ticket_id = bt.id
JOIN eventtickets et ON et.id = bt.event_ticket_id
JOIN tickettypes tt ON tt.id = et.ticket_type_id
WHERE b.event_id = 2
  AND u.is_deleted = 0
  AND NOT EXISTS (
    SELECT 1
    FROM eventattendance ea
    WHERE ea.ticket_id = t.id
      AND ea.event_id = b.event_id
  )
GROUP BY a.id, u.username, u.email, u.phone_number
ORDER BY u.username ASC;
    `;

    const [rows] = await pool.query(sql, [eventId]);

    return rows.map(row => ({
      ...row,
      ticketTypes: row.ticketTypes ? row.ticketTypes.split(",") : []
    }));
  }

  async getAttendedAttendeesCountRepo(eventId) {
    const sql = `
      SELECT COUNT(*) AS attendedCount
FROM eventattendance
WHERE event_id = ?
    `;

    const [rows] = await pool.query(sql, [eventId]);
    return rows[0]?.attendedCount || 0;
  }

  async getUnattendedAttendeesCountRepo(eventId) {
    const sql = `
    SELECT COUNT(*) AS unattendedCount
FROM bookingtickets bt
JOIN bookings b ON b.id = bt.booking_id
LEFT JOIN eventattendance ea 
  ON ea.ticket_id = bt.event_ticket_id 
  AND ea.event_id = b.event_id
WHERE b.event_id = ?
  AND ea.id IS NULL;
    `;

    const [rows] = await pool.query(sql, [eventId]);
    return rows[0]?.unattendedCount || 0;
  }







async checkAttendanceExists(eventId, ticketId) {
  const sql = `
    SELECT id 
    FROM eventattendance 
    WHERE event_id = ? AND ticket_id = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [eventId, ticketId]);
  return rows.length > 0;
}



async countEventAttendance(eventId) {
  const sql = `
    SELECT COUNT(*) AS attendanceCount
    FROM eventattendance
    WHERE event_id = ?;
  `;

  const [result] = await pool.query(sql, [eventId]);
  return result[0];
}


async countNonAttendedTicketsByEvent(eventId) {
  const sql = `
    WITH event_tickets AS (
      SELECT t.id AS ticketId
      FROM Tickets t
      JOIN BookingTickets bt ON t.booking_ticket_id = bt.id
      JOIN Bookings b ON bt.booking_id = b.id
      WHERE b.event_id = ?
    )
    SELECT COUNT(*) AS nonAttendedCount
    FROM event_tickets et
    WHERE NOT EXISTS (
      SELECT 1
      FROM eventattendance ea
      WHERE ea.ticket_id = et.ticketId
    );
  `;

  const [result] = await pool.query(sql, [eventId]);
  return result[0];
}


}

module.exports = EventAttendanceRepository;