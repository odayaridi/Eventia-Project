const HttpError = require("../utils/HttpError");
const PlatformSettingsRepository = require("../repositories/PlatformSettingsRepository");

class PlatformSettingsService {
  constructor() {
    this.platformSettingsRepo = new PlatformSettingsRepository();
  }

  /* ==================== EVENT TYPES ==================== */

  async getEventTypeNamesService() {
    return await this.platformSettingsRepo.getEventTypeNamesRepo();
  }

  async addEventTypeService(name) {
    const trimmedName = name?.trim();

    if (!trimmedName) {
      throw new HttpError("Event type name is required", 400);
    }

    const existing = await this.platformSettingsRepo.findEventTypeByNameRepo(trimmedName);
    if (existing) {
      throw new HttpError("Event type already exists", 400);
    }

    return await this.platformSettingsRepo.addEventTypeRepo(trimmedName);
  }

  async editEventTypeService(data) {
    const { id, name } = data;
    const trimmedName = name?.trim();

    if (!id) {
      throw new HttpError("Event type id is required", 400);
    }

    if (!trimmedName) {
      throw new HttpError("Event type name is required", 400);
    }

    const existingById = await this.platformSettingsRepo.findEventTypeByIdRepo(id);
    if (!existingById) {
      throw new HttpError("Event type not found", 404);
    }

    const existingByName = await this.platformSettingsRepo.findEventTypeByNameRepo(trimmedName);
    if (existingByName && existingByName.id !== Number(id)) {
      throw new HttpError("Event type name already exists", 400);
    }

    return await this.platformSettingsRepo.editEventTypeRepo(id, trimmedName);
  }

  async deleteEventTypeService(id) {
    if (!id) {
      throw new HttpError("Event type id is required", 400);
    }

    const existing = await this.platformSettingsRepo.findEventTypeByIdRepo(id);
    if (!existing) {
      throw new HttpError("Event type not found", 404);
    }

    const result = await this.platformSettingsRepo.deleteEventTypeRepo(id);

    if (result.affectedRows !== 1) {
      throw new HttpError("Failed to delete event type", 400);
    }
  }

  /* ==================== TICKET TYPES ==================== */

  async getTicketTypeNamesService() {
    return await this.platformSettingsRepo.getTicketTypeNamesRepo();
  }

  async addTicketTypeService(name) {
    const trimmedName = name?.trim();

    if (!trimmedName) {
      throw new HttpError("Ticket type name is required", 400);
    }

    const existing = await this.platformSettingsRepo.findTicketTypeByNameRepo(trimmedName);
    if (existing) {
      throw new HttpError("Ticket type already exists", 400);
    }

    return await this.platformSettingsRepo.addTicketTypeRepo(trimmedName);
  }

  async editTicketTypeService(data) {
    const { id, name } = data;
    const trimmedName = name?.trim();

    if (!id) {
      throw new HttpError("Ticket type id is required", 400);
    }

    if (!trimmedName) {
      throw new HttpError("Ticket type name is required", 400);
    }

    const existingById = await this.platformSettingsRepo.findTicketTypeByIdRepo(id);
    if (!existingById) {
      throw new HttpError("Ticket type not found", 404);
    }

    const existingByName = await this.platformSettingsRepo.findTicketTypeByNameRepo(trimmedName);
    if (existingByName && existingByName.id !== Number(id)) {
      throw new HttpError("Ticket type name already exists", 400);
    }

    return await this.platformSettingsRepo.editTicketTypeRepo(id, trimmedName);
  }

  async deleteTicketTypeService(id) {
    if (!id) {
      throw new HttpError("Ticket type id is required", 400);
    }

    const existing = await this.platformSettingsRepo.findTicketTypeByIdRepo(id);
    if (!existing) {
      throw new HttpError("Ticket type not found", 404);
    }

    const result = await this.platformSettingsRepo.deleteTicketTypeRepo(id);

    if (result.affectedRows !== 1) {
      throw new HttpError("Failed to delete ticket type", 400);
    }
  }
}

module.exports = PlatformSettingsService;