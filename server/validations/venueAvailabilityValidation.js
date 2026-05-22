const { body, param, query } = require("express-validator");

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
    .isInt({ gt: 0 })
    .withMessage("Manager ID must be a positive integer"),
];

exports.updateVenueAvailabilityValidator = [
  param("venueAvailabilityId")
    .notEmpty()
    .withMessage("Venue availability ID is required"),
   

  body("managerId")
    .notEmpty()
    .withMessage("Manager ID is required")
    .isInt({ gt: 0 })
    .withMessage("Manager ID must be a positive integer"),

  body("date")
    .notEmpty()
    .withMessage("Date should not be empty")
    .isISO8601()
    .withMessage("Date must be valid"),

  body("startTime")
    .notEmpty()
    .withMessage("Start time should not be empty")
,

  body("endTime")
    .notEmpty()
    .withMessage("End time should not be empty"),

  body("price")
    .notEmpty()
    .withMessage("Price should not be empty")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0"),
];

exports.deleteVenueAvailabilityValidator = [
  param("venueAvailabilityId")
    .notEmpty()
    .withMessage("Venue availability ID is required"),
  
  body("managerId")
    .notEmpty()
    .withMessage("Manager ID is required")

];