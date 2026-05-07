
const SupportRequestAttendeeRepository = require("../repositories/SupportRequestAttendeeRepository");
const HttpError = require("../utils/HttpError");

class SupportRequestAttendeeService {
    constructor(){
        this.supportRequestAttendeeRepo = new SupportRequestAttendeeRepository();
    }

    async createSupportReqService(supportReq) {
        const response = await this.supportRequestAttendeeRepo.createSupportReqRepo(supportReq);
        return {
            id: response.insertId,
            attendeeId: supportReq.attendeeId,
            subject: supportReq.subject,
            message: supportReq.message
        }
    }


    async resolveAttendeeService(id){
         await this.supportRequestAttendeeRepo.resolveAttendeeRepo(id);
    }


    async getAttendeeRequestService(){
        return await this.supportRequestAttendeeRepo.getAttendeeRequestsRepo();
    }
}

module.exports = SupportRequestAttendeeService;