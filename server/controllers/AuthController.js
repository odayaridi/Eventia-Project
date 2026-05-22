
const AuthService = require('../services/AuthService');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async register(req, res, next) {
    try {
      const userData = req.body;

      // Extract filenames from Multer and put them in userData for the Service
      if (req.files) {
        if (req.files.commercialRegistrationDocument) {
          userData.commercialRegistrationDocument = req.files.commercialRegistrationDocument[0].filename;
        }
        if (req.files.venueAuthorizationDocument) {
          userData.venueAuthorizationDocument = req.files.venueAuthorizationDocument[0].filename;
        }
      }

      await this.authService.registerService(userData);
      res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }














  async forgotPassword(req,res,next){
  try{

    await this.authService.forgotPassword(req.body.email);

    res.status(200).json({
      success:true,
      message:"A reset link has been sent."
    });

  }catch(err){
    next(err);
  }
}

async verifyResetToken(req,res,next){
  try{

    const result =
      await this.authService.verifyResetToken(req.body.token);

    res.status(200).json(result);

  }catch(err){
    next(err);
  }
}

async resetPassword(req,res,next){
  try{

    await this.authService.resetPassword(
      req.body.token,
      req.body.newPassword
    );

    res.status(200).json({
      success:true,
      message:"Password reset successful"
    });

  }catch(err){
    next(err);
  }
}
}
module.exports = AuthController;