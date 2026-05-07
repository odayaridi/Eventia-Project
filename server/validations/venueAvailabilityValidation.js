
// exports.createVenueAvailabilityValidator = [
//   body("managerId")
//     .notEmpty()
//     .withMessage("Manager ID is required")
//     .isInt()
//     .withMessage("Manager ID must be an integer"),

//   body("date")
//     .notEmpty()
//     .withMessage("Date is required")
//     .isISO8601()
//     .withMessage("Date must be a valid date in YYYY-MM-DD format"),

//   body("startTime")
//     .notEmpty()
//     .withMessage("Start time is required")
// ,
//   body("endTime")
//     .notEmpty()
//     .withMessage("End time is required")

// ];


const { body, param, query } = require('express-validator');

exports.createVenueValidator = [
    body("name").notEmpty().withMessage("Venue name should not be empty").isString().withMessage("Name should be string"),
    body("location").notEmpty().withMessage("Location should not be empty").isString(),
    body("locationLink").notEmpty().withMessage("Location link should not be empty").isString(),
    body("capacity").notEmpty().withMessage("Capacity should not be empty").isInt(),
    body("facilities").notEmpty().withMessage("Facilities should not be empty").isString(),
    body("managerId").notEmpty().withMessage("Manager ID should not be empty").isInt(),
];

exports.createVenueAvailabilityValidator = [
    body("managerId")
        .notEmpty()
        .withMessage("Manager ID should not be empty")
        .isInt({ gt: 0 })
        .withMessage("Manager ID must be a positive integer"),

    body("date")
        .notEmpty()
        .withMessage("Date should not be empty")
        .isISO8601()
        .withMessage("Date must be valid"),

    body("startTime")
        .notEmpty()
        .withMessage("Start time should not be empty"),

    body("endTime")
        .notEmpty()
        .withMessage("End time should not be empty"),

    body("price")
        .notEmpty()
        .withMessage("Price should not be empty")
        .isFloat({ gt: 0 })
        .withMessage("Price must be a number greater than 0"),
];


exports.getVenueAvailabilitiesValidator = [
  query("managerId")
    .notEmpty()
    .withMessage("Manager ID is required")
    .isInt()
    .withMessage("Manager ID must be an integer")
];