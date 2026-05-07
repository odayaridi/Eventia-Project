const SupportRequestManagerService = require("../services/SupportRequestManagerService");
const HttpError = require("../utils/HttpError");

class SupportRequestManagerController {
    constructor(){
        this.supportRequestManagerService = new SupportRequestManagerService();
    }



    
// {
//   "managerId": 1,
//   "subject": "Issue with venue booking system",
//   "message": "I am unable to update the venue availability calendar. Please assist."
// }


    async createSupportReqController(req,res,next) {
        try {
            const data = await this.supportRequestManagerService.createSupportReqService(req.body);

            res.status(201).json({
                success: "true",
                message: "Venue Manager request submitted successfully in the system",
                data
            });

        } catch (error) {
            next(error);
        }
    }


    async resolveManagerController(req,res,next) {
        try {
            await this.supportRequestManagerService.resolveManagerService(req.body.id);
            res.status(200).json({success: true , message: "Resolved successfully"})
        } catch (error) {
            next(error)   
        }
    }


    async getManagerRequestsController(req,res,next){
        try {
            const data = await this.supportRequestManagerService.getManagerRequestsService();
             res.status(200).json({success : true , message:"Fetched successfully",data})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = SupportRequestManagerController;