// const { body } = require("express-validator");
//  exports.registerValidator = [
//   body("email").isEmail().withMessage("Invalid email"),
//   body("username").notEmpty().withMessage("Username is required"),
//   body("password").notEmpty().withMessage("Password is required"),
//   body("role")
//     .notEmpty()
//     .withMessage("Role is required")
//     .isIn(["Venue Manager", "Event Organizer", "Attendee","Admin"])
//     .withMessage("Invalid role"),
//   body("phoneNumber").optional().isString(),
//   body("organization").optional().isString(),
//   body("commercialRegistrationDocument").optional().isString(),
//   body("venueAuthorizationDocument").optional().isString(),
// ];


const { body } = require("express-validator");

// exports.registerValidator = [
//   body("email").isEmail().withMessage("Invalid email"),
//   body("username").notEmpty().withMessage("Username is required"),
//   body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
//   body("role")
//     .isIn(["Venue Manager", "Event Organizer", "Attendee", "Admin"])
//     .withMessage("Invalid role"),
//   body("phoneNumber").notEmpty().withMessage("Phone number is required"),
//   body("organization").optional(),
// ];



exports.registerValidator = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  body("email")
    .isEmail()
    .withMessage("Invalid email"),

  body("username")
    .notEmpty()
    .withMessage("Username is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .isIn(["Venue Manager", "Event Organizer", "Attendee", "Admin"])
    .withMessage("Invalid role"),

  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required"),

  body("organization").optional(),
];

 exports.loginValidator = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];



exports.forgotPasswordValidator = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
];

exports.verifyResetTokenValidator = [
  body("token")
    .notEmpty()
    .withMessage("Token is required")
];

exports.resetPasswordValidator = [
  body("token")
    .notEmpty()
    .withMessage("Token is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];