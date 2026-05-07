const AdminService = require("../services/AdminService");

class AdminController {
    constructor() {
        this.adminService = new AdminService();
    }



    

// {
//     "venueManagerName": "venuemanager2"
// }

    async acceptVenueManagerController(req, res, next) {
        try {
            const { venueManagerName } = req.body;
            await this.adminService.acceptVenueManagerService(venueManagerName);
            res.status(200).json({ success: "true", message: "Venue manager approved successfully" });
        } catch (error) {
            next(error);
        }
    }


    

// {
//     "venueManagerName": "venuemanager2"
// }

    async rejectVenueManagerController(req, res, next) {
        try {
            const { venueManagerName } = req.body;
            await this.adminService.rejectVenueManagerService(venueManagerName);
            res.status(200).json({ success: "true", message: "Venue manager rejected successfully" });
        } catch (error) {
            next(error);
        }
    }


    // {
//     "organizerName": "eventorganizer2"
// }


    async acceptEventOrganizerController(req, res, next) {
        try {
            const { organizerName } = req.body;
            await this.adminService.acceptEventOrganizerService(organizerName);
            res.status(200).json({ success: "true", message: "Event organizer approved successfully" });
        } catch (error) {
            next(error);
        }
    }



    // {
//     "organizerName": "eventorganizer2"
// }


    async rejectEventOrganizerController(req, res, next) {
        try {
            const { organizerName } = req.body;
            await this.adminService.rejectEventOrganizerService(organizerName);
            res.status(200).json({ success: "true", message: "Event organizer rejected successfully" });
        } catch (error) {
            next(error);
        }
    }




        async getPendingEventOrganizersController(req, res, next) {
        try {
            const data = await this.adminService.getPendingEventOrganizersService(req.query);

            res.status(200).json({
                success: true,
                message: "Pending event organizers fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async getPendingVenueManagersController(req, res, next) {
        try {
            const data = await this.adminService.getPendingVenueManagersService(req.query);

            res.status(200).json({
                success: true,
                message: "Pending venue managers fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }
















    /* ==================== ATTENDEES ==================== */

    async getAllAttendeesController(req, res, next) {
        try {
            const data = await this.adminService.getAllAttendeesService(req.query);

            res.status(200).json({
                success: true,
                message: "Attendees fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async updateAttendeeController(req, res, next) {
        try {
            const data = await this.adminService.updateAttendeeService(req.body);

            res.status(200).json({
                success: true,
                message: "Attendee updated successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteAttendeeController(req, res, next) {
        try {
            const { attendeeId } = req.body;
            await this.adminService.deleteAttendeeService(attendeeId);

            res.status(200).json({
                success: true,
                message: "Attendee deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }

    /* ==================== EVENT ORGANIZERS ==================== */

    async getAllEventOrganizersController(req, res, next) {
        try {
            const data = await this.adminService.getAllEventOrganizersService(req.query);

            res.status(200).json({
                success: true,
                message: "Event organizers fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async updateEventOrganizerProfileAdminController(req, res, next) {
        try {
            const data = await this.adminService.updateEventOrganizerProfileAdminService(req.body);

            res.status(200).json({
                success: true,
                message: "Event organizer updated successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteEventOrganizerController(req, res, next) {
        try {
            const { organizerId } = req.body;
            await this.adminService.deleteEventOrganizerService(organizerId);

            res.status(200).json({
                success: true,
                message: "Event organizer deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }

    /* ==================== VENUE MANAGERS ==================== */

    async getAllVenueManagersController(req, res, next) {
        try {
            const data = await this.adminService.getAllVenueManagersService(req.query);

            res.status(200).json({
                success: true,
                message: "Venue managers fetched successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async updateVenueManagerProfileAdminController(req, res, next) {
        try {
            const data = await this.adminService.updateVenueManagerProfileAdminService(req.body);

            res.status(200).json({
                success: true,
                message: "Venue manager updated successfully",
                data
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteVenueManagerController(req, res, next) {
        try {
            const { managerId } = req.body;
            await this.adminService.deleteVenueManagerService(managerId);

            res.status(200).json({
                success: true,
                message: "Venue manager deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }










    
    async countAllUsersController(req, res, next) {
        try {
            const data = await this.adminService.countAllUsersService();
            res.status(200).json({ success: true, message: "User counts fetched successfully", data });
        } catch (error) { next(error); }
    }
 
    async countEventsAndVenuesController(req, res, next) {
        try {
            const data = await this.adminService.countEventsAndVenuesService();
            res.status(200).json({ success: true, message: "Events and venues counts fetched successfully", data });
        } catch (error) { next(error); }
    }
 
    async countPendingUsersController(req, res, next) {
        try {
            const data = await this.adminService.countPendingUsersService();
            res.status(200).json({ success: true, message: "Pending users counts fetched successfully", data });
        } catch (error) { next(error); }
    }
 
    async countVenueManagersController(req, res, next) {
        try {
            const data = await this.adminService.countVenueManagersService();
            res.status(200).json({ success: true, message: "Venue managers approval counts fetched successfully", data });
        } catch (error) { next(error); }
    }
 
    async countEventOrganizersController(req, res, next) {
        try {
            const data = await this.adminService.countEventOrganizersService();
            res.status(200).json({ success: true, message: "Event organizers approval counts fetched successfully", data });
        } catch (error) { next(error); }
    }
 
}


module.exports = AdminController;