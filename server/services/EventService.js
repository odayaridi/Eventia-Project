const { format } = require("date-fns/format");
const EventRepository = require("../repositories/EventRepository");
const EventTypeRepository = require("../repositories/EventTypeRepository");
const EventVenueRequestRepository = require("../repositories/EventVenueRequestRepository");
const VenueAvailabilityRepository = require("../repositories/VenueAvailabilityRepository");
const VenueRepository = require("../repositories/VenueRepository");
const HttpError = require("../utils/HttpError");
const EventTicketsRepository = require("../repositories/EventTicketsRepository");

class EventService {
    constructor() {
        this.eventRepo = new EventRepository();
        this.venueRepo = new VenueRepository();
        this.eventVenueRequestRepo = new EventVenueRequestRepository();
        this.eventTypeRepo = new EventTypeRepository();
        this.venueAvailabilityRepo = new VenueAvailabilityRepository();
        this.eventTicketsRepo = new EventTicketsRepository();
    }
// async createEventService(event) {
//     const eventExists = await this.eventRepo.checkEventExistsRepo(event.name);
//     if (eventExists) throw new HttpError('Event already exists', 409);

//     const venueId = await this.venueRepo.getVenueIdByNameRepo(event.venueName);
//     const eventTypeId = await this.eventTypeRepo.getIdByTypeRepo(event.eventType);
//     const venueCapacity = await this.venueRepo.getVenueCapacityByIdRepo(venueId);

//     if (event.capacity > venueCapacity) {
//         throw new HttpError(
//             'Invalid capacity, capacity should be less than or equal to venue capacity',
//             400
//         );
//     }

//     // Set approvedVenueId to null (request will be created separately)
//     event.approvedVenueId = null;
//     event.eventTypeId = eventTypeId;

//     const newEvent = await this.eventRepo.createEventRepo(event);
//     await this.eventVenueRequestRepo.createEventVenueRequestsRepo(newEvent.insertId, venueId);

//     return newEvent;
// }




async createEventService(event) {
    const eventExists = await this.eventRepo.checkEventExistsRepo(event.name);
    if (eventExists) throw new HttpError('Event already exists', 409);

    const venueId = await this.venueRepo.getVenueIdByNameRepo(event.venueName);
    const eventTypeId = await this.eventTypeRepo.getIdByTypeRepo(event.eventType);
    const venueCapacity = await this.venueRepo.getVenueCapacityByIdRepo(venueId);

    if (event.capacity > venueCapacity) {
        throw new HttpError(
            'Invalid capacity, capacity should be less than or equal to venue capacity',
            400
        );
    }

    // Set approvedVenueId to null (request will be created separately)
    event.venueAvailabilityId = null;
    event.eventTypeId = eventTypeId;

    // Create the event first
    const newEvent = await this.eventRepo.createEventRepo(event);

    // Get the specific venue availability ID for the requested date/time
    const venueAvailabilityId = await this.venueAvailabilityRepo.getVenueAvailabilityIdByDateAndTime(
        venueId,
        event.date,
        event.startTime
    );

    if (!venueAvailabilityId) {
        throw new HttpError('No available slot for this venue at the selected date/time', 400);
    }
    // Create the venue request
    await this.eventVenueRequestRepo.createEventVenueRequestsRepo(newEvent.insertId, venueAvailabilityId);

    return newEvent;
}

async updateEventService(existingEvent){

    // 1. Get IDs
    const venueId = await this.venueRepo.getVenueIdByNameRepo(existingEvent.venueName);
    const eventTypeId = await this.eventTypeRepo.getIdByTypeRepo(existingEvent.eventTypeName);
    if(eventTypeId){
        existingEvent.eventTypeId = eventTypeId;
    }
    else {
        throw new HttpError();
    }
   

    // 2. Capacity check
    const venueCapacity = await this.venueRepo.getVenueCapacityByIdRepo(venueId);
    if (existingEvent.capacity > venueCapacity) {
        throw new HttpError(
            'Invalid capacity, capacity should be less than or equal to venue capacity',
            400
        );
    }

    // 3. Check venue availability
    const venueAvailabilityId = await this.venueAvailabilityRepo.getVenueAvailabilityIdByDateAndTime(
        venueId,
        existingEvent.date,
        existingEvent.startTime
    );
    if (!venueAvailabilityId) {
        throw new HttpError('No available slot for this venue at the selected date/time', 400);
    }

    // 4. Event name uniqueness (ignore same eventId)
    const eventExists = await this.eventRepo.checkEventExistsRepo(existingEvent.name);
  
    if (eventExists && eventExists.id !== Number(existingEvent.eventId)) {
        throw new HttpError('Event already exists with this name', 400);
    }

    // 5. Update venue request
    await this.eventVenueRequestRepo.updateVenueAvailabilityIdAndStatus(existingEvent.eventId, venueAvailabilityId);

    const updatedEvent  = {
        eventId: existingEvent.eventId,
        eventTypeId: existingEvent.eventTypeId,
        name: existingEvent.name,
        description: existingEvent.description,
        imageUrl : existingEvent.imageUrl,
        date: existingEvent.date,
        startTime: existingEvent.startTime,
        endTime: existingEvent.endTime,
        capacity: existingEvent.capacity,
    }

    // 6. Update event in repository
    await this.eventRepo.updateEventRepo(updatedEvent);
}

  async approveEventVenueRequestService(eventId,venueAvailabilityId){
     const eventVenue = await this.eventVenueRequestRepo.updateEventVenueReqStatus('Approved',eventId,venueAvailabilityId);
     if(eventVenue.affectedRows == 0){
        throw new HttpError('Error happened while updating event venue request status');
     }

     const venueAvailablity = await this.venueAvailabilityRepo.updateVenueAvailabilityStatus(2,venueAvailabilityId);
     if(venueAvailablity.affectedRows == 0){
        throw new HttpError('Error happend while updating the status in venue availability');
     }

     const event = await this.eventRepo.approveEventRequestRepo(eventId,venueAvailabilityId);
     if(event.affectedRows == 0){
        throw new HttpError('Error happened while updating the venue availability id in the event table');
     }
     const approvedEvent =  await this.eventRepo.getEventById(eventId);
   
     if(!approvedEvent){
        throw new HttpError();
     }

     return approvedEvent;
  }


    async rejectEventVenueRequestService(eventId,venueAvailabilityId){
     const eventVenue = await this.eventVenueRequestRepo.updateEventVenueReqStatus('Rejected',eventId,venueAvailabilityId);
     if(eventVenue.affectedRows == 0){
        throw new HttpError('Error happened while updating event venue request status');
     }
  }


  async getEventNamesService(organizerId){
        return this.eventRepo.getEventNamesRepo(organizerId);
  }


  
  async getUpcomingEventNamesService(organizerId){
        return this.eventRepo.getUpcomingEventNamesRepo(organizerId);
  }


  async getEndedEventNamesService(organizerId) {
      return this.eventRepo.getEndedEventNamesRepo(organizerId);
  }


//  async filterEventsService(filters) {

//     let formattedFilters = filters;  // declare in outer scope

//     if (filters.eventTypeName) {
//         const eventTypeId = await this.eventTypeRepo.getIdByTypeRepo(filters.eventTypeName);

//         if (!eventTypeId) {
//             throw new HttpError();
//         }

//         const { eventTypeName, ...rest } = filters;
//         formattedFilters = { ...rest, eventTypeId };
//     }

//     const response = await this.eventRepo.filterEventsRepo(formattedFilters);
//     return response;
// }

async filterEventsService(filters) {

    let formattedFilters = filters;

    if (filters.eventTypeName) {
        const eventTypeId = await this.eventTypeRepo.getIdByTypeRepo(filters.eventTypeName);

        if (!eventTypeId) {
            throw new HttpError("Invalid event type", 400);
        }

        const { eventTypeName, ...rest } = filters;
        formattedFilters = { ...rest, eventTypeId };
    }

    const response = await this.eventRepo.filterEventsRepo(formattedFilters);


    for (const event of response.events) {
        const seatsLeft = await this.eventTicketsRepo.getTotalAvailableSeatsByEventRepo(event.eventId);
        event.seatsLeft = seatsLeft;
    }

    return response;
}



async getEventsByOrganizerService(organizerId) {

    const events = await this.eventRepo.getEventsByOrganizerRepo(organizerId);

    // Add full image URL
  
    const baseUrl = `${process.env.BASE_URL}/uploads/eventsImages/`;

    const formattedEvents = events.map(event => ({
        ...event,
        imageUrl: event.imageUrl 
            ? baseUrl + event.imageUrl 
            : null,
        date: format(event.date,'yyyy-MM-dd')    
    }));

    return formattedEvents;
}



    async getEventByIdService(eventId) {

        if (!eventId) {
            throw new HttpError("Event ID is required", 400);
        }

        const event = await this.eventRepo.getEventById(eventId);

        if (!event) {
            throw new HttpError("Event not found", 404);
        }

        return event;
    }

 async getDashboardTotalEventsService(organizerId) {
        return this.eventRepo.getDashboardTotalEventsRepo(organizerId);
    }
 
    async getDashboardTicketsSoldService(organizerId) {
        return this.eventRepo.getDashboardTicketsSoldRepo(organizerId);
    }
 
    async getDashboardTotalRevenueService(organizerId) {
        return this.eventRepo.getDashboardTotalRevenueRepo(organizerId);
    }
 
    async getDashboardAvgAttendanceService(organizerId) {
        return this.eventRepo.getDashboardAvgAttendanceRepo(organizerId);
    }
 
    async getDashboardRevenuePerEventService(organizerId) {
        return this.eventRepo.getDashboardRevenuePerEventRepo(organizerId);
    }
 
    async getDashboardEventsThisMonthService(organizerId) {
        return this.eventRepo.getDashboardEventsThisMonthRepo(organizerId);
    }
 
    async getDashboardPendingVenueRequestsService(organizerId) {
        return this.eventRepo.getDashboardPendingVenueRequestsRepo(organizerId);
    }
 
    async getDashboardTotalAnnouncementsService(organizerId) {
        return this.eventRepo.getDashboardTotalAnnouncementsRepo(organizerId);
    }
 
    async getDashboardTotalFeedbacksService(organizerId) {
        return this.eventRepo.getDashboardTotalFeedbacksRepo(organizerId);
    }
 


    async deleteEventService(eventId){
        await this.eventRepo.deleteEventRepo(eventId);
    }


}

module.exports = EventService;