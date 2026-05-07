const pool = require("../config/database");

class VenueManagerRepository {
    constructor(){

    }

 async createVenueManager(userId, venueAuthorizationDocument) {
    const [result] = await pool.query(
      'INSERT INTO VenueManagers (user_id, venue_authorization_document) VALUES (?, ?)',
      [userId, venueAuthorizationDocument]
    );
    return result;
  }


  async isVenueManagerApproved(userId) {
    const [rows] = await pool.execute(
      "SELECT * FROM venuemanagers WHERE user_id = ?",
      [userId]
    );
    return rows[0];
  }

    async getManagerIdByUserId(userId){
      let sql = 'SELECT id from venuemanagers WHERE user_id = ?';
      const [result] = await pool.query(sql,[userId]);
      return result[0]?.id;
  }


}

module.exports = VenueManagerRepository;