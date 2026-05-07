const BookingTicketsService = require("../services/BookingTicketsService");

class BookingTicketsController {
    constructor() {
        this.bookingTicketsService = new BookingTicketsService();
    }

    async getAttendeeBookingTicketsController(req, res, next) {
        try {
            const {attendeeId} = req.query;
            const data = await this.bookingTicketsService.getAttendeeBookingTicketsService(attendeeId);
            res.status(200).json({success:true,message: 'Attendee Bookings Tickets retrieved successfully' , data});
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BookingTicketsController;