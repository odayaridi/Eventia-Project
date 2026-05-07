const BookingTicketsRepository = require("../repositories/BookingTicketsRepository");

class BookingTicketsService {
    constructor() {
        this.bookingTicketsRepo = new BookingTicketsRepository;
    }

    async getAttendeeBookingTicketsService(attendeeId) {
    return await this.bookingTicketsRepo.getAttendeeBookingTicketsRepo(attendeeId)
  }
}

module.exports = BookingTicketsService;