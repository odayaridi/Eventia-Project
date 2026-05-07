const pool = require("../config/database");

class CartRepository{
    constructor() {}



    async addCartRepo(attendeeId){
        const sql = 'INSERT INTO carts(attendee_id) VALUES (?)';
        const [result] = await pool.query(sql,[attendeeId]);
        return result.insertId;
    }


    async attendeeCartExists(attendeeId) {
        const sql = 'SELECT * from carts where attendee_id = ?';
        const [result] = await pool.query(sql,[attendeeId]);
        return result[0];
    }


}

module.exports = CartRepository;