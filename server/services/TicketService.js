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
        
        const ticket = await this.ticketsRepo.getTicketByCode(ticketCode);
        if (!ticket) {
            throw new HttpError("Ticket not found", 404);
        }

        const bookingTicket = await this.bookingTicketsRepo.getById(ticket.bookingTicketId);
        if (!bookingTicket) {
            throw new HttpError("Booking ticket not found", 404);
        }

   
        const attendanceCount = await this.eventAttendanceRepo.countByTicket(ticket.ticketId);

        if (attendanceCount >= bookingTicket.quantity) {
            throw new HttpError(
                `All tickets for this QR have already been used`,
                400
            );
        }

        
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