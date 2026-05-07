const { body,query } = require('express-validator');

exports.countEventBookingReqsValidator = [
       query('organizerId')
        .notEmpty().withMessage('Organizer Id is required')
]


exports.getEventVenueRequestsValidator = [
    query('organizerId')
        .notEmpty().withMessage('Organizer ID is required')
        .isInt({ gt: 0 }).withMessage('Organizer ID must be a positive integer')
       
];


exports.countEventRequestsValidator = [
     query('managerId')
     .notEmpty().withMessage('Manager ID is required')
     .isInt({ gt: 0 }).withMessage('Manager ID must be a positive integer')
]
