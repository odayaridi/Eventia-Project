const EventRepository = require("../repositories/EventRepository");
const EventTicketsRepository = require("../repositories/EventTicketsRepository");
const TicketTypesRepository = require("../repositories/TicketTypesRepository");
const HttpError = require("../utils/HttpError");

class EventTicketsService {
  constructor() {
    this.eventRepo = new EventRepository();
    this.ticketTypeRepo  = new TicketTypesRepository();
    this.eventTicketsRepo = new EventTicketsRepository();
  }


  async getEventTicketsService(eventTicket) {
      const response = await this.eventTicketsRepo.getEventTicketsRepoo(eventTicket.organizerId);
      return response;
  }


    async createEventTicketService(eventTicket) {
        const ticketTypeId = await this.ticketTypeRepo.getIdByType(eventTicket.type);
        if (!ticketTypeId) {
            throw new HttpError('Ticket type is not found', 404);
        }

        const eventId = await this.eventRepo.getEventIdByName(eventTicket.eventName);
        if (!eventId) {
            throw new HttpError('Event does not exist', 404);
        }

        const existingTicket = await this.eventTicketsRepo.geEventTicketByEventAndType(eventId, ticketTypeId);
        if (existingTicket) {
            throw new HttpError('You already have this ticket type for the event. Please update instead.', 400);
        }


        const currentTotal = await this.eventTicketsRepo.getTotalTicketQuantityByEvent(eventId);
        const capacity = await this.eventRepo.getEventCapacityById(eventId);

        if (currentTotal + eventTicket.quantityAvailable > capacity) {
            throw new HttpError(
                `Total tickets exceed event capacity (${capacity})`,
                400
            );
        }

        const { type, name, ...result } = eventTicket;

        const response = {
            ...result,
            ticketTypeId,
            eventId
        };

        const newEventTicket = await this.eventTicketsRepo.createEventTicketRepo(response);

        return {
            ...response,
            id: newEventTicket.insertId
        };
    }

    async updateEventTicketService(eventTicket) {
      const ticketTypeId = await this.ticketTypeRepo.getIdByType(eventTicket.type);
      if (!ticketTypeId) {
        throw new HttpError('Ticket type is not found', 404);
      }

      const existingTicket = await this.eventTicketsRepo.getEventTicketById(eventTicket.eventTicketId);

      if (!existingTicket) {
        throw new HttpError('Ticket not found', 404);
      }

      const eventId = existingTicket.eventId;

      const currentTotal = await this.eventTicketsRepo.getTotalTicketQuantityByEvent(eventId);
      const capacity = await this.eventRepo.getEventCapacityById(eventId);

      // subtract old quantity, add new one
      const newTotal =
        currentTotal - existingTicket.quantityAvailable + eventTicket.quantityAvailable;

      if (newTotal > capacity) {
        throw new HttpError(
          `Updated quantity exceeds event capacity (${capacity})`,
          400
        );
      }

      const { type, ...result } = eventTicket;

      const response = {
        ...result,
        ticketTypeId
      };

      await this.eventTicketsRepo.updateEventTicketRepo(response);

      return response;
    }






async getTicketTypesService() {
  const response = await this.ticketTypeRepo.getTicketTypesRepo();
  return response;
}


async getEventsTotalTicketsQuantitiesService(){
    return await this.eventTicketsRepo.getEventsTotalTicketsQuantitiesRepo();
}


}


module.exports = EventTicketsService;
