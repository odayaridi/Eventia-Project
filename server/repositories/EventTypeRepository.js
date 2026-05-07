const pool = require("../config/database");

class EventTypeRepository {
    constructor(){}

    async getIdByTypeRepo(type){
        const sql = 'SELECT id FROM EventTypes WHERE name = ?';
        const [result] = await pool.query(sql,[type]);
        return result[0]?.id;
    }

    async getAllEventTypesRepo() {
        const sql = 'SELECT name FROM EventTypes';
        const [result] = await pool.query(sql);
        return result;
    }
}


module.exports = EventTypeRepository;