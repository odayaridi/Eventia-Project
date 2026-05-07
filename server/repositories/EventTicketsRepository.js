// const pool = require("../config/database");

// class EventTicketsRepository {
//     constructor() {}

//     async createEventTicketRepo(eventTicket) {
//         const sql = `
//             INSERT INTO EventTickets
//             (event_id, ticket_type_id, name, perks, price, quantity_available)
//             VALUES (?, ?, ?, ?, ?, ?)
//         `;

//         const [result] = await pool.query(sql, [
//             eventTicket.eventId,
//             eventTicket.ticketTypeId || 1, // default if not provided
//             eventTicket.name,
//             eventTicket.perks,
//             eventTicket.price,
//             eventTicket.quantityAvailable
//         ]);

//         return result;
//     }

//  async updateEventTicketRepo(eventTicket) {
//     const sql = `
//         UPDATE EventTickets
//         SET 
//             ticket_type_id = ?,
//             name = ?,
//             perks = ?,
//             price = ?,
//             quantity_available = ?
//         WHERE id = ?
//     `;

//     const [result] = await pool.query(sql, [
//         eventTicket.ticketId,
//         eventTicket.name,
//         eventTicket.perks,
//         eventTicket.price,
//         eventTicket.quantityAvailable,
//         eventTicket.id  
//     ]);

//     return result;
// }

// async getEventTicketsRepo(organizerId, ticketTypeName, eventName, eventStatus) {

//     let sql = `
//         SELECT 
//             e.name AS eventName,
//             es.name AS eventStatus,
//             tt.name AS ticketType,
//             et.price,
//             et.perks,
//             et.quantity_available AS quantityAvailable,
//             et.quantity_sold AS quantitySold
//         FROM Events e
//         JOIN EventTickets et ON e.id = et.event_id
//         JOIN TicketTypes tt ON et.ticket_type_id = tt.id
//         JOIN EventStatus es ON e.status_id = es.id
//         WHERE e.organizer_id = ?
//     `;

//     const values = [organizerId];

//     // Optional filters
//     if (eventName) {
//         sql += ` AND e.name = ?`;
//         values.push(eventName);
//     }

//     if (ticketTypeName) {
//         sql += ` AND tt.name = ?`;
//         values.push(ticketTypeName);
//     }

//     if (eventStatus) {
//         sql += ` AND es.name = ?`;
//         values.push(eventStatus);
//     }

//     const [result] = await pool.query(sql, values);

//     return result;
// }


// async getEventTicketQuantityAvailableByPk(id){
//     const sql = 'SELECT quantity_available AS quantityAvailable FROM eventTickets WHERE id = ?';
//     const [result] = await pool.query(sql,[id]);
//     return result[0]?.quantityAvailable;
// }

// async updateQuantityAvailableRepo(id, newQuantity){
//     const sql = 'UPDATE eventtickets SET quantity_available = ? WHERE id = ?';
//     const [result] = await pool.query(sql,[newQuantity, id]);
//     return result;
// }

// async updateQuantitySoldRepo(id, soldQuantity){
//     const sql = 'UPDATE eventtickets SET quantity_sold = quantity_sold + ? WHERE id = ?';
//     const [result] = await pool.query(sql,[soldQuantity, id]);
//     return result;
// }

// }

// module.exports = EventTicketsRepository;




const pool = require("../config/database");

class EventTicketsRepository {
  constructor() {}

  // Create a new EventTicket
  async createEventTicketRepo(eventTicket) {
    const sql = `
      INSERT INTO EventTickets
      (event_id, ticket_type_id, name, perks, price, quantity_available)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      eventTicket.eventId,
      eventTicket.ticketTypeId || 1, // default to 1
      null,
      eventTicket.perks,
      eventTicket.price,
      eventTicket.quantityAvailable
    ]);
    return result;
  }

  // // Update an EventTicket
  // async updateEventTicketRepo(eventTicket) {
  //   const sql = `
  //     UPDATE EventTickets
  //     SET 
  //       ticket_type_id = ?,
  //       name = ?,
  //       perks = ?,
  //       price = ?,
  //       quantity_available = ?
  //     WHERE id = ?
  //   `;
  //   const [result] = await pool.query(sql, [
  //     eventTicket.ticketTypeId,
  //     eventTicket.name,
  //     eventTicket.perks,
  //     eventTicket.price,
  //     eventTicket.quantityAvailable,
  //     eventTicket.id
  //   ]);
  //   return result;
  // }


  // Update an EventTicket
async updateEventTicketRepo(eventTicket) {
  let sql = `UPDATE EventTickets SET `;
  const values = [];
  const fields = [];

  if (eventTicket.ticketTypeId !== undefined) {
    fields.push("ticket_type_id = ?");
    values.push(eventTicket.ticketTypeId);
  }

  if (eventTicket.perks !== undefined) {
    fields.push("perks = ?");
    values.push(eventTicket.perks);
  }

  if (eventTicket.price !== undefined) {
    fields.push("price = ?");
    values.push(eventTicket.price);
  }

  if (eventTicket.quantityAvailable !== undefined) {
    fields.push("quantity_available = ?");
    values.push(eventTicket.quantityAvailable);
  }

  sql += fields.join(", ");
  sql += " WHERE id = ?";

  values.push(eventTicket.eventTicketId);

  const [result] = await pool.query(sql, values);
  return result;
}

  // Get event tickets with optional filters, return camelCase
  // async getEventTicketsRepo({ organizerId, ticketTypeName, eventName, eventStatus }) {
  //   let sql = `
  //     SELECT 
  //       e.id AS eventId,
  //       e.name AS eventName,
  //       es.name AS eventStatus,
  //       tt.id AS ticketTypeId,
  //       tt.name AS ticketType,
  //       et.id AS eventTicketId,
  //       et.price AS price,
  //       et.perks AS perks,
  //       et.quantity_available AS quantityAvailable,
  //       et.quantity_sold AS quantitySold
  //     FROM Events e
  //     JOIN EventTickets et ON e.id = et.event_id
  //     JOIN TicketTypes tt ON et.ticket_type_id = tt.id
  //     JOIN EventStatus es ON e.status_id = es.id
  //     WHERE e.organizer_id = ?
  //   `;

  //   const values = [organizerId];

  //   if (eventName) {
  //     sql += ` AND e.name = ?`;
  //     values.push(eventName);
  //   }
  //   if (ticketTypeName) {
  //     sql += ` AND tt.name = ?`;
  //     values.push(ticketTypeName);
  //   }
  //   if (eventStatus) {
  //     sql += ` AND es.name = ?`;
  //     values.push(eventStatus);
  //   }

  //   const [rows] = await pool.query(sql, values);
  //   return rows;
  // }





  // Get event tickets with optional filters, return camelCase
  async getEventTicketsRepoo(organizerId) {
    let sql = `
      SELECT 
        e.id AS eventId,
        e.name AS eventName,
        es.name AS eventStatus,
        tt.id AS ticketTypeId,
        tt.name AS ticketType,
        et.id AS eventTicketId,
        et.price AS price,
        et.perks AS perks,
        et.quantity_available AS quantityAvailable,
        et.quantity_sold AS quantitySold
      FROM Events e
      JOIN EventTickets et ON e.id = et.event_id
      JOIN TicketTypes tt ON et.ticket_type_id = tt.id
      JOIN EventStatus es ON e.status_id = es.id
      WHERE e.organizer_id = ?
    `;

    const [rows] = await pool.query(sql, organizerId);
    return rows;
  }




  // Get a single EventTicket by ID (camelCase)
  async getEventTicketById(id) {
    const sql = `
      SELECT 
        id AS eventTicketId,
        event_id AS eventId,
        ticket_type_id AS ticketTypeId,
        name,
        perks,
        price,
        quantity_available AS quantityAvailable,
        quantity_sold AS quantitySold
      FROM EventTickets
      WHERE id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0];
  }




  

  // Get quantity available by ticket ID
  async getEventTicketQuantityAvailableByPk(id) {
    const sql = `
      SELECT quantity_available AS quantityAvailable
      FROM EventTickets
      WHERE id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows[0]?.quantityAvailable;
  }

  // Update quantity_available
  async updateQuantityAvailableRepo(id, newQuantity) {
    const sql = `
      UPDATE EventTickets
      SET quantity_available = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [newQuantity, id]);
    return result;
  }

  // Increment quantity_sold
  async updateQuantitySoldRepo(id, soldQuantity) {
    const sql = `
      UPDATE EventTickets
      SET quantity_sold = quantity_sold + ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [soldQuantity, id]);
    return result;
  }

















  async geEventTicketByEventAndType(eventId, ticketTypeId) {
    const sql = `
        SELECT * FROM EventTickets
        WHERE event_id = ? AND ticket_type_id = ?
        LIMIT 1
    `;
    const [rows] = await pool.query(sql, [eventId, ticketTypeId]);
    return rows[0]; // undefined if no match
}








async getTotalAvailableSeatsByEventRepo(eventId) {
    const sql = `
        SELECT SUM(quantity_available) AS totalAvailable
        FROM EventTickets
        WHERE event_id = ?
    `;

    const [rows] = await pool.query(sql, [eventId]);

    return Number(rows[0]?.totalAvailable || 0);
}



async getTotalTicketQuantityByEvent(eventId) {
  const sql = `
    SELECT SUM(quantity_available) AS total
    FROM EventTickets
    WHERE event_id = ?
  `;
  const [rows] = await pool.query(sql, [eventId]);
  return Number(rows[0]?.total || 0);
}

async getQuantitiesEventTickets(eventTicketId){
  const sql = 'SELECT quantity_available  , quantity_sold FROM eventtickets where id = ?';
  const [result] = await pool.query(sql,[eventTicketId]);
  return result[0];
}



// Set quantity_available by ticket ID
async setQuantityAvailableById(eventTicketId, quantityAvailable) {
  const sql = `
    UPDATE EventTickets
    SET quantity_available = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [quantityAvailable, eventTicketId]);
  return result;
}

// Set quantity_sold by ticket ID
async setQuantitySoldById(eventTicketId, quantitySold) {
  const sql = `
    UPDATE EventTickets
    SET quantity_sold = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [quantitySold, eventTicketId]);
  return result;
}




async getEventsTotalTicketsQuantitiesRepo() {
  const sql = `
    SELECT 
      e.name AS eventName,
      t.eventId,
      t.sumQuantitySold,
      t.sumQuantityAvailable
    FROM events e
    JOIN (
      SELECT 
        et.event_id AS eventId,
        SUM(et.quantity_sold) AS sumQuantitySold,
        SUM(et.quantity_available) AS sumQuantityAvailable
      FROM eventtickets et
      GROUP BY et.event_id
    ) t ON e.id = t.eventId
    WHERE TIMESTAMP(e.date, e.end_time) < NOW()
  `;

  const [result] = await pool.query(sql);
  return result;
}



async 

}




















module.exports = EventTicketsRepository;