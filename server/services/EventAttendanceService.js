const BookingTicketsRepository = require("../repositories/BookingTicketsRepository");
const EventAttendanceRepository = require("../repositories/EventAttendenceRepository");
const EventRepository = require("../repositories/EventRepository");
const TicketsRepository = require("../repositories/TicketsRepository");
const HttpError = require("../utils/HttpError");

class EventAttendanceService {
    constructor() {
        this.eventAttendanceRepo = new EventAttendanceRepository();
        this.ticketsRepo = new TicketsRepository();
        this.bookingTicketRepo = new BookingTicketsRepository();
        this.eventRepo = new EventRepository();
    }

    // async insertEventAttendanceService(bookingTicketId) {
    //     const ticketId = await this.ticketsRepo.getTicketIdByBookingTicketId(bookingTicketId);
    //     const eventId = await this.bookingTicketRepo.getEventIdByBookingTicketId(bookingTicketId);

    //     if (!ticketId || !eventId) {
    //         throw new HttpError('Invalid ticket', 404);
    //     }

    //     const attendeeAttendanceExists = await this.eventAttendanceRepo.checkAttendeeAttendanceExists(eventId, ticketId);

    //     if (attendeeAttendanceExists) {
    //         throw new HttpError('Attendee already checked in', 409);
    //     }

    //     const checkInTime = new Date();

    //     const result = await this.eventAttendanceRepo.insertEventAttendanceRepo({
    //         eventId,
    //         ticketId,
    //         checkInTime
    //     });

    //     return { id: result.insertId };
    // }



      async insertEventAttendanceService(ticketCode) {
    const ticket = await this.ticketsRepo.getTicketByCode(ticketCode);

    if (!ticket) {
      throw new HttpError("Invalid ticket", 404);
    }

    const ticketId = ticket.id;
    const eventId = ticket.event_id;


    const alreadyCheckedIn =
      await this.eventAttendanceRepo.checkAttendanceExists(eventId, ticketId);

    if (alreadyCheckedIn) {
      throw new HttpError("Ticket already checked in", 409);
    }

    // 3️⃣ Insert attendance
    const result = await this.eventAttendanceRepo.insertEventAttendanceRepo({
      eventId,
      ticketId,
      checkInTime: new Date()
    });

    return {
      attendanceId: result.insertId,
      ticketId,
      eventId
    };
  }

    async getFinishedOrganizerEventNamesService(organizerId) {
        if (!organizerId) {
            throw new HttpError("Organizer ID is required", 400);
        }
        return await this.eventAttendanceRepo.getFinishedOrganizerEventNamesRepo(organizerId);
    }

    async getAttendedAttendeesByEventService(eventId) {
        if (!eventId) {
            throw new HttpError("Event ID is required", 400);
        }

        return await this.eventAttendanceRepo.getAttendedAttendeesByEventRepo(eventId);
    }

    async getUnattendedAttendeesByEventService(eventId) {
        if (!eventId) {
            throw new HttpError("Event ID is required", 400);
        }

        return await this.eventAttendanceRepo.getUnattendedAttendeesByEventRepo(eventId);
    }

    async getAttendanceSummaryService(eventId) {
        if (!eventId) {
            throw new HttpError("Event ID is required", 400);
        }

        // as requested: service method calls 2 repository methods
        const attendedCount = await this.eventAttendanceRepo.getAttendedAttendeesCountRepo(eventId);
        const unattendedCount = await this.eventAttendanceRepo.getUnattendedAttendeesCountRepo(eventId);

        const total = attendedCount + unattendedCount;

        return {
            attendedCount,
            unattendedCount,
            total,
            attendedPercentage: total > 0 ? Number(((attendedCount / total) * 100).toFixed(2)) : 0,
            unattendedPercentage: total > 0 ? Number(((unattendedCount / total) * 100).toFixed(2)) : 0,
        };
    }





 async getEventAttendancePieChart(eventName) {
  const eventId = await this.eventRepo.getEventIdByName(eventName);
  if(!eventId) {
    throw new HttpError('Event does not exists');
  }

  const attendedResult = await this.eventAttendanceRepo.countEventAttendance(eventId);
  const nonAttendedResult = await this.eventAttendanceRepo.countNonAttendedTicketsByEvent(eventId);

  const attended = attendedResult.attendanceCount || 0;
  const nonAttended = nonAttendedResult.nonAttendedCount || 0;

  const total = attended + nonAttended;

  const attendedPercentage = total ? (attended / total) * 100 : 0;
  const nonAttendedPercentage = total ? (nonAttended / total) * 100 : 0;

  return {
    chart: {
      attended: Number(attendedPercentage.toFixed(2)),
      nonAttended: Number(nonAttendedPercentage.toFixed(2)),
    }
  };
}
}

module.exports = EventAttendanceService;