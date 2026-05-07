const SupportRequestManagerRepository = require("../repositories/SupportRequestManagerRepository");
const HttpError = require("../utils/HttpError");

class SupportRequestManagerService {
    constructor(){
        this.supportRequestManagerRepo = new SupportRequestManagerRepository();
    }

    async createSupportReqService(supportReq) {
        const response = await this.supportRequestManagerRepo.createSupportReqRepo(supportReq);
        return {
            id: response.insertId,
            managerId: supportReq.managerId,
            subject: supportReq.subject,
            message: supportReq.message
        }
    }


    async resolveManagerService(id){
        await this.supportRequestManagerRepo.resolveManagerRepo(id);
    }   


    async getManagerRequestsService() {
        return await this.supportRequestManagerRepo.getManagerRequestsRepo();
    }
}

module.exports = SupportRequestManagerService;