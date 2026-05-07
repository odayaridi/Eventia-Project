const { format } = require("date-fns/format");
const VenueAvailabilityRepository = require("../repositories/VenueAvailabilityRepository");
const HttpError = require("../utils/HttpError");

class VenueAvailabilityService {
  constructor() {
    this.venueavailabilityRepo = new VenueAvailabilityRepository();
  }

  // async createVenueAvailabilityService(venueAv) {

  //   const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(venueAv.managerId);
  //   if(!venueId){
  //     throw new HttpError('Venue Id is not found for this manager', managerId)
  //   }
  //   // Check if the same date + startTime already exists
  //   const conflict = await this.venueavailabilityRepo.checkVenueAvailabilityConflictRepo(
  //     venueId,
  //     venueAv.date,
  //     venueAv.startTime
  //   );
  //   if (conflict) {
  //     throw new HttpError(
  //       `Venue is already available for ${venueAv.date} at ${venueAv.startTime}`,
  //       400
  //     );
  //   }

  //   venueAv.venueId = venueId;
  //   const response = await this.venueavailabilityRepo.createVenueAvailabilityRepo(
  //     venueAv
  //   );

  //   if (!response.insertId) {
  //     throw new HttpError("Failed to create venue availability", 500);
  //   }

  //   return {
  //     id: response.insertId,
  //     venueId: venueId,
  //     date: venueAv.date,
  //     startTime: venueAv.startTime,
  //     endTime: venueAv.endTime,
  //   };
  // }

//     async createVenueAvailabilityService(venueAv) {

//     // 1️⃣ Get venueId from manager
//     const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(venueAv.managerId);

//     if (!venueId) {
//         throw new HttpError('Venue Id is not found for this manager', 404);
//     }

//     // 2️⃣ Validate date is not in the past
//     const today = new Date();
//     const inputDate = new Date(venueAv.date);

//     // remove time part for accurate comparison
//     today.setHours(0,0,0,0);
//     inputDate.setHours(0,0,0,0);

//     if (inputDate < today) {
//         throw new HttpError("Invalid date: cannot select a past date", 400);
//     }

//     // 3️⃣ Validate time logic (start < end)
//     if (venueAv.startTime >= venueAv.endTime) {
//         throw new HttpError("Start time must be before end time", 400);
//     }

//     // 4️⃣ Check overlap
//     const overlap = await this.venueavailabilityRepo.checkVenueAvailabilityOverlapRepo(
//         venueId,
//         venueAv.date,
//         venueAv.startTime,
//         venueAv.endTime
//     );

//     if (overlap) {
//         throw new HttpError(
//             "This time slot overlaps with an existing availability",
//             400
//         );
//     }

//     // 5️⃣ Create availability
//     venueAv.venueId = venueId;

//     const response = await this.venueavailabilityRepo.createVenueAvailabilityRepo(venueAv);

//     if (!response.insertId) {
//         throw new HttpError("Failed to create venue availability", 500);
//     }

//     return {
//         id: response.insertId,
//         venueId: venueId,
//         date: venueAv.date,
//         startTime: venueAv.startTime,
//         endTime: venueAv.endTime,
//     };
// }


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

// async getVenueAvailabilitiesService(managerId){
//     const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(managerId);
//     const vAvs = await this.venueavailabilityRepo.getVenueAvailabilitiesRepo(venueId);

//     const formatted = vAvs.map(v => ({
//         ...v,
//         date: format(v.date, "yyyy-MM-dd")
//     }));

//     return formatted;
// }



// async getVenueBookedTimesService(managerId){
//     const venueId = await this.venueavailabilityRepo.getVenueIdByManagerId(managerId);
//     const vAvs = await this.venueavailabilityRepo.getVenueBookedTimesRepo(venueId);

//     const formatted = vAvs.map(v => ({
//         ...v,
//         date: format(v.date, "yyyy-MM-dd")
//     }));

//     return formatted;
// }



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
 

}

module.exports = VenueAvailabilityService;