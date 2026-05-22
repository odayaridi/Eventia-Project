const VenueService = require("../services/VenueService");

class VenueController {
    constructor() {
        this.venueService = new VenueService();
    }



    async createVenueController(req, res, next) {
    try {
        const images = req.files || [];

        const data = await this.venueService.createVenueService(
            req.body,
            images
        );

        res.status(201).json({
            success: "true",
            message: "Venue created successfully",
            data
        });
    } catch (error) {
        next(error);
    }
}

        async updateVenueController(req, res, next) {
            try {
                const images = req.files || [];

                const data = await this.venueService.updateVenueService(
                    req.body,
                    images
                );

                res.status(200).json({
                    success: "true",
                    message: "Venue updated successfully",
                    data
                });
            } catch (error) {
                next(error);
            }
        }


    async filterVenuesController(req, res, next) {
        try {
            const result = await this.venueService.filterVenuesService(req.query);
            const message = result.venues.length > 0 ? "Venues fetched successfully" : "No venues found";
            res.status(200).json({ success: "true", message, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getVenuesNamesController(req, res, next) {
        try {
            const data = await this.venueService.getVenuesNamesService(req.query);
            res.status(200).json({ success: "true", message: "Fetched venue names successfully", data });
        } catch (error) {
            next(error);
        }
    }

    async getVenueAvailabilityDatesController(req, res, next) {
        try {
            const {venueName} = req.query;
            const data = await this.venueService.getVenueAvailabilityDatesService(venueName);
            res.status(200).json({ success: "true", message: "Fetched venue available dates successfully", data });
        } catch (error) {
            next(error);
        }
    }

    async getVenueAvailabilityTimesController(req, res, next) {
        try {
            const { venueName, date } = req.query;
            const data = await this.venueService.getVenueAvailabilityTimingsService(venueName,date);
            res.status(200).json({ success: "true", message: "Fetched available time slots successfully", data });
        } catch (error) {
            next(error);
        }
    }


    async fetchEventRequestsController(req, res, next) {
    try {
        const { managerId, page, limit } = req.query;

        const data = await this.venueService.fetchEventRequestsService({
            managerId,
            page,
            limit
        });

        if (!data.requests || data.requests.length === 0) {
            return res.status(200).json({
                success: "true",
                message: "No Events Requests are available to fetch",
                data
            });
        }

        res.status(200).json({
            success: "true",
            message: "Events Requests are fetched successfully",
            data
        });
    } catch (error) {
        next(error);
    }
}



    async hasVenueController(req,res,next) {
        try {
            const {managerId} = req.query;
            const venueExists = await this.venueService.hasVenueService(managerId);
            if(!venueExists) {
                 return res.status(200).json({ success: "true", message: "No venue exists for this manager", venueExists });
            }
            else {
                return res.status(200).json({ success: "true", message: "Venue exists for this manager", venueExists });
            }
        } catch (error) {
             next(error);
        }
    }


    async getVenueInfoController(req,res,next){
        try {
            const {managerId} = req.query;
            const data = await this.venueService.getVenueInfoService(managerId);
              return res.status(200).json({ success: "true", message: "Venue retrieved successfully", data });
        } catch (error) {
             next(error);
        }
    }
    
       async getVenueDashboardStatsController(req, res, next) {
        try {
            const { managerId } = req.params;
            const data = await this.venueService.getVenueDashboardStatsService(managerId);
            res.status(200).json({
                success: true,
                message: "Venue dashboard stats fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }
 
    
}

module.exports = VenueController;