const { body,query } = require('express-validator');

exports.createEventTicketValidator = [

    // eventName → required string
    body('eventName')
        .notEmpty().withMessage('Event name is required')
        .isString().withMessage('Event name must be a string')
        .isLength({ min: 2, max: 150 }).withMessage('Event name must be between 2 and 150 characters')
        .trim(),

    // type → required string (ticket type)
    body('type')
        .notEmpty().withMessage('Ticket type is required')
        .isString().withMessage('Ticket type must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Ticket type must be between 2 and 100 characters')
        .trim(),

    // perks → optional
    body('perks')
      .notEmpty().withMessage('Perks is required')
        .isString().withMessage('Perks must be a string')
        .trim(),

    // price → required positive number
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),

    // quantityAvailable → required non-negative integer
    body('quantityAvailable')
        .notEmpty().withMessage('Quantity available is required')
        .isInt({ min: 0 }).withMessage('Quantity available must be 0 or greater')
];



exports.updateEventTicketValidator = [
    // eventName → required string
    body('eventTicketId')
      .notEmpty().withMessage('EventTicket ID is required')
        .isInt({ gt: 0 }).withMessage('EventTicket ID must be a positive integer'),
    // type → required string (ticket type)
    body('type')
        .notEmpty().withMessage('Ticket type is required')
        .isString().withMessage('Ticket type must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Ticket type must be between 2 and 100 characters')
        .trim(),

    // perks
    body('perks')
        .notEmpty().withMessage('Perks is required')
        .isString().withMessage('Perks must be a string')
        .trim(),

    // price → required positive number
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),

    // quantityAvailable → required non-negative integer
    body('quantityAvailable')
        .notEmpty().withMessage('Quantity available is required')
        .isInt({ min: 0 }).withMessage('Quantity available must be 0 or greater')
];




exports.getEventTicketsValidator = [

    query('organizerId')
         .notEmpty().withMessage("OrganizerId should not be empty"),
    
];