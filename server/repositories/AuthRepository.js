const pool = require("../config/database");

class AuthRepository {

  async findUserByEmail(email){
    const sql = `
      SELECT id,email,username
      FROM Users
      WHERE email = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql,[email]);
    return rows[0];
  }

  async updatePassword(userId,hashedPassword){
    const sql = `
      UPDATE Users
      SET password = ?
      WHERE id = ?
    `;
    await pool.query(sql,[hashedPassword,userId]);
  }

}

module.exports = AuthRepository;