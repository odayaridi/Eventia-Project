const AdminRepository = require("../repositories/AdminRepository");
const HttpError = require("../utils/HttpError");
const bcrypt = require('bcrypt')

class AdminService {
    constructor() {
        this.adminRepo = new AdminRepository();
    }

    async acceptVenueManagerService(venueManagerName) {
        const result = await this.adminRepo.updateVenueManagerApproval(venueManagerName, 1);
        if (result.affectedRows != 1) {
            throw new HttpError("Error occurred while approving the venue manager");
        }
    }

    async rejectVenueManagerService(venueManagerName) {
        const result = await this.adminRepo.updateVenueManagerApproval(venueManagerName, 2);
        if (result.affectedRows != 1) {
            throw new HttpError("Error occurred while rejecting the venue manager");
        }
    }

    async acceptEventOrganizerService(organizerName) {
        const result = await this.adminRepo.updateEventOrganizerApproval(organizerName, 1);
        if (result.affectedRows != 1) {
            throw new HttpError("Error occurred while approving the event organizer");
        }
    }

    async rejectEventOrganizerService(organizerName) {
        const result = await this.adminRepo.updateEventOrganizerApproval(organizerName, 2);
        if (result.affectedRows != 1) {
            throw new HttpError("Error occurred while rejecting the event organizer");
        }
    }



        async getPendingEventOrganizersService(query) {
        const data = await this.adminRepo.getPendingEventOrganizersRepo(query);
        return data;
    }

    async getPendingVenueManagersService(query) {
        const data = await this.adminRepo.getPendingVenueManagersRepo(query);
        return data;
    }












    /* ==================== GET ALL ==================== */

    async getAllAttendeesService(query) {
        return await this.adminRepo.getAllAttendeesRepo(query);
    }

    async getAllEventOrganizersService(query) {
        return await this.adminRepo.getAllEventOrganizersRepo(query);
    }

    async getAllVenueManagersService(query) {
        return await this.adminRepo.getAllVenueManagersRepo(query);
    }

    /* ==================== UPDATE ==================== */

async updateAttendeeService(data) {
  const { attendeeId, firstName, lastName, email, username, phoneNumber } = data;

  const current = await this.adminRepo.getAttendeeByIdRepo(attendeeId);

  if (!current) {
    throw new HttpError("Attendee not found", 404);
  }

  const emailExists = await this.adminRepo.findAnotherUserByEmailRepo(
    email,
    current.userId
  );

  if (emailExists) {
    throw new HttpError("Email already exists", 400);
  }

  const usernameExists = await this.adminRepo.findAnotherUserByUsernameRepo(
    username,
    current.userId
  );

  if (usernameExists) {
    throw new HttpError("Username already exists", 400);
  }

  const phoneExists = await this.adminRepo.findAnotherUserByPhoneNumberRepo(
    phoneNumber,
    current.userId
  );

  if (phoneExists) {
    throw new HttpError("Phone number already exists", 400);
  }

  return await this.adminRepo.updateAttendeeRepo({
    attendeeId,
    firstName,
    lastName,
    email,
    username,
    phoneNumber,
  });
}


    async updateEventOrganizerProfileAdminService(data) {
  const {
    organizerId,
    firstName,
    lastName,
    email,
    username,
    phoneNumber,
    organization,
  } = data;

  const current = await this.adminRepo.getEventOrganizerByIdRepo(organizerId);
  if (!current) {
    throw new HttpError("Event organizer not found", 404);
  }

  const emailExists = await this.adminRepo.findAnotherUserByEmailRepo(email, current.userId);
  if (emailExists) {
    throw new HttpError("Email already exists", 400);
  }

  const usernameExists = await this.adminRepo.findAnotherUserByUsernameRepo(username, current.userId);
  if (usernameExists) {
    throw new HttpError("Username already exists", 400);
  }

  const phoneExists = await this.adminRepo.findAnotherUserByPhoneNumberRepo(phoneNumber, current.userId);
  if (phoneExists) {
    throw new HttpError("Phone number already exists", 400);
  }

  return await this.adminRepo.updateEventOrganizerRepo({
    organizerId,
    firstName,
    lastName,
    email,
    username,
    phoneNumber,
    organization,
  });
}

    async updateVenueManagerProfileAdminService(data) {
  const { managerId, firstName, lastName, email, username, phoneNumber } = data;

  const current = await this.adminRepo.getVenueManagerByIdRepo(managerId);
  if (!current) {
    throw new HttpError("Venue manager not found", 404);
  }

  const emailExists = await this.adminRepo.findAnotherUserByEmailRepo(email, current.userId);
  if (emailExists) {
    throw new HttpError("Email already exists", 400);
  }

  const usernameExists = await this.adminRepo.findAnotherUserByUsernameRepo(username, current.userId);
  if (usernameExists) {
    throw new HttpError("Username already exists", 400);
  }

  const phoneExists = await this.adminRepo.findAnotherUserByPhoneNumberRepo(phoneNumber, current.userId);
  if (phoneExists) {
    throw new HttpError("Phone number already exists", 400);
  }

  return await this.adminRepo.updateVenueManagerRepo({
    managerId,
    firstName,
    lastName,
    email,
    username,
    phoneNumber,
  });
}

    /* ==================== DELETE SOFT ==================== */

    async deleteAttendeeService(attendeeId) {
        const result = await this.adminRepo.softDeleteAttendeeRepo(attendeeId);
        if (result.affectedRows !== 1) {
            throw new HttpError("Attendee delete failed", 400);
        }
    }

    async deleteEventOrganizerService(organizerId) {
        const result = await this.adminRepo.softDeleteEventOrganizerRepo(organizerId);
        if (result.affectedRows !== 1) {
            throw new HttpError("Event organizer delete failed", 400);
        }
    }

    async deleteVenueManagerService(managerId) {
        const result = await this.adminRepo.softDeleteVenueManagerRepo(managerId);
        if (result.affectedRows !== 1) {
            throw new HttpError("Venue manager delete failed", 400);
        }
    }














    async countAllUsersService() {
    const attendees = await this.adminRepo.countAttendeesRepo();
    const organizers = await this.adminRepo.countEventOrganizersRepo();
    const managers = await this.adminRepo.countVenueManagersTotalRepo();

    return {
        totalUsers: attendees + organizers + managers,
        totalAttendees: attendees,
        totalEventOrganizers: organizers,
        totalVenueManagers: managers,
    };
}

async countEventsAndVenuesService() {
    const events = await this.adminRepo.countEventsRepo();
    const venues = await this.adminRepo.countVenuesRepo();

    return {
        totalEvents: events,
        totalVenues: venues
    };
}

async countPendingUsersService() {
    const pendingVM = await this.adminRepo.countPendingVenueManagersRepo();
    const pendingEO = await this.adminRepo.countPendingEventOrganizersRepo();

    return {
        pendingVenueManagers: pendingVM,
        pendingEventOrganizers: pendingEO,
        totalPending: pendingVM + pendingEO,
    };
}

async countVenueManagersService() {
    const approved = await this.adminRepo.countApprovedVenueManagersRepo();
    const rejected = await this.adminRepo.countRejectedVenueManagersRepo();

    return {
        approvedVenueManagers: approved,
        rejectedVenueManagers: rejected
    };
}

async countEventOrganizersService() {
    const approved = await this.adminRepo.countApprovedEventOrganizersRepo();
    const rejected = await this.adminRepo.countRejectedEventOrganizersRepo();

    return {
        approvedEventOrganizers: approved,
        rejectedEventOrganizers: rejected
    };
}


}

module.exports = AdminService;