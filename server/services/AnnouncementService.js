// const AnnouncementRepository = require('../repositories/AnnouncementRepository');
// const EventRepository = require('../repositories/EventRepository');

// class AnnouncementService {
//     constructor() {
//         this.announcementRepo = new AnnouncementRepository();
//         this.eventRepo = new EventRepository();
//     }

//     async createAnnouncementService(req, eventName, organizerId,title ,message) {
//         const io = req.app.get('io');
//         const connectedAttendees = req.app.get('connectedAttendees');

//         const eventId = await this.eventRepo.getEventIdByName(eventName);
//         const announcement = await this.announcementRepo.createAnnouncement(eventId, organizerId,title, message);

//         // Emit to all connected attendees who booked
//         const bookedAttendees = await this.announcementRepo.getBookedAttendees(eventId);
//         // bookedAttendees.forEach(att => {
//         //     const socket = connectedAttendees[att.attendeeId];
//         //     if (socket) socket.emit('newAnnouncement', announcement);
//         // });
//         bookedAttendees.forEach(att => {
//   const socket = connectedAttendees[String(att.attendeeId)]; // convert to string
//   if (socket) socket.emit('newAnnouncement', announcement);
// });

// console.log("Connected attendees:", Object.keys(connectedAttendees));
// console.log("Booked attendees:", bookedAttendees.map(a => a.attendeeId));

//         return announcement;
//     }

//     async getAnnouncementsForAttendeeService(attendeeId) {
//         return await this.announcementRepo.getAnnouncementsForAttendee(attendeeId);
//     }


//     async getOrganizerAnnouncementsService(organizerId) {
//         return await this.announcementRepo.getOrganizerAnnouncementsRepo(organizerId);
//     } 
// }

// module.exports = AnnouncementService;



const AnnouncementRepository = require('../repositories/AnnouncementRepository');
const EventRepository = require('../repositories/EventRepository');

class AnnouncementService {
    constructor() {
        this.announcementRepo = new AnnouncementRepository();
        this.eventRepo = new EventRepository();
    }

    async createAnnouncementService(req, eventName, organizerId, title, message) {
        const io = req.app.get('io');
        const connectedAttendees = req.app.get('connectedAttendees');

        const eventId = await this.eventRepo.getEventIdByName(eventName);

        const announcement = await this.announcementRepo.createAnnouncement(
            eventId,
            organizerId,
            title,
            message
        );

        // Emit to all connected attendees who booked this event
        const bookedAttendees = await this.announcementRepo.getBookedAttendees(eventId);

        bookedAttendees.forEach((att) => {
            const socket = connectedAttendees[String(att.attendeeId)];
            if (socket) {
                socket.emit('newAnnouncement', announcement);
            }
        });

        console.log('Connected attendees:', Object.keys(connectedAttendees));
        console.log('Booked attendees:', bookedAttendees.map((a) => a.attendeeId));

        return announcement;
    }

    async getAnnouncementsForAttendeeService(attendeeId) {
        return await this.announcementRepo.getAnnouncementsForAttendee(attendeeId);
    }

    async getOrganizerAnnouncementsService(organizerId) {
        return await this.announcementRepo.getOrganizerAnnouncementsRepo(organizerId);
    }
}

module.exports = AnnouncementService;