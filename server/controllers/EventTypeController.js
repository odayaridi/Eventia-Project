const EventTypeService = require("../services/EventTypeService");


class EventTypeController {
    constructor() {
        this.eventTypeService = new EventTypeService();
    }

    async getAllEventTypesController(req,res,next) {
        try {
            const eventTypes = await this.eventTypeService.getAllEventTypesService();
             res.status(200).json({ success: "true", message: "Event Types are retrieved successfully",data:eventTypes})
        } catch (error) {
            next(error);
        }
    }
}


module.exports = EventTypeController;