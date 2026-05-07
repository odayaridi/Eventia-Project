// // ticketsService.js
// const EventAttendanceRepository = require("../repositories/EventAttendenceRepository");
// const TicketsRepository = require("../repositories/TicketsRepository");

// const HttpError = require("../utils/HttpError"); // your custom error handler

// class TicketsService {
//     constructor() {
//         this.ticketsRepo = new TicketsRepository();
//         this.eventAttendanceRepo = new EventAttendanceRepository();
//     }

//     // // Validate ticket by ticketCode
//     // async validateTicket(ticketCode) {
//     //     if (!ticketCode) {
//     //         throw new HttpError("Ticket code is required", 400);
//     //     }

//     //     // 1️⃣ Get ticket from DB
//     //     const ticket = await this.ticketsRepo.getTicketByCode(ticketCode);

//     //     if (!ticket) {
//     //         throw new HttpError("Ticket not found", 404);
//     //     }

//     //     // 2️⃣ Check if ticket is already used or cancelled
//     //     if (ticket.status_id !== 1) { // 1 = active
//     //         throw new HttpError("Ticket already used or cancelled", 400);
//     //     }

//     //     // 3️⃣ Mark ticket as used
//     //     await this.ticketsRepo.updateTicketStatus(ticket.id, 2); // 2 = used

//     //     // 4️⃣ Optional: register attendance
//     //     await this.eventAttendanceRepo.insert({
//     //         ticket_id: ticket.id,
//     //         event_id: ticket.event_id,
//     //         check_in_time: new Date()
//     //     });

//     //     return {
//     //         valid: true,
//     //         message: "Ticket validated successfully",
//     //         ticketCode: ticket.ticket_code,
//     //         eventId: ticket.event_id
//     //     };
//     // }

//     async validateTicket(ticketCode) {
//         if (!ticketCode) {
//             throw new HttpError("Ticket code is required", 400);
//         }

//         // 1️⃣ Get ticket
//         const ticket = await this.ticketsRepo.getTicketByCode(ticketCode);

//         if (!ticket) {
//             throw new HttpError("Ticket not found", 404);
//         }

//         // 2️⃣ Check ticket status
//         if (ticket.status_id !== 1) {
//             if (ticket.status_id == 2)
//                 throw new HttpError("Ticket already used", 400);
//             else {
//                 throw new HttpError("Ticket already cancelled", 400);
//             }
//         }


//         // 3️⃣ Check if already scanned
//         // const attendance = await this.eventAttendanceRepo.getAttendanceByTicket(ticket.id);

//         // if (attendance.length > 0) {
//         //     throw new HttpError("Ticket already scanned", 400);
//         // }

//         // 4️⃣ Mark ticket as used
//         await this.ticketsRepo.updateTicketStatus(ticket.id, 2);

//         // 5️⃣ Insert attendance
//         await this.eventAttendanceRepo.insert({
//             ticket_id: ticket.id,
//             event_id: ticket.event_id,
//             check_in_time: new Date()
//         });

//         return {
//             ticketCode: ticket.ticket_code,
//             eventId: ticket.event_id
//         };
//     }
// }

// module.exports = TicketsService;





const TicketsRepository = require("../repositories/TicketsRepository");
const BookingTicketsRepository = require("../repositories/BookingTicketsRepository");

const HttpError = require("../utils/HttpError"); // your custom error handler
const EventAttendanceRepository = require("../repositories/EventAttendenceRepository");

class TicketsService {
    constructor() {
        this.ticketsRepo = new TicketsRepository();
        this.bookingTicketsRepo = new BookingTicketsRepository();
        this.eventAttendanceRepo = new EventAttendanceRepository();
    }

    /**
     * Validate a ticket by its QR/ticket code
     * Supports multiple entries per QR up to purchased quantity
     * @param {string} ticketCode
     */
    async validateTicket(ticketCode) {
        if (!ticketCode) {
            throw new HttpError("Ticket code is required", 400);
        }

        // 1️⃣ Get ticket by QR/ticket code
        const ticket = await this.ticketsRepo.getTicketByCode(ticketCode);
        if (!ticket) {
            throw new HttpError("Ticket not found", 404);
        }

        // 2️⃣ Get BookingTicket to check quantity purchased
        const bookingTicket = await this.bookingTicketsRepo.getById(ticket.bookingTicketId);
        if (!bookingTicket) {
            throw new HttpError("Booking ticket not found", 404);
        }

        // 3️⃣ Count how many people have already checked in for this ticket
        const attendanceCount = await this.eventAttendanceRepo.countByTicket(ticket.ticketId);

        if (attendanceCount >= bookingTicket.quantity) {
            throw new HttpError(
                `All tickets for this QR have already been used`,
                400
            );
        }

        // 4️⃣ Mark attendance
        await this.eventAttendanceRepo.insert({
            ticketId: ticket.ticketId,
            eventId: bookingTicket.eventId,
            checkInTime: new Date()
        });

        return {
            ticketCode: ticket.ticketCode,
            eventId: bookingTicket.eventId,
            remainingEntries: bookingTicket.quantity - (attendanceCount + 1)
        };
    }
}

module.exports = TicketsService;