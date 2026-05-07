const pool = require("../config/database");

class SupportRequestManagerRepository {
    constructor() {}

    async createSupportReqRepo(supportReq) {
        let sql = "INSERT INTO supportrequestsvenuemanagers(manager_id,subject,message) VALUES (?,?,?)";
        const [result] = await pool.query(sql, [
            supportReq.managerId,
            supportReq.subject,
            supportReq.message
        ]);
        return result;
    }

  /**
   * VENUE MANAGERS
   */
  async getManagerRequestsRepo() {
    const [rows] = await pool.query(`
      SELECT 
        sr.id,
        sr.subject,
        sr.message,
        sr.created_at,
        u.username,
        u.email,
        u.phone_number AS phoneNumber
      FROM supportrequestsvenuemanagers sr
      JOIN venuemanagers vm ON vm.id = sr.manager_id
      JOIN users u ON u.id = vm.user_id
      WHERE sr.is_resolved = 0
      ORDER BY sr.created_at DESC
    `);

    return rows;
  }

 



  async resolveManagerRepo(id) {
    return await pool.query(
      `UPDATE supportrequestsvenuemanagers SET is_resolved = 1 WHERE id = ?`,
      [id]
    );
  }


}

module.exports = SupportRequestManagerRepository;