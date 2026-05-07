const pool = require("../config/database");


class AttendeeRepository {
    constructor() {}



  // Create specialized record
  async createAttendee(userId) {
    const [result] = await pool.query(
      'INSERT INTO Attendees (user_id) VALUES (?)',
      [userId]
    );
    return result;
  }



  async getAttendeeIdByUserId(userId){
      let sql = 'SELECT id from attendees WHERE user_id = ?';
      const [result] = await pool.query(sql,[userId]);
      return result[0]?.id;
  }

}

module.exports = AttendeeRepository;