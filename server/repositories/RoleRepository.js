const pool = require("../config/database");

class RoleRepository {
    constructor() {}

  async findRoleByName(role) {
    const [rows] = await pool.query('SELECT * FROM Roles WHERE name = ?', [
      role,
    ]);
    return rows[0];
  }


}


module.exports = RoleRepository;