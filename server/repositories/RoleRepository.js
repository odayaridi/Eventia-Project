const pool = require("../config/database");

class RoleRepository {
    constructor() {}


      // Find role by name
  async findRoleByName(role) {
    const [rows] = await pool.query('SELECT * FROM Roles WHERE name = ?', [
      role,
    ]);
    return rows[0];
  }


}


module.exports = RoleRepository;