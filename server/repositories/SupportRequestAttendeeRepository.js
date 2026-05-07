const pool = require("../config/database");

class SupportRequestAttendeeRepository {
    constructor() {}

    async createSupportReqRepo(supportReq) {
        let sql = "INSERT INTO supportrequestsattendees(attendee_id,subject,message) VALUES (?,?,?)";
        const [result] = await pool.query(sql, [
            supportReq.attendeeId,
            supportReq.subject,
            supportReq.message
        ]);
        return result;
    }


  async getAttendeeRequestsRepo() {
    const [rows] = await pool.query(`
      SELECT 
        sr.id,
        sr.subject,
        sr.message,
        sr.created_at,
        u.username,
        u.email,
        u.phone_number AS phoneNumber
      FROM supportrequestsattendees sr
      JOIN attendees a ON a.id = sr.attendee_id
      JOIN users u ON u.id = a.user_id
      WHERE sr.is_resolved = 0
      ORDER BY sr.created_at DESC
    `);

    return rows;
  }

  async resolveAttendeeRepo(id) {
    return await pool.query(
      `UPDATE supportrequestsattendees SET is_resolved = 1 WHERE id = ?`,
      [id]
    );
  }

}

module.exports = SupportRequestAttendeeRepository;