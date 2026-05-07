// // ticketsRepo.js
// const pool = require("../config/database");

// class TicketsRepository {
//     constructor() {}

//     // Insert a new ticket with QR and ticketCode
//     async insertTicketRepo(orderTicketId, qrCode, ticketCode) {
//         const sql = `
//             INSERT INTO Tickets (order_ticket_id, qr_code, ticket_code)
//             VALUES (?, ?, ?)
//         `;
//         return pool.query(sql, [orderTicketId, qrCode, ticketCode]);
//     }

//     // Get a ticket by ticketCode
//     async getTicketByCode(ticketCode) {
//         const sql = `
//             SELECT * FROM Tickets
//             WHERE ticket_code = ?
//         `;
//         const [rows] = await pool.query(sql, [ticketCode]);
//         return rows[0];
//     }

//     // Update ticket status (e.g., active -> used)
//     async updateTicketStatus(ticketId, statusId) {
//         const sql = `
//             UPDATE Tickets
//             SET status_id = ?
//             WHERE id = ?
//         `;
//         return pool.query(sql, [statusId, ticketId]);
//     }
// }

// module.exports = TicketsRepository;





// const pool = require("../config/database");

// class TicketsRepository {
//   constructor() {}

//   // Insert a new ticket for booking (bookingTicketId, not orderTicketId)
//   async insertTicketRepo(bookingTicketId, qrCode, ticketCode) {
//     const sql = `
//       INSERT INTO Tickets
//       (booking_ticket_id, qr_code, ticket_code)
//       VALUES (?, ?, ?)
//     `;
//     // Note: order_ticket_id is still the column name, maps to BookingTickets
//     const [result] = await pool.query(sql, [bookingTicketId, qrCode, ticketCode]);
//     return result;
//   }

//   // Get ticket by ticketCode
//   async getTicketByCode(ticketCode) {
//     const sql = `
//       SELECT 
//         id AS ticketId,
//         booking_ticket_id AS bookingTicketId,
//         qr_code AS qrCode,
//         ticket_code AS ticketCode,
//         status_id AS statusId,
//         created_at AS createdAt
//       FROM Tickets
//       WHERE ticket_code = ?
//     `;
//     const [rows] = await pool.query(sql, [ticketCode]);
//     return rows[0];
//   }

//   // Update ticket status
//   async updateTicketStatus(ticketId, statusId) {
//     const sql = `
//       UPDATE Tickets
//       SET status_id = ?
//       WHERE id = ?
//     `;
//     const [result] = await pool.query(sql, [statusId, ticketId]);
//     return result;
//   }
// }

// module.exports = TicketsRepository;







const pool = require("../config/database");

class TicketsRepository {
  constructor() {}

  /**
   * Insert a new ticket for a BookingTicket
   * @param {number} bookingTicketId
   * @param {string} qrCode
   * @param {string} ticketCode
   */
  async insertTicketRepo(bookingTicketId, qrCode, ticketCode) {
    const sql = `
      INSERT INTO Tickets
        (booking_ticket_id, qr_code, ticket_code)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(sql, [bookingTicketId, qrCode, ticketCode]);
    return result;
  }

  /**
   * Get a ticket by QR/ticket code
   * @param {string} ticketCode
   */
  // async getTicketByCode(ticketCode) {
  //   const sql = `
  //     SELECT 
  //       id AS ticketId,
  //       booking_ticket_id AS bookingTicketId,
  //       qr_code AS qrCode,
  //       ticket_code AS ticketCode,
  //       status_id AS statusId,
  //       created_at AS createdAt
  //     FROM Tickets
  //     WHERE ticket_code = ?
  //   `;
  //   const [rows] = await pool.query(sql, [ticketCode]);
  //   return rows[0];
  // }


async getTicketByCode(ticketCode) {
  const sql = `
    SELECT 
      t.id,
      t.ticket_code,
      bt.event_ticket_id,
      et.event_id
    FROM tickets t
    JOIN bookingtickets bt ON bt.id = t.booking_ticket_id
    JOIN eventtickets et ON et.id = bt.event_ticket_id
    WHERE t.ticket_code = ?
  `;

  const [rows] = await pool.query(sql, [ticketCode]);
  return rows[0];
}

  /**
   * Update ticket status (e.g., active -> used)
   * @param {number} ticketId
   * @param {number} statusId
   */
  async updateTicketStatus(ticketId, statusId) {
    const sql = `
      UPDATE Tickets
      SET status_id = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [statusId, ticketId]);
    return result;
  }

  async getTicketIdByBookingTicketId(bookingTicketId){
    const sql = 'SELECT id FROM tickets WHERE booking_ticket_id = ?';
    const [result] = await pool.query(sql,[bookingTicketId]);
    return result[0]?.id;
  }
}

module.exports = TicketsRepository;

