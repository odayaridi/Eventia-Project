const EventTypeRepository = require("../repositories/EventTypeRepository");

class EventTypeService {
    constructor() {
        this.eventTypeRepo = new EventTypeRepository();
    }


    async getAllEventTypesService(){
        return await this.eventTypeRepo.getAllEventTypesRepo();
    }
}

module.exports = EventTypeService;