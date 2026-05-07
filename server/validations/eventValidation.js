const { body, query, param } = require('express-validator');

exports.createEventValidator = [
    body('name')
        .notEmpty().withMessage('Event name is required')
        .isLength({ min: 3 }).withMessage('Event name must be at least 3 characters'),

    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

    body('organizerId')
        .notEmpty().withMessage('Organizer ID is required'),

    body('eventType')
        .notEmpty().withMessage('Event type is required'),

    body('venueName')
        .notEmpty().withMessage('Venue name is required'),


    body('date')
        .notEmpty().withMessage('date is required'),

    body('capacity')
        .notEmpty().withMessage('Capacity is required')
        .isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),

    body('startTime')
        .notEmpty().withMessage('Start time is required'),

    body('endTime')
        .notEmpty().withMessage('End time is required'),
];

exports.approveEventVenueRequestValidator = [
    body('eventId')
        .notEmpty().
        withMessage('Event ID is required'),

    body('venueAvailabilityId')
        .notEmpty().
        withMessage('Venue Availability Id is required'),
];





exports.filterEventsValidation = [

    query('eventName')
    .optional()
    .isString(),

    query('venueName')
        .optional()
        .isString(),


    query('eventTypeName')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Event type name must be at least 2 characters long'),

    query('startDate')
        .optional(),


    query('endDate')
        .optional(),

    query('location')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Location must be at least 2 characters'),


        
    query('description')
        .optional()
        .isString(),

    query('date')
        .optional(),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),



];



exports.getEventsByOrganizerValidator = [
    param('organizerId')
        .notEmpty().
        withMessage('Organizer ID is required'),
]



exports.updateEventValidator = [

    body('eventId')
        .notEmpty().withMessage('Event ID is required')
        .isInt().withMessage('Event ID must be a number'),

    body("venueName")
        .notEmpty().withMessage("Venue name is required")
        .isString().withMessage("Venue name must be a string"),

    body("eventTypeName")
        .notEmpty().withMessage("Event type is required")
        .isString().withMessage("Event type must be a string"),

    body("name")
        .notEmpty().withMessage("Event name is required")
        .isString().withMessage("Event name must be a string"),

    body("description")
        .notEmpty().withMessage("Description is required")
        .isString().withMessage("Description must be a string"),

    body("imageUrl")
        .optional()
        .isString().withMessage("Image must be a string"),

    body("date")
        .notEmpty().withMessage("Date is required"),


    body("startTime")
        .notEmpty().withMessage("Start time is required"),


    body("endTime")
        .notEmpty().withMessage("End time is required"),

    body("capacity")
        .notEmpty().withMessage("Capacity is required")
        .isInt({ min: 1 }).withMessage("Capacity must be a positive number")
];





exports.deleteEventValidator = [
    param('eventId')
        .notEmpty().
        withMessage('Event ID is required'),
]



