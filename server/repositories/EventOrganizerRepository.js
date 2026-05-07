const pool = require("../config/database");

class EventOrganizerRepository {
    constructor() {

    }


    
  async createEventOrganizer(userId, organization, commercialRegistrationDocument) {
    const [result] = await pool.query(
      'INSERT INTO EventOrganizers (user_id, organization, commercial_registration_document) VALUES (?, ?, ?)',
      [userId, organization,commercialRegistrationDocument]
    );
    return result;
  }


  async isEventOrganizerApproved(userId) {
    const [rows] = await pool.execute(
      "SELECT * FROM EventOrganizers WHERE user_id = ?",
      [userId]
    );
    return rows[0];
  }


    async getOrganizerIdByUserId(userId){
      let sql = 'SELECT id from eventorganizers WHERE user_id = ?';
      const [result] = await pool.query(sql,[userId]);
      return result[0]?.id;
  }




}


module.exports = EventOrganizerRepository;