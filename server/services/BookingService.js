// const BookingRepository = require("../repositories/BookingRepository");
// const BookingTicketsRepository = require("../repositories/BookingTicketsRepository");
// const EventTicketsRepository = require("../repositories/EventTicketsRepository");
// const TicketsRepository = require("../repositories/TicketsRepository");

// const pool = require("../config/database"); // for transaction
// const HttpError = require("../utils/HttpError");
// const QRCode = require("qrcode");

// class BookingService {

//   constructor() {
//     this.bookingRepo = new BookingRepository();
//     this.bookingTicketsRepo = new BookingTicketsRepository();
//     this.eventTicketsRepo = new EventTicketsRepository();
//     this.ticketRepo = new TicketsRepository();
//   }

//   async createBookingService(attendeeId, eventId, tickets) {

//     if (!tickets || tickets.length === 0) {
//       throw new HttpError("No tickets selected", 400);
//     }

//     let connection;
//     try {
//       // Start transaction
//       connection = await pool.getConnection();
//       await connection.beginTransaction();

//       let totalPrice = 0;

//       // 1️⃣ Calculate total price & check availability
//       for (let i = 0; i < tickets.length; i++) {
//         const ticket = tickets[i];

//         const eventTicket = await this.eventTicketsRepo.getEventTicketById(ticket.eventTicketId);

//         if (!eventTicket) {
//           throw new HttpError(`Event ticket not found: ${ticket.eventTicketId}`, 404);
//         }

//         if (eventTicket.quantityAvailable < ticket.quantity) {
//           throw new HttpError(
//             `Not enough tickets available for ticket ID: ${ticket.eventTicketId}`,
//             400
//           );
//         }

//         totalPrice += eventTicket.price * ticket.quantity;
//       }

//       // 2️⃣ Create booking
//       const booking = await this.bookingRepo.insertBookingRepository(attendeeId, eventId, totalPrice);
//       const bookingId = booking.insertId;

//       // 3️⃣ Insert booking tickets and generate tickets
//       for (let i = 0; i < tickets.length; i++) {
//         const ticket = tickets[i];
//         const eventTicket = await this.eventTicketsRepo.getEventTicketById(ticket.eventTicketId);

//         // Insert into bookingTickets
//         const bookingTicket = await this.bookingTicketsRepo.insertBookingTicketRepo(
//           bookingId,
//           ticket.eventTicketId,
//           ticket.quantity,
//           eventTicket.price
//         );

//         const bookingTicketId = bookingTicket.insertId;

//         // Generate tickets (QR + ticketCode)
//         for (let k = 0; k < ticket.quantity; k++) {
//           const ticketCode = `${bookingTicketId}-${k + 1}`;
//           const validationLink = `http://localhost:3010/validateTicket/${ticketCode}`;
//           const qrImage = await QRCode.toDataURL(validationLink);

//           await this.ticketRepo.insertTicketRepo(bookingTicketId, qrImage, ticketCode);
//         }

//         // Update quantity_available and quantity_sold
//         const newAvailable = eventTicket.quantityAvailable - ticket.quantity;
//         await this.eventTicketsRepo.updateQuantityAvailableRepo(ticket.eventTicketId, newAvailable);
//         await this.eventTicketsRepo.updateQuantitySoldRepo(ticket.eventTicketId, ticket.quantity);
//       }

//       // Commit transaction
//       await connection.commit();
//       connection.release();

//       return { bookingId, totalPrice };

//     } catch (error) {
//       // Rollback transaction if anything fails
//       if (connection) {
//         await connection.rollback();
//         connection.release();
//       }
//       throw error;
//     }
//   }
// }

// module.exports = BookingService;




const BookingRepository = require("../repositories/BookingRepository");
const BookingTicketsRepository = require("../repositories/BookingTicketsRepository");
const EventTicketsRepository = require("../repositories/EventTicketsRepository");
const TicketsRepository = require("../repositories/TicketsRepository");

const pool = require("../config/database");
const HttpError = require("../utils/HttpError");
const QRCode = require("qrcode");
const EventRepository = require("../repositories/EventRepository");

class BookingService {

  constructor() {
    this.bookingRepo = new BookingRepository();
    this.bookingTicketsRepo = new BookingTicketsRepository();
    this.eventTicketsRepo = new EventTicketsRepository();
    this.ticketRepo = new TicketsRepository();
    this.eventRepo = new EventRepository();
  }

  // async createBookingService(attendeeId, eventId, tickets) {

  //   if (!tickets || tickets.length === 0) {
  //     throw new HttpError("No tickets selected", 400);
  //   }

  //   let connection;
  //   try {
  //     // Start transaction
  //     connection = await pool.getConnection();
  //     await connection.beginTransaction();

  //     let totalPrice = 0;

  //     // 1️⃣ Check availability & calculate total
  //     for (const ticket of tickets) {
  //       const eventTicket = await this.eventTicketsRepo.getEventTicketById(ticket.eventTicketId);

  //       if (!eventTicket) {
  //         throw new HttpError(`Event ticket not found: ${ticket.eventTicketId}`, 404);
  //       }

  //       if (eventTicket.quantityAvailable < ticket.quantity) {
  //         throw new HttpError(
  //           `Not enough tickets available for ticket ID: ${ticket.eventTicketId}`,
  //           400
  //         );
  //       }

  //       totalPrice += eventTicket.price * ticket.quantity;
  //     }

  //     // 2️⃣ Create booking
  //     const booking = await this.bookingRepo.insertBookingRepository(attendeeId, eventId, totalPrice);
  //     const bookingId = booking.insertId;

  //     // 3️⃣ Insert booking tickets and generate ONE QR per ticket type
  //     for (const ticket of tickets) {
  //       const eventTicket = await this.eventTicketsRepo.getEventTicketById(ticket.eventTicketId);

  //       // Insert BookingTicket (quantity kept for reference)
  //       const bookingTicket = await this.bookingTicketsRepo.insertBookingTicketRepo(
  //         bookingId,
  //         ticket.eventTicketId,
  //         ticket.quantity,
  //         eventTicket.price
  //       );

  //       const bookingTicketId = bookingTicket.insertId;

  //       // 4️⃣ Generate ONE QR for this BookingTicket
  //       const ticketCode = `BT-${bookingTicketId}`; // BT = BookingTicket
  //       const validationLink = `http://localhost:5173/organizer/validateTicket/${ticketCode}`;
  //       const qrImage = await QRCode.toDataURL(validationLink);

  //       // Insert single ticket record
  //       await this.ticketRepo.insertTicketRepo(
  //         bookingTicketId,
  //         qrImage,
  //         ticketCode
  //       );

  //       // 5️⃣ Update quantities
  //       const newAvailable = eventTicket.quantityAvailable - ticket.quantity;
  //       await this.eventTicketsRepo.updateQuantityAvailableRepo(ticket.eventTicketId, newAvailable);
  //       await this.eventTicketsRepo.updateQuantitySoldRepo(ticket.eventTicketId, ticket.quantity);
  //     }

  //     // Commit transaction
  //     await connection.commit();
  //     connection.release();

  //     return { bookingId, totalPrice };

  //   } catch (error) {
  //     if (connection) {
  //       await connection.rollback();
  //       connection.release();
  //     }
  //     throw error;
  //   }
  // }


  async createBookingService(attendeeId, eventId, tickets) {

  if (!tickets || tickets.length === 0) {
    throw new HttpError("No tickets selected", 400);
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let totalPrice = 0;

    // 1️⃣ Check availability & calculate total
    for (const ticket of tickets) {
      const eventTicket = await this.eventTicketsRepo.getEventTicketById(ticket.eventTicketId);

      if (!eventTicket) {
        throw new HttpError(`Event ticket not found: ${ticket.eventTicketId}`, 404);
      }

      if (eventTicket.quantityAvailable < ticket.quantity) {
        throw new HttpError(
          `Not enough tickets available for ticket ID: ${ticket.eventTicketId}`,
          400
        );
      }

      totalPrice += eventTicket.price * ticket.quantity;
    }

    // 2️⃣ Create booking
    const booking = await this.bookingRepo.insertBookingRepository(
      attendeeId,
      eventId,
      totalPrice
    );

    const bookingId = booking.insertId;

    // 3️⃣ Insert booking tickets + generate QR per person
    for (const ticket of tickets) {
      const eventTicket = await this.eventTicketsRepo.getEventTicketById(ticket.eventTicketId);

      const bookingTicket = await this.bookingTicketsRepo.insertBookingTicketRepo(
        bookingId,
        ticket.eventTicketId,
        ticket.quantity,
        eventTicket.price
      );

      const bookingTicketId = bookingTicket.insertId;

      // 4️⃣ Generate ONE QR per person (FIXED slightly)
      for (let i = 0; i < ticket.quantity; i++) {

        const ticketCode = `T-${bookingTicketId}-${i}-${Date.now()}`;

        const validationLink =
          `http://localhost:5173/organizer/validateTicket/${ticketCode}`;

        const qrImage = await QRCode.toDataURL(validationLink);

        await this.ticketRepo.insertTicketRepo(
          bookingTicketId,
          qrImage,
          ticketCode
        );
      }

      // 5️⃣ Update quantities
      const newAvailable = eventTicket.quantityAvailable - ticket.quantity;
      await this.eventTicketsRepo.updateQuantityAvailableRepo(
        ticket.eventTicketId,
        newAvailable
      );

      await this.eventTicketsRepo.updateQuantitySoldRepo(
        ticket.eventTicketId,
        ticket.quantity
      );
    }

    await connection.commit();
    connection.release();

    return { bookingId, totalPrice };

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    throw error;
  }
}



async deleteBookingService(eventName,bookingId) {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    

    const eventEnded = await this.eventRepo.checkEventEnded(eventName);
    if(eventEnded) {
      throw new HttpError('Event has ended. Failed to delete booking');
    }
    const bookingTicketsArr =
      await this.bookingTicketsRepo.getBookingTicketsByBookingId(bookingId);

    for (let i = 0; i < bookingTicketsArr.length; i++) {

      const quantities =
        await this.eventTicketsRepo.getQuantitiesEventTickets(
          bookingTicketsArr[i].event_ticket_id
        );

      const updatedQuantityAvailable =
        quantities.quantity_available + bookingTicketsArr[i].quantity;

      const updatedQuantitySold =
        Math.max(0, quantities.quantity_sold - bookingTicketsArr[i].quantity);

      await this.eventTicketsRepo.setQuantityAvailableById(
        bookingTicketsArr[i].event_ticket_id,
        updatedQuantityAvailable
      );

      await this.eventTicketsRepo.setQuantitySoldById(
        bookingTicketsArr[i].event_ticket_id,
        updatedQuantitySold
      );
    }

    await this.bookingRepo.deleteBookingRepo(bookingId);

    await connection.commit();
    connection.release();

  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    throw error;
  }
}

  async getBookingsByAttendeeIdService(attendeeId) {
    return await this.bookingRepo.getBookingsByAttendeeIdRepo(attendeeId);
  }


}

module.exports = BookingService;