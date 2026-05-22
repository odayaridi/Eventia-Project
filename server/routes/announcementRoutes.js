


const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const restrictTo = require('../middleware/restrictTo');
const validationRequest = require('../middleware/validateRequest');
const AnnouncementController = require('../controllers/AnnouncementController');
const {
    createAnnouncementValidator,
    getAnnouncementsValidator,
    getOrganizerAnnouncementsValidator,
} = require('../validations/announcementValidation');

const router = express.Router();
const announcementController = new AnnouncementController();

// Organizer creates announcement
router.post(
    '/createEventAnnouncement',
    authenticateToken,
    restrictTo('eventOrganizer'),
    createAnnouncementValidator,
    validationRequest,
    announcementController.createAnnouncementController.bind(announcementController)
);

// Attendee fetches their announcements (GET — uses query params)
router.get(
    '/getBookedEventAnncs',
    authenticateToken,
    restrictTo('attendee'),
    getAnnouncementsValidator,
    validationRequest,
    announcementController.getAnnouncementsController.bind(announcementController)
);

// Organizer fetches their own announcements
router.get(
    '/getOrganizerAnncs',
    authenticateToken,
    restrictTo('eventOrganizer'),
    getOrganizerAnnouncementsValidator,
    validationRequest,
    announcementController.getOrganizerAnnouncementsController.bind(announcementController)
);

module.exports = router;
