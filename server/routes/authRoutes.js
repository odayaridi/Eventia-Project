const express = require("express");
const AuthController = require("../controllers/AuthController");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const { registerValidator, loginValidator, resetPasswordValidator, verifyResetTokenValidator, forgotPasswordValidator } = require("../validations/authValidation");
const upload = require("../middleware/uploadMiddleware");
const createUploadMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();
const authController = new AuthController();


const uploadDocuments = createUploadMiddleware({
    uploadDir: 'public/uploads/documents',
    fileType: 'document'
});

router.post(
    "/register",

    uploadDocuments.fields([
        { name: 'commercialRegistrationDocument', maxCount: 1 },
        { name: 'venueAuthorizationDocument', maxCount: 1 }
    ]),

    registerValidator,
    validationRequest,

    authController.register.bind(authController)
);

router.post("/login", loginValidator, validationRequest, authController.login.bind(authController));





router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validationRequest,
  authController.forgotPassword.bind(authController)
);

router.post(
  "/verify-reset-token",
  verifyResetTokenValidator,
  validationRequest,
  authController.verifyResetToken.bind(authController)
);

router.post(
  "/reset-password",
  resetPasswordValidator,
  validationRequest,
  authController.resetPassword.bind(authController)
);

module.exports = router;