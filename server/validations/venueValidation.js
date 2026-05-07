const { body, param, query } = require('express-validator');

exports.createVenueValidator = [
    body("name").notEmpty().withMessage("Venue name should not be empty").isString().withMessage("Name should be string"),
    body("location").notEmpty().withMessage("Location should not be empty").isString(),
    body("locationLink").notEmpty().withMessage("Location link should not be empty").isString(),
    body("capacity").notEmpty().withMessage("Capacity should not be empty").isInt(),
    body("facilities").notEmpty().withMessage("Facilities should not be empty").isString(),
    body("managerId").notEmpty().withMessage("Manager ID should not be empty").isInt(),
];

exports.updateVenueValidator = [
    body("id").notEmpty().withMessage("Venue ID is required").isInt(),
    body("name").optional().isString(),
    body("location").optional().isString(),
    body("locationLink").optional().isString(),
    body("capacity").optional().isInt(),
    body("facilities").optional().isString(),
    body("managerId").isInt(),
];


exports.fetchEventRequestsValidator = [
  query("managerId") // <--- Changed from body to query
    .notEmpty()
    .withMessage("Manager ID is required")
    .isInt()
    .withMessage("Manager ID must be an integer"),

  query("page") // <--- Changed from body to query
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be an integer greater than 0"),

  query("limit") // <--- Changed from body to query
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be an integer greater than 0")
];

exports.hasVenueValidator = [
    query("managerId").notEmpty().withMessage("Manager ID is required").isInt()
]

exports.getVenueInfoValidator = [
    query("managerId").notEmpty().withMessage("Manager ID is required").isInt()
]


exports.getVenueAvailabilityTimesValidator = [
  query('venueName').notEmpty().withMessage("Venue name is required"),
  query('date').notEmpty().withMessage("Date is required")
]


exports.getVenueAvailabilityDatesValidator = [
  query('venueName').notEmpty().withMessage("Venue name is required")
]