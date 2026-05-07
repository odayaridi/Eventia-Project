const EventService = require("../services/EventService");

class EventController {
    constructor() {
        this.eventService = new EventService();
    }


    
// {
//   "name": "Heat Festival",
//   "organizerId" : 1,
//   "description": "A fun heat festival with live music, food stalls, and family activities.",
//   "eventType": "Music Festival",
//   "venueName": "Grand Ballroom",
//   "capacity": 232,
//   "date": "2026-03-15",
//   "startTime": "09:00:00",
//   "endTime": "17:00:00",
//   "imageUrl": "https://example.com/images/spring-music-festival.jpg"
// }

    // async createEventController(req,res,next){
    //     try {
    //         await this.eventService.createEventService(req.body);
    //         res.status(201).json({success:"true",message:"Event created successfully"})
    //     } catch (error) {
    //         next(error);
    //     }
    // }



    async createEventController(req, res, next) {
    try {
        const eventData = req.body;

        // 👇 Get uploaded image
        if (req.file) {
            eventData.imageUrl = req.file.filename;
        }

        await this.eventService.createEventService(eventData);

        res.status(201).json({
            success: true,
            message: "Event created successfully"
        });

    } catch (error) {
        next(error);
    }
}

    
// {
//     "eventId" : 1,
//     "venueAvailabilityId": 2
// }

    async approveEventVenueRequestController(req,res,next){
        try {
            const {eventId, venueAvailabilityId} = req.body;
            const data = await this.eventService.approveEventVenueRequestService(eventId,venueAvailabilityId);
           
            res.status(200).json({success:"true",message:"Event approved successfully by the venue manager",data})
        } catch (error) {
            next(error);
        }
    }



    
// {
//     "eventId" : 1,
//     "venueAvailabilityId": 2
// }
    async rejectEventVenueRequestController(req,res,next){
         try {
            const {eventId, venueAvailabilityId} = req.body;
            await this.eventService.rejectEventVenueRequestService(eventId,venueAvailabilityId);
            res.status(200).json({success:"true",message:"Event rejected successfully by the venue manager"})
        } catch (error) {
            next(error);
        }
    }


    // /:organizerId

    async getEventNamesController(req,res,next) {
        try {
            const {organizerId} = req.params;
            const data = await this.eventService.getEventNamesService(organizerId);
            res.status(200).json({success:"true",message:"Event Names retrieved successfully",data})
        } catch (error) {
            next(error)
        }
    }


       async getUpcomingEventNamesController(req,res,next) {
        try {
            const {organizerId} = req.params;
            const data = await this.eventService.getUpcomingEventNamesService(organizerId);
            res.status(200).json({success:"true",message:"Event Names retrieved successfully",data})
        } catch (error) {
            next(error)
        }
    }




      async getEndedEventNamesController(req,res,next) {
          try {
            const {organizerId} = req.params;
            const data = await this.eventService.getEndedEventNamesService(organizerId);
            res.status(200).json({success:"true",message:"Ended Event Names retrieved successfully",data})
        } catch (error) {
            next(error)
        }
        }





    //http://localhost:3010/api/event/filterEvents?eventName=Activity Conference
    async filterEventsController(req,res,next) {
        try {
            const filters = req.query;
            const data = await this.eventService.filterEventsService(filters);
            let message;
            if(data.length == 0){
                message = 'No events exist'
            }
            else {
                message = 'Events retrieved successfully'
            }
            res.status(200).json({success:"true",message,data})
        } catch (error) {
            next(error)
        }
    }


    async getEventsByOrganizer(req, res, next) {
    try {
        const { organizerId } = req.params;

        const events = await this.eventService.getEventsByOrganizerService(organizerId);

        res.status(200).json({
            success: true,
            message: 'Event(s) retrieved successfully',
            data: events
        });

    } catch (error) {
        next(error);
    }
}


async updateEventController(req, res, next) {
    try {

        // 1. Get existing event from DB
        const eventFromDB = await this.eventService.getEventByIdService(req.body.eventId);

        if (!eventFromDB) {
            throw new HttpError("Event not found", 404);
        }

        // 2. Decide image
        let imageUrl;

        if (req.file) {
            // User uploaded new image
            imageUrl = req.file.filename;
        } else if (req.body.imageUrl) {
            // User kept existing image (frontend sent it)
            imageUrl = req.body.imageUrl;
        } else {
            // Fallback → keep old image from DB
            imageUrl = eventFromDB.image_url;
        }

        // 3. Build object
        const existingEvent = {
            eventId: req.body.eventId,
            venueName: req.body.venueName,
            eventTypeName: req.body.eventTypeName,
            name: req.body.name,
            description: req.body.description,
            imageUrl: imageUrl,
            date: req.body.date,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            capacity: req.body.capacity
        };

        await this.eventService.updateEventService(existingEvent);

        res.status(200).json({
            success: true,
            message: "Event updated successfully"
        });

    } catch (error) {
        next(error);
    }
}























    async getDashboardTotalEventsController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardTotalEventsService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }
 
    async getDashboardTicketsSoldController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardTicketsSoldService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }
 
    async getDashboardTotalRevenueController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardTotalRevenueService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }
 
    async getDashboardAvgAttendanceController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardAvgAttendanceService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }
 
    async getDashboardRevenuePerEventController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardRevenuePerEventService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }
 
    async getDashboardEventsThisMonthController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardEventsThisMonthService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }
 
    async getDashboardPendingVenueRequestsController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardPendingVenueRequestsService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }
 
    async getDashboardTotalAnnouncementsController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardTotalAnnouncementsService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }
 
    async getDashboardTotalFeedbacksController(req, res, next) {
        try {
            const { organizerId } = req.params;
            const data = await this.eventService.getDashboardTotalFeedbacksService(organizerId);
            res.status(200).json({ success: true, data });
        } catch (error) { next(error); }
    }


    async deleteEventController(req, res, next) {
        try {
            const {eventId} = req.params;
            await this.eventService.deleteEventService(eventId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
 

}

module.exports = EventController;