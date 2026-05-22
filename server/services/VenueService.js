const { format } = require("date-fns/format");
const VenueRepository = require("../repositories/VenueRepository");
const HttpError = require("../utils/HttpError");
const VenueImagesRepository = require("../repositories/VenueImagesRepository");

class VenueService {
    constructor() {
        this.venueRepo = new VenueRepository();
        this.venueImagesRepo = new VenueImagesRepository();
    }

       async createVenueService(newVenue, files) {

        if (!files || files.length === 0) {
            throw new HttpError("At least 1 image is required");
        }

        const result = await this.venueRepo.createVenueRepo(newVenue);

        if (result.affectedRows !== 1) {
            throw new HttpError("Error creating venue");
        }

        const venueId = result.insertId;


        const imagePaths = files.map(file => file.filename);

        await this.venueImagesRepo.insertVenueImages(venueId, imagePaths);

        return {
            id: venueId,
            ...newVenue,
            images: imagePaths
        };
    }

    // =========================
    // UPDATE VENUE
    // =========================
    async updateVenueService(dto, files) {

        const result = await this.venueRepo.updateVenueRepo(dto);

        if (result.affectedRows !== 1) {
            throw new HttpError("Venue not found or nothing to update");
        }

    
        if (files && files.length > 0) {

            const imagePaths = files.map(file => file.filename);

            await this.venueImagesRepo.deleteByVenueId(dto.id);
            await this.venueImagesRepo.insertVenueImages(dto.id, imagePaths);
        }

        return dto;
    }

    // =========================
    // GET VENUE INFO
    // =========================
    async getVenueInfoService(managerId) {

        const venue = await this.venueRepo.getVenueInfoRepo(managerId);

        if (!venue) {
            throw new HttpError("Venue does not exist", 404);
        }

        const images = await this.venueImagesRepo.getImagesByVenueId(venue.id);

        const baseUrl = `${process.env.BASE_URL}/uploads/venueImages/`;

        const formattedVenue = {
            ...venue,
            images: images.map(img => baseUrl + img.image_url),
            createdAt: format(venue.createdAt, "dd/MM/yyyy HH:mm:ss")
        };

        return formattedVenue;
    }



    async filterVenuesService(filters) {
        return await this.venueRepo.filterVenuesRepo(filters);
    }

    async getVenuesNamesService(query) {
        return await this.venueRepo.getVenuesNamesRepo(query);
    }

    async getVenueAvailabilityDatesService(venueName) {
        return await this.venueRepo.getVenueAvailabilityDatesRepo(venueName);
    }

    async getVenueAvailabilityTimingsService(venueName,date) {
        return await this.venueRepo.getVenueAvailabilityTimesRepo(venueName,date);
    }


    async fetchEventRequestsService(query) {
        const venueId = await this.venueRepo.getVenueIdByManagerId(query.managerId);
        const { managerId, ...rest } = query;

        return await this.venueRepo.fetchEventRequestsRepo({
            ...rest,
            venueId
        });
    }

    async hasVenueService(managerId) {
        const venueExists = await this.venueRepo.hasVenueRepository(managerId);
        if(!venueExists) {
            return false;
        }
        return true;
    }


    async getVenueDashboardStatsService(managerId) {

        const venue = await this.venueRepo.getVenueByManager(managerId);

        if (!venue) {
            return {
                approvedBookings: 0,
                estimatedRevenue: 0,
                utilizationRate: 0,
                totalRequests: 0,
            };
        }

        const venueId = venue.id;

        // Run queries in parallel
        const [
            booked,
            total,
            revenue,
            requests
        ] = await Promise.all([
            this.venueRepo.countBookedSlots(venueId),
            this.venueRepo.countTotalSlots(venueId),
            this.venueRepo.sumBookedRevenue(venueId),
            this.venueRepo.countVenueRequests(venueId),
        ]);

        return {
            approvedBookings: booked,
            estimatedRevenue: revenue,
            utilizationRate: total > 0
                ? parseFloat(((booked / total) * 100).toFixed(1))
                : 0,
            totalRequests: requests,
        };
    }
}

module.exports = VenueService;