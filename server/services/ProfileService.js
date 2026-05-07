const bcrypt = require("bcrypt");
const HttpError = require("../utils/HttpError");
const ProfileRepository = require("../repositories/ProfileRepository");
const UserRepository = require("../repositories/UserRepository");

class ProfileService {
  constructor() {
    this.profileRepo = new ProfileRepository();
    this.userRepo = new UserRepository();
  }

  async getAttendeeProfileService(attendeeId) {
    if (!attendeeId) {
      throw new HttpError("attendeeId is required", 400);
    }

    const profile = await this.profileRepo.getAttendeeProfileRepo(attendeeId);

    if (!profile) {
      throw new HttpError("Attendee profile not found", 404);
    }

    return profile;
  }

  async getEventOrganizerProfileService(organizerId) {
    if (!organizerId) {
      throw new HttpError("organizerId is required", 400);
    }

    const profile = await this.profileRepo.getEventOrganizerProfileRepo(organizerId);

    if (!profile) {
      throw new HttpError("Event organizer profile not found", 404);
    }

    return profile;
  }

  async getVenueManagerProfileService(managerId) {
    if (!managerId) {
      throw new HttpError("managerId is required", 400);
    }

    const profile = await this.profileRepo.getVenueManagerProfileRepo(managerId);

    if (!profile) {
      throw new HttpError("Venue manager profile not found", 404);
    }

    return profile;
  }

  async editAttendeeProfileService(data) {
  const { attendeeId, firstName, lastName, email, username, phoneNumber } = data;

  if (!attendeeId) {
    throw new HttpError("attendeeId is required", 400);
  }

  const currentProfile = await this.profileRepo.getAttendeeProfileRepo(attendeeId);

  if (!currentProfile) {
    throw new HttpError("Attendee profile not found", 404);
  }

  if (
    firstName === undefined &&
    lastName === undefined &&
    email === undefined &&
    username === undefined &&
    phoneNumber === undefined
  ) {
    throw new HttpError("At least one field is required to update", 400);
  }

  if (email && email !== currentProfile.email) {
    const existingUser = await this.profileRepo.findAnotherUserByEmailRepo(
      email,
      currentProfile.userId
    );

    if (existingUser) {
      throw new HttpError("Email already exists", 400);
    }
  }

  if (username && username !== currentProfile.username) {
    const existingUser = await this.profileRepo.findAnotherUserByUsernameRepo(
      username,
      currentProfile.userId
    );

    if (existingUser) {
      throw new HttpError("Username already exists", 400);
    }
  }

  if (phoneNumber && phoneNumber !== currentProfile.phoneNumber) {
    const existingUser = await this.profileRepo.findAnotherUserByPhoneNumberRepo(
      phoneNumber,
      currentProfile.userId
    );

    if (existingUser) {
      throw new HttpError("Phone number already exists", 400);
    }
  }

  return await this.profileRepo.editAttendeeProfileRepo({
    attendeeId,
    firstName,
    lastName,
    email,
    username,
    phoneNumber,
  });
}
}

module.exports = ProfileService;