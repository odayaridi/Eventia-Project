const EventAttendanceService = require("../services/EventAttendanceService");

class EventAttendanceController {
    constructor() {
        this.eventAttendanceService = new EventAttendanceService();
    }

    // async insertEventAttendanceController(req, res, next) {
    //     try {
    //         const { bookingTicketId } = req.body;
    //         const data = await this.eventAttendanceService.insertEventAttendanceService(bookingTicketId);

    //         res.status(201).json({
    //             success: true,
    //             message: 'Attendee checked in successfully',
    //             data
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }



    async insertEventAttendanceController(req, res, next) {
  try {
    const { ticketCode } = req.body;

    const data = await this.eventAttendanceService.insertEventAttendanceService(ticketCode);

    res.status(201).json({
      success: true,
      message: "Attendee checked in successfully",
      data
    });

  } catch (error) {
    next(error);
  }
}



    async getFinishedOrganizerEventNamesController(req, res, next) {
        try {
            const { organizerId } = req.query;
            const data = await this.eventAttendanceService.getFinishedOrganizerEventNamesService(Number(organizerId));

            res.status(200).json({
                success: true,
                message: data.length > 0
                    ? "Finished event names fetched successfully"
                    : "No finished events found for this organizer",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getAttendedAttendeesByEventController(req, res, next) {
        try {
            const { eventId } = req.query;
            const data = await this.eventAttendanceService.getAttendedAttendeesByEventService(Number(eventId));

            res.status(200).json({
                success: true,
                message: data.length > 0
                    ? "Attended attendees fetched successfully"
                    : "No attended attendees found for this event",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getUnattendedAttendeesByEventController(req, res, next) {
        try {
            const { eventId } = req.query;
            const data = await this.eventAttendanceService.getUnattendedAttendeesByEventService(Number(eventId));

            res.status(200).json({
                success: true,
                message: data.length > 0
                    ? "Unattended attendees fetched successfully"
                    : "No unattended attendees found for this event",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getAttendanceSummaryController(req, res, next) {
        try {
            const { eventId } = req.query;
            const data = await this.eventAttendanceService.getAttendanceSummaryService(Number(eventId));

            res.status(200).json({
                success: true,
                message: "Attendance summary fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }


    async getEventAttendancePieChartController(req, res, next) {
  try {
    const { eventName } = req.params;

    const data = await this.eventAttendanceService.getEventAttendancePieChart(eventName);

    res.status(200).json({
      success: true,
      message: "Event attendance statistics fetched successfully",
      data
    });

  } catch (error) {
    next(error);
  }
}

}

module.exports = EventAttendanceController;