const pool = require("../config/database");

class TicketTypesRepository{
    constructor() {}


    async getIdByType(type) {
        const sql = 'SELECT id from TicketTypes WHERE name = ?';
        const [result] = await pool.query(sql,[type]);
        return result[0]?.id;
    }


    async getTicketTypesRepo() {
      const sql = `SELECT name FROM tickettypes`;
      const [rows] = await pool.query(sql);
      return rows;
    }

}

module.exports = TicketTypesRepository;