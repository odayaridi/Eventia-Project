const ProfileService = require("../services/ProfileService");

class ProfileController {
  constructor() {
    this.profileService = new ProfileService();
  }

  async getAttendeeProfileController(req, res, next) {
    try {
      const { attendeeId } = req.query;

      const data = await this.profileService.getAttendeeProfileService(
        Number(attendeeId)
      );

      res.status(200).json({
        success: true,
        message: "Attendee profile fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventOrganizerProfileController(req, res, next) {
    try {
      const { organizerId } = req.query;

      const data = await this.profileService.getEventOrganizerProfileService(
        Number(organizerId)
      );

      res.status(200).json({
        success: true,
        message: "Event organizer profile fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVenueManagerProfileController(req, res, next) {
    try {
      const { managerId } = req.query;

      const data = await this.profileService.getVenueManagerProfileService(
        Number(managerId)
      );

      res.status(200).json({
        success: true,
        message: "Venue manager profile fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async editAttendeeProfileController(req, res, next) {
    try {
      const data = await this.profileService.editAttendeeProfileService(req.body);

      res.status(200).json({
        success: true,
        message: "Attendee profile updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;