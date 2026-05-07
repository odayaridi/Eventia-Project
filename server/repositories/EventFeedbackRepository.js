const pool = require("../config/database");

class EventFeedbackRepository {
    constructor() {}

    async sendFeedbackRepo(feedback) {
            const query = `
                INSERT INTO EventFeedback (event_id, attendee_id, rating, comment)
                VALUES (?, ?, ?, ?)
            `;

            const [result] = await pool.execute(query, [
                feedback.eventId,
                feedback.attendeeId,
                feedback.rating,
                feedback.comment
            ]);

            return result.insertId;
    }

  async checkAttendeeRatedRepo(attendeeId, eventId) {
    const sql = `
      SELECT 1
      FROM eventfeedback
      WHERE attendee_id = ?
        AND event_id = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [attendeeId, eventId]);

    return rows.length > 0;
  
}


async getAttendeeFeedbacksRepo(attendeeId) {
    const sql = `
     
SELECT
  ef.event_id AS eventId,
  ef.rating,
  ef.comment,
  ef.created_at AS createdAt,
  e.name AS eventName,
  et.name AS eventTypeName
FROM eventfeedback ef
JOIN events e ON e.id = ef.event_id
JOIN eventtypes et ON et.id = e.event_type_id
WHERE ef.attendee_id = ?
ORDER BY ef.created_at DESC;
    `;

    const [rows] = await pool.query(sql, [attendeeId]);

    return rows;
  }




 async getOrganizerEventsFeedbacksRepo({ organizerId, page, limit }) {
    const offset = (page - 1) * limit;

    const baseSql = `
      FROM eventfeedback ef
      JOIN attendees a ON a.id = ef.attendee_id
      JOIN users u ON u.id = a.user_id
      JOIN events e ON e.id = ef.event_id
      JOIN eventtypes et ON et.id = e.event_type_id
      WHERE e.organizer_id = ?
        AND u.is_deleted = 0
        AND e.venue_availability_id IS NOT NULL
    `;

    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
    const [countRows] = await pool.query(countSql, [organizerId]);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT
        u.username,
        u.email,
        u.phone_number AS phoneNumber,
        ef.rating,
        ef.comment,
        ef.created_at AS createdAt,
        e.name AS eventName,
        et.name AS eventTypeName
      ${baseSql}
      ORDER BY ef.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [organizerId, limit, offset]);

    return {
      feedbacks: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }









  async getFeedbackSummaryRowsForOrganizerEventRepo({ organizerId, eventName }) {
  const sql = `
    SELECT
      ef.rating,
      ef.comment,
      ef.created_at AS createdAt,
      e.name AS eventName
    FROM eventfeedback ef
    JOIN events e ON e.id = ef.event_id
    WHERE e.organizer_id = ?
      AND e.name = ?
      AND e.venue_availability_id IS NOT NULL
    ORDER BY ef.created_at DESC
  `;

  const [rows] = await pool.query(sql, [organizerId, eventName]);

  return rows;
}











async editAttendeeFeedbackRepo({ attendeeId, eventId, rating, comment }) {
  const sql = `
    UPDATE eventfeedback
    SET
      rating = ?,
      comment = ?
    WHERE attendee_id = ?
      AND event_id = ?
  `;

  const [result] = await pool.query(sql, [
    rating,
    comment,
    attendeeId,
    eventId,
  ]);

  if (result.affectedRows !== 1) {
    throw new Error("Feedback not found or nothing to update");
  }

  return {
    attendeeId,
    eventId,
    rating,
    comment,
  };
}

  
}

module.exports = EventFeedbackRepository;