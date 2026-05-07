const { format } = require("date-fns");
const pool = require("../config/database");

class CartTicketsRepository {
  constructor() {}

  async insertCartTicketsBatch(cartId, eventTickets) {
    const values = [];
    const placeholders = [];

    for (const ticket of eventTickets) {
      placeholders.push("(?,?,?)");
      values.push(cartId, ticket.eventTicketId, ticket.quantity);
    }

    const sql = `
      INSERT INTO carttickets (cart_id, event_ticket_id, quantity)
      VALUES ${placeholders.join(",")}
    `;

    const [result] = await pool.query(sql, values);
    return result;
  }

//   async getCartTicketsRepo(attendeeId) {
//     const sql = `
//         SELECT 
//             ct.id AS cartTicketId,
//             ct.quantity,
//             e.name AS eventName,
//             e.description AS eventDescription,
//             e.image_url AS imageUrl,
//             e.date AS eventDate,
//             CONCAT(va.start_time, ' - ', va.end_time) AS startEndTime,
//             v.name AS venueName,
//             et.name AS eventType,
//             tt.name AS ticketTypeName,
//             etk.price AS ticketPrice
//         FROM CartTickets ct
//         JOIN Carts c ON ct.cart_id = c.id
//         JOIN EventTickets etk ON ct.event_ticket_id = etk.id
//         JOIN Events e ON etk.event_id = e.id
//         JOIN VenueAvailability va ON e.venue_availability_id = va.id
//         JOIN Venues v ON va.venue_id = v.id
//         JOIN EventTypes et ON e.event_type_id = et.id
//         JOIN TicketTypes tt ON etk.ticket_type_id = tt.id
//         WHERE c.attendee_id = ?
//     `;

//     const [result] = await pool.query(sql, [attendeeId]);
//     return result;
// }


// async getCartTicketsRepo(attendeeId) {
//     const sql = `
//         SELECT *
//         FROM CartTicketsView
//         WHERE attendee_id = ?
//         ORDER BY eventName, ticketTypeName
//     `;

//     const [rows] = await pool.query(sql, [attendeeId]);

//     const eventsMap = {};

//     rows.forEach(row => {
//         if (!eventsMap[row.eventName]) {
//             eventsMap[row.eventName] = {
//                 eventName: row.eventName,
//                 eventDescription: row.eventDescription,
//                 imageUrl: row.imageUrl,
//                 eventDate: row.eventDate,
//                 startEndTime: row.startEndTime,
//                 venueName: row.venueName,
//                 eventType: row.eventType,
//                 tickets: [],
//                 totalEventPrice: 0 // Initialize total sum per event
//             };
//         }

//         const ticketTotalPrice = parseFloat(row.totalPrice);

//         eventsMap[row.eventName].tickets.push({
//             cartTicketId: row.cartTicketId,
//             ticketTypeName: row.ticketTypeName,
//             quantity: row.quantity,
//             ticketPrice: row.ticketPrice,
//             totalPrice: row.totalPrice
//         });

//         // Accumulate total price for this event
//         eventsMap[row.eventName].totalEventPrice += ticketTotalPrice;
//     });

//     // Convert map to array and format totalEventPrice to string with 2 decimals
//     const data = Object.values(eventsMap).map(event => ({
//         ...event,
//         totalEventPrice: event.totalEventPrice.toFixed(2)
//     }));

//     return data;
// }

async getCartTicketsRepo(attendeeId) {
    const sql = `
        SELECT *
        FROM CartTicketsView
        WHERE attendee_id = ?
        ORDER BY eventName, ticketTypeName
    `;

    const [rows] = await pool.query(sql, [attendeeId]);

    const eventsMap = {};

    rows.forEach(row => {
        if (!eventsMap[row.eventName]) {
            eventsMap[row.eventName] = {
                eventName: row.eventName,
                eventDescription: row.eventDescription,
                imageUrl: row.imageUrl,
                eventDate: row.eventDate,
                startEndTime: row.startEndTime,
                venueName: row.venueName,
                eventType: row.eventType,
                tickets: [],
                totalEventPrice: 0
            };
        }

        const ticketTotalPrice = parseFloat(row.totalPrice);

        eventsMap[row.eventName].tickets.push({
            cartTicketId: row.cartTicketId,
            ticketTypeName: row.ticketTypeName,
            quantity: row.quantity,
            ticketPrice: row.ticketPrice,
            totalPrice: row.totalPrice
        });

        eventsMap[row.eventName].totalEventPrice += ticketTotalPrice;
    });

    // Convert map to array and format totalEventPrice
    const data = Object.values(eventsMap).map(event => ({
        ...event,
        totalEventPrice: event.totalEventPrice.toFixed(2)
    }));

    // Calculate grand total for all events
    const grandTotal = data.reduce((sum, event) => sum + parseFloat(event.totalEventPrice), 0).toFixed(2);

    return {
        data,
        totalCartPrice: grandTotal
    };
}

async deleteEventCartRepo(cartId,cartTicketId) {
  let sql = 'DELETE FROM carttickets WHERE cart_id = ? AND id = ?';
  const [result]  = await pool.query(sql,[cartId,cartTicketId]);
  return result;



}

  async getEventTicketIdByCartTicketId(cartTicketId){
        let sql = 'SELECT event_ticket_id AS eventTicketId FROM carttickets WHERE id = ?';
        const [result]  = await pool.query(sql,[cartTicketId]);
        return result[0]?.eventTicketId;
  }

  async deleteCartTicketsRepo(cartId) {
    const sql = 'DELETE FROM Carttickets WHERE cart_id = ?';
    const[result] = await pool.query(sql,[cartId]);
    return result;
  }

 




}

module.exports = CartTicketsRepository;