const { body, query } = require('express-validator');

exports.createAnnouncementValidator = [
    body('eventName')
        .notEmpty().withMessage('Event name is required'),
    body('title')
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
    body('message')
        .notEmpty().withMessage('Announcement message is required')
        .isLength({ min: 3 }).withMessage('Message must be at least 3 characters long'),
    body('organizerId')
        .notEmpty().withMessage('Organizer ID is required'),
];


exports.getAnnouncementsValidator = [
    query('attendeeId')
        .notEmpty().withMessage('Attendee ID is required'),
];

exports.getOrganizerAnnouncementsValidator = [
    query('organizerId')
        .notEmpty().withMessage('Organizer ID is required'),
];