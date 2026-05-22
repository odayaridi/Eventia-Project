const { format } = require("date-fns/format");
const VenueAvailabilityRepository = require("../repositories/VenueAvailabilityRepository");
const HttpError = require("../utils/HttpError");

class VenueAvailabilityService {
  constructor() {
    this.venueavailabilityRepo = new VenueAvailabilityRepository();
  }



async createVenueAvailabilityService(venueAv) {

    const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(venueAv.managerId);

    if (!venueId) {
        throw new HttpError('Venue Id is not found for this manager', 404);
    }

    const today = new Date();
    const inputDate = new Date(venueAv.date);

    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
        throw new HttpError("Invalid date: cannot select a past date", 400);
    }

    if (venueAv.startTime >= venueAv.endTime) {
        throw new HttpError("Start time must be before end time", 400);
    }

    if (!venueAv.price || Number(venueAv.price) <= 0) {
        throw new HttpError("Price must be greater than 0", 400);
    }

    const overlap = await this.venueavailabilityRepo.checkVenueAvailabilityOverlapRepo(
        venueId,
        venueAv.date,
        venueAv.startTime,
        venueAv.endTime
    );

    if (overlap) {
        throw new HttpError(
            "This time slot overlaps with an existing availability",
            400
        );
    }

    venueAv.venueId = venueId;

    const response = await this.venueavailabilityRepo.createVenueAvailabilityRepo(venueAv);

    if (!response.insertId) {
        throw new HttpError("Failed to create venue availability", 500);
    }

    return {
        id: response.insertId,
        venueId: venueId,
        date: venueAv.date,
        startTime: venueAv.startTime,
        endTime: venueAv.endTime,
        price: Number(venueAv.price),
    };
}




async getVenueAvailabilitiesService(managerId){
    const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(managerId);
    const vAvs = await this.venueavailabilityRepo.getVenueAvailabilitiesRepo(venueId);

    const formatted = vAvs.map(v => ({
        ...v,
        date: format(new Date(v.date), "yyyy-MM-dd")
    }));

    return formatted;
}

async getVenueBookedTimesService(managerId){
    const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(managerId);
    const vAvs = await this.venueavailabilityRepo.getVenueBookedTimesRepo(venueId);

    const formatted = vAvs.map(v => ({
        ...v,
        date: format(new Date(v.date), "yyyy-MM-dd")
    }));

    return formatted;
}





  async getUpcomingReservationsService(managerId) {
        const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(managerId);
        if (!venueId) return [];
        return await this.venueavailabilityRepo.getUpcomingReservationsRepo(venueId);
    }
 
    async getBookingByStatusService(managerId) {
        const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(managerId);
        if (!venueId) return { available: 0, booked: 0 };
        return await this.venueavailabilityRepo.getBookingByStatusRepo(venueId);
    }




    async updateVenueAvailabilityService(data) {
  const {
    venueAvailabilityId,
    managerId,
    date,
    startTime,
    endTime,
    price,
  } = data;

  const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(
    managerId
  );

  if (!venueId) {
    throw new HttpError("Venue Id is not found for this manager", 404);
  }

  const existing =
    await this.venueavailabilityRepo.getVenueAvailabilityByIdRepo(
      venueAvailabilityId
    );

  if (!existing) {
    throw new HttpError("Venue availability was not found", 404);
  }

  if (Number(existing.venueId) !== Number(venueId)) {
    throw new HttpError(
      "You are not allowed to update this venue availability",
      403
    );
  }

  if (Number(existing.statusId) === 2) {
    throw new HttpError(
      "Cannot update a booked venue availability slot",
      400
    );
  }

  const today = new Date();
  const inputDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    throw new HttpError("Invalid date: cannot select a past date", 400);
  }

  if (startTime >= endTime) {
    throw new HttpError("Start time must be before end time", 400);
  }

  if (!price || Number(price) <= 0) {
    throw new HttpError("Price must be greater than 0", 400);
  }

  const overlap =
    await this.venueavailabilityRepo.checkVenueAvailabilityOverlapForUpdateRepo(
      venueId,
      venueAvailabilityId,
      date,
      startTime,
      endTime
    );

  if (overlap) {
    throw new HttpError(
      "This time slot overlaps with an existing availability",
      400
    );
  }

  const response =
    await this.venueavailabilityRepo.updateVenueAvailabilityRepo({
      venueAvailabilityId,
      date,
      startTime,
      endTime,
      price,
    });

  if (response.affectedRows === 0) {
    throw new HttpError("Failed to update venue availability", 500);
  }

  return {
    id: Number(venueAvailabilityId),
    venueId,
    date,
    startTime,
    endTime,
    price: Number(price),
  };
}

async deleteVenueAvailabilityService(data) {
  const { venueAvailabilityId, managerId } = data;

  const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(
    managerId
  );

  if (!venueId) {
    throw new HttpError("Venue Id is not found for this manager", 404);
  }

  const existing =
    await this.venueavailabilityRepo.getVenueAvailabilityByIdRepo(
      venueAvailabilityId
    );

  if (!existing) {
    throw new HttpError("Venue availability was not found", 404);
  }



  const response =
    await this.venueavailabilityRepo.deleteVenueAvailabilityRepo(
      venueAvailabilityId
    );

  if (response.affectedRows === 0) {
    throw new HttpError("Failed to delete venue availability", 500);
  }

  return {
    id: Number(venueAvailabilityId),
  };
}
 

}

module.exports = VenueAvailabilityService;







