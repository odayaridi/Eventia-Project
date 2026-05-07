const SupportRequestAttendeeService = require("../services/SupportRequestAttendeeService");
const HttpError = require("../utils/HttpError");

class SupportRequestAttendeeController {
    constructor(){
        this.supportRequestAttendeeService = new SupportRequestAttendeeService();
    }

    async createSupportReqController(req,res,next) {
        try {
            const data = await this.supportRequestAttendeeService.createSupportReqService(req.body);

            res.status(201).json({
                success: "true",
                message: "Attendee request submitted successfully in the system",
                data
            });

        } catch (error) {
            next(error);
        }
    }


    async resolveAttendeeController(req,res,next) {
        try {
            await this.supportRequestAttendeeService.resolveAttendeeService(req.body.id);
            res.status(200).json({success: true, message: 'Resolved successfully'})
        } catch (error) {
            next(error);
        }
    }

    async getAttendeeRequestsController(req,res,next) {
        try {
           const data =  await this.supportRequestAttendeeService.getAttendeeRequestService();
            res.status(200).json({success: true, message: 'Fetched successfully',data})
        } catch (error) {
            next(error);
        }
    }
}

module.exports = SupportRequestAttendeeController;