const pool = require("../config/database");

class SupportRequestOrganizerRepository {
    constructor() {}


    async createSupportReqRepo(supportReq) {
        let sql = "INSERT INTO supportrequestsorganizers(organizer_id,subject,message) VALUES (?,?,?)";
        const [result] = await pool.query(sql,[supportReq.organizerId,supportReq.subject,supportReq.message]);
        return result;
    }




      async getOrganizerRequestsRepo() {
    const [rows] = await pool.query(`
      SELECT 
        sr.id,
        sr.subject,
        sr.message,
        sr.created_at,
        u.username,
        u.email,
        u.phone_number AS phoneNumber
      FROM supportrequestsorganizers sr
      JOIN eventorganizers eo ON eo.id = sr.organizer_id
      JOIN users u ON u.id = eo.user_id
      WHERE sr.is_resolved = 0
      ORDER BY sr.created_at DESC
    `);

    return rows;
  }



  /**
   * RESOLVE
   */
  async resolveOrganizerRepo(id) {
    return await pool.query(
      `UPDATE supportrequestsorganizers SET is_resolved = 1 WHERE id = ?`,
      [id]
    );
  }
}

module.exports = SupportRequestOrganizerRepository;