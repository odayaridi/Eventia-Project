const VenueAvailabilityService = require("../services/VenueAvailabilityService");

class VenueAvailabilityController {
    constructor() {
        this.venueAvailabilityService = new VenueAvailabilityService();
    }



    async createVenueAvailabilityController(req, res, next) {
    try {
        const data = await this.venueAvailabilityService.createVenueAvailabilityService(req.body);

        res.status(201).json({
            success: true,
            message: "Venue availability created successfully",
            data
        });
    } catch (error) {
        next(error);
    }
}


async getVenueAvailabilitiesController(req,res,next) {
    try {
        const {managerId} = req.query;
        const data = await this.venueAvailabilityService.getVenueAvailabilitiesService(managerId);

        let message;
        if(data.length == 0) {
            message = 'No venue availabalities assigned for this venue';
        } else {
            message = 'Venue availabalities exists for this venue';
        }

        res.status(200).json({ success: true, message, data });
    } catch (error) {
        next(error);
    }
}

async getVenueBookedTimesController(req,res,next) {
    try {
        const {managerId} = req.query;
        const data = await this.venueAvailabilityService.getVenueBookedTimesService(managerId);

        let message;
        if(data.length == 0) {
            message = 'No venue booked assigned for this venue';
        } else {
            message = 'Venue booked times exists for this venue';
        }

        res.status(200).json({ success: true, message, data });
    } catch (error) {
        next(error);
    }
}





  async getUpcomingReservationsController(req, res, next) {
        try {
            const { managerId } = req.query;
            const data = await this.venueAvailabilityService.getUpcomingReservationsService(managerId);
            res.status(200).json({
                success: true,
                message: "Upcoming reservations fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }
 
    async getBookingByStatusController(req, res, next) {
        try {
            const { managerId } = req.query;
            const data = await this.venueAvailabilityService.getBookingByStatusService(managerId);
            res.status(200).json({
                success: true,
                message: "Booking by status fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }
 








 async updateVenueAvailabilityController(req, res, next) {
  try {
    const { venueAvailabilityId } = req.params;

    const data =
      await this.venueAvailabilityService.updateVenueAvailabilityService({
        venueAvailabilityId,
        ...req.body,
      });

    res.status(200).json({
      success: true,
      message: "Venue availability updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async deleteVenueAvailabilityController(req, res, next) {
  try {
    const { venueAvailabilityId } = req.params;
    const { managerId } = req.body;

    const data =
      await this.venueAvailabilityService.deleteVenueAvailabilityService({
        venueAvailabilityId,
        managerId,
      });

    res.status(200).json({
      success: true,
      message: "Venue availability deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

}


module.exports = VenueAvailabilityController;

