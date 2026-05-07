const SupportRequestOrganizerRepository = require("../repositories/SupportRequestOrganizerRepository");
const HttpError = require("../utils/HttpError");

class SupportRequestOrganizerService {
    constructor(){
        this.supportRequestOrganizerRepo = new SupportRequestOrganizerRepository();
    }


        async createSupportReqService(supportReq) {
          const response = await this.supportRequestOrganizerRepo.createSupportReqRepo(supportReq);
       
          return {
            id: response.insertId,
            organizerId: supportReq.organizerId,
            subject: supportReq.subject,
            message: supportReq.message
          }
        }



        async resolveOrganizerService(id){
            await this.supportRequestOrganizerRepo.resolveOrganizerRepo(id);
        }



        async getOrganizerRequestsService(){
           return await this.supportRequestOrganizerRepo.getOrganizerRequestsRepo();
        }

}

module.exports = SupportRequestOrganizerService;