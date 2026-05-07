const EventVenueRequestService = require("../services/EventVenueRequestService");

class EventVenueRequestController {
    constructor(){
        this.eventVenueRequestService = new EventVenueRequestService();
    }



    //http://localhost:3010/api/eventvenueReqs/getById?organizerId=1
    async getEventVenueRequestsController(req,res,next){
        try {
            const {organizerId} = req.query;
            const data = await this.eventVenueRequestService.getEventVenueRequestsService(organizerId);
            let message;
            if(data.length == 0){
                message = 'No event venue requests exist'
            }
            else {
                message = 'Event venue request(s) retrieved successfully';
            }
            res.status(200).json({
                success: "true",
                message:message,
                data
            });
        } catch (error) {
            next(error);
        }
    }




    /*
{
    "organizerId" : 2,
    "status": "Approved"

}
   */
    async countEventBookingReqsController(req,res,next){
         try {
            const {organizerId} = req.query;
            const data = await this.eventVenueRequestService.countEventBookingReqsService(organizerId);
         
            res.status(200).json({
                success: "true",
                message: "The count is retrieved successfully",
                data
            });
         } catch (error) {
              next(error);
         }
    }


    async countEventRequestsController(req,res,next) {
        try {
            const {managerId} = req.query;
            const data = await this.eventVenueRequestService.countEventRequestsService(managerId);
              res.status(200).json({
                success: "true",
                message: "The counts are retrieved",
                data
            });
        } catch (error) {
            next(error);
        }
    }
    
}


module.exports = EventVenueRequestController;