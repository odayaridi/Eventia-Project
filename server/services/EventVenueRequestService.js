const { format } = require("date-fns");
const EventVenueRequestRepository = require("../repositories/EventVenueRequestRepository");
const HttpError = require("../utils/HttpError");
const VenueRepository = require("../repositories/VenueRepository");

class EventVenueRequestService {
    constructor() {
        this.eventVenueRequestsRepo = new EventVenueRequestRepository();
        this.venueRepo = new VenueRepository();
    }


async getEventVenueRequestsService(organizerId) {
    const response = await this.eventVenueRequestsRepo.getEventVenueRequestsRepo(organizerId);

    const formattedResponse = response.map(item => {
        return {
            ...item,
            eventDate: format(item.eventDate, 'yyyy-MM-dd'),           // only date
            requested: format(item.requested, 'yyyy-MM-dd HH:mm:ss')       // date + time
        };
    });

    return formattedResponse;
}



  async countEventBookingReqsService(organizerId) {
        let pendingRequestsCount = 0,approvedRequestsCount=0,rejectedRequestsCount=0;
        const pendingRequests = await this.eventVenueRequestsRepo.countEventBookingReqsRepo(organizerId,'Pending');
        if(pendingRequests){
            pendingRequestsCount = pendingRequests.count;
        }
        const approvedRequests = await this.eventVenueRequestsRepo.countEventBookingReqsRepo(organizerId,'Approved');
        if(approvedRequests){
            approvedRequestsCount = approvedRequests.count;
        }
        const rejectedRequests = await this.eventVenueRequestsRepo.countEventBookingReqsRepo(organizerId,'Rejected');
        if(rejectedRequests) {
            rejectedRequestsCount = rejectedRequests.count;
        }
         return {
            pendingRequestsCount ,
            approvedRequestsCount,
            rejectedRequestsCount
         }
    }

    async countEventRequestsService(managerId){
        const venueId = await this.venueRepo.getVenueIdByManagerId(managerId);
        // if(!venueId){
        //     throw new HttpError('No venue exists for this manager')
        // }
        
        let pendingRequestsCount = 0,approvedRequestsCount=0,rejectedRequestsCount=0;
        const pendingRequests = await this.eventVenueRequestsRepo.countEventRequestsRepo(venueId,'Pending');
        if(pendingRequests){
            pendingRequestsCount = pendingRequests.count;
        }
        const approvedRequests = await this.eventVenueRequestsRepo.countEventRequestsRepo(venueId,'Approved');
        if(approvedRequests){
            approvedRequestsCount = approvedRequests.count;
        }
        const rejectedRequests = await this.eventVenueRequestsRepo.countEventRequestsRepo(venueId,'Rejected');
        if(rejectedRequests) {
            rejectedRequestsCount = rejectedRequests.count;
        }
         return {
            pendingRequestsCount ,
            approvedRequestsCount,
            rejectedRequestsCount
         }

    }

}


module.exports = EventVenueRequestService;