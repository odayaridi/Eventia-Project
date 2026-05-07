const pool = require("../config/database");

class OrderTicketsRepository {
    constructor() {}

    async insertOrderTicketsRepo(orderId,eventTicketId,quantity,priceSnapshot) {
        const sql = 'INSERT INTO ordertickets(order_id,event_ticket_id,quantity,price_snapshot) VALUES (?,?,?,?)';
        const [result]  = await pool.query(sql,[orderId,eventTicketId,quantity,priceSnapshot]);
        return result;
    }

}


module.exports = OrderTicketsRepository;