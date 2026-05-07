const SupportRequestOrganizerRepository = require("../repositories/SupportRequestOrganizerRepository");
const SupportRequestOrganizerService = require("../services/SupportRequestOrganizerService");
const HttpError = require("../utils/HttpError");

class SupportRequestOrganizerController {
    constructor(){
        this.supportRequestOrganizerService = new SupportRequestOrganizerService();
    }


        async createSupportReqController(req,res,next) {
            try {
                const data = await this.supportRequestOrganizerService.createSupportReqService(req.body);
                 res.status(201).json({ success: "true", message: "Organizer request submitted successfully in the system",data});
            } catch (error) {
                next(error);
            }
        }


        async resolveOrganizerController(req,res,next){
            try {
                await this.supportRequestOrganizerService.resolveOrganizerService(req.body.id);
                res.status(200).json({success : true , message:"Resolved successfully"})
            } catch (error) {
                next(error)
            }
        }


        async getOrganizerRequestsController(req,res,next){
            try {
                const data = await this.supportRequestOrganizerService.getOrganizerRequestsService();
                 res.status(200).json({success : true , message:"Requests retrieved successfully",data})
            } catch (error) {
                next(error);
            }
        }

}

module.exports = SupportRequestOrganizerController;