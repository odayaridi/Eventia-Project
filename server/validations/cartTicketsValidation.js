const { body } = require('express-validator');

exports.addCartTicketsValidator = [

    body('attendeeId')
        .notEmpty().withMessage('Attendee ID is required')
        .isInt({ min: 1 }).withMessage('Attendee ID must be a positive integer'),

    body('eventTickets')
        .notEmpty().withMessage('Event tickets are required')
        .isArray({ min: 1 }).withMessage('Event tickets must be a non-empty array'),

    body('eventTickets.*.eventTicketId')
        .notEmpty().withMessage('Event Ticket ID is required')
        .isInt({ min: 1 }).withMessage('Event Ticket ID must be a positive integer'),

    body('eventTickets.*.quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

];