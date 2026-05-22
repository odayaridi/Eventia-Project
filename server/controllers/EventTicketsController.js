const EventTicketsService = require("../services/EventTicketsService");

class EventTicketsController {
    constructor() {
        this.eventTicketsService = new EventTicketsService();
    }


// http://localhost:3010/api/eventTickets/get?organizerId=2
    async getEventTicketsController(req,res,next) {
        try {
            const eventTicket = req.query;
            const data = await this.eventTicketsService.getEventTicketsService(eventTicket);
            res.status(200).json({ success: "true", message: "Event Tickets are retrieved successfully",data})
        } catch (error) {
            next(error);
        }
    }



    async createEventTicketsController(req,res,next){
        try {
            const eventTicket = req.body;
            const data = await this.eventTicketsService.createEventTicketService(eventTicket);
            res.status(201).json({ success: "true", message: "Event Ticket is inserted successfully",data})
        } catch (error) {
            next(error);
        }
    }


      async updateEventTicketsController(req,res,next){
        try {
            const eventTicket = req.body;
            const data = await this.eventTicketsService.updateEventTicketService(eventTicket);
            res.status(200).json({ success: "true", message: "Event Ticket is updated successfully",data})
        } catch (error) {
            next(error);
        }
    }



    async getTicketTypesController(req, res, next) {
        try {
            const data = await this.eventTicketsService.getTicketTypesService();

            res.status(200).json({
            success: "true",
            message: "Ticket types are retrieved successfully",
            data
            });
        } catch (error) {
            next(error);
        }
}


    async getEventsTotalTicketsQuantitiesController(req,res,next){
           try {
            const data = await this.eventTicketsService.getEventsTotalTicketsQuantitiesService();
            res.status(200).json({
            success: "true",
            message: "Total Quantity retrieved successfully",
            data
            });
        } catch (error) {
            next(error);
        }
    }

}


module.exports = EventTicketsController;