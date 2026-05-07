// const AnnouncementService = require('../services/AnnouncementService');

// class AnnouncementController {
//     constructor() {
//         this.announcementService = new AnnouncementService();
//     }

//     // Organizer creates announcement


    

// // {
// //   "organizerId": 2,
// //   "eventName": "Activity Conference",
// //   "title": "reminder",
// //   "message": "The event will start 30 minutes earlier than scheduled."
// // }
//     async createAnnouncementController(req, res, next) {
//         try {
//             const { eventName, message,title } = req.body;
//             const organizerId = req.body.organizerId; // extracted from params/body

//             const announcement = await this.announcementService.createAnnouncementService(
//                 req,
//                 eventName,
//                 organizerId,
//                 title,
//                 message
//             );

//             res.status(201).json({
//                 success: true,
//                 message: 'Announcement created successfully',
//                 announcement
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     // Attendee fetches announcements
//     async getAnnouncementsController(req, res, next) {
//         try {
//             const attendeeId = req.body.attendeeId; // extracted from query params

//             const announcements = await this.announcementService.getAnnouncementsForAttendeeService(attendeeId);

//             res.status(200).json({
//                 success: true,
//                 announcements
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     async getOrganizerAnnouncementsController(req,res,next) {
//         try {
//             const {organizerId} = req.query;
//             const data = await this.announcementService.getOrganizerAnnouncementsService(organizerId);
//             res.status(200).json({success:"true",message:"Organizer Announcements returned successfully" , data});
//         } catch (error) {
//             next(error);
//         }
//     }
// }

// module.exports = AnnouncementController;



const AnnouncementService = require('../services/AnnouncementService');

class AnnouncementController {
    constructor() {
        this.announcementService = new AnnouncementService();
    }

    // POST /createEventAnnouncement
    // Body: { organizerId, eventName, title, message }
    async createAnnouncementController(req, res, next) {
        try {
            const { eventName, message, title, organizerId } = req.body;

            const announcement = await this.announcementService.createAnnouncementService(
                req,
                eventName,
                organizerId,
                title,
                message
            );

            res.status(201).json({
                success: true,
                message: 'Announcement created successfully',
                announcement,
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /getBookedEventAnncs?attendeeId=X
    // ── FIX: read attendeeId from req.query (was incorrectly req.body) ──
    async getAnnouncementsController(req, res, next) {
        try {
            const attendeeId = req.query.attendeeId;

            const announcements =
                await this.announcementService.getAnnouncementsForAttendeeService(attendeeId);

            res.status(200).json({
                success: true,
                announcements,
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /getOrganizerAnncs?organizerId=X
    async getOrganizerAnnouncementsController(req, res, next) {
        try {
            const { organizerId } = req.query;

            const data =
                await this.announcementService.getOrganizerAnnouncementsService(organizerId);

            res.status(200).json({
                success: 'true',
                message: 'Organizer Announcements returned successfully',
                data,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AnnouncementController;