const PlatformSettingsService = require("../services/PlatformSettingsService");

class PlatformSettingsController {
  constructor() {
    this.platformSettingsService = new PlatformSettingsService();
  }

  /* ==================== EVENT TYPES ==================== */

  async getEventTypeNamesController(req, res, next) {
    try {
      const data = await this.platformSettingsService.getEventTypeNamesService();

      res.status(200).json({
        success: true,
        message: "Event type names fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async addEventTypeController(req, res, next) {
    try {
      const data = await this.platformSettingsService.addEventTypeService(req.body.name);

      res.status(201).json({
        success: true,
        message: "Event type added successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async editEventTypeController(req, res, next) {
    try {
      const data = await this.platformSettingsService.editEventTypeService(req.body);

      res.status(200).json({
        success: true,
        message: "Event type updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEventTypeController(req, res, next) {
    try {
      await this.platformSettingsService.deleteEventTypeService(req.body.id);

      res.status(200).json({
        success: true,
        message: "Event type deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /* ==================== TICKET TYPES ==================== */

  async getTicketTypeNamesController(req, res, next) {
    try {
      const data = await this.platformSettingsService.getTicketTypeNamesService();

      res.status(200).json({
        success: true,
        message: "Ticket type names fetched successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async addTicketTypeController(req, res, next) {
    try {
      const data = await this.platformSettingsService.addTicketTypeService(req.body.name);

      res.status(201).json({
        success: true,
        message: "Ticket type added successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async editTicketTypeController(req, res, next) {
    try {
      const data = await this.platformSettingsService.editTicketTypeService(req.body);

      res.status(200).json({
        success: true,
        message: "Ticket type updated successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicketTypeController(req, res, next) {
    try {
      await this.platformSettingsService.deleteTicketTypeService(req.body.id);

      res.status(200).json({
        success: true,
        message: "Ticket type deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PlatformSettingsController;