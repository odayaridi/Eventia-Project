const pool = require("../config/database");

class OrderRepository {
    constructor() {}

    async insertOrderRepository(buyerId,eventId,totalPrice) {
        let sql = 'INSERT INTO orders(buyer_id,event_id,total_price) VALUES(?,?,?)';
        const [result] = await pool.query(sql,[buyerId,eventId,totalPrice]);
        return result;
    }
   
}

module.exports = OrderRepository;