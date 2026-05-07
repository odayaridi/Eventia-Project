// const AuthService = require('../services/AuthService');
// const HttpError = require('../utils/HttpError');

// class AuthController {
//   constructor() {
//     this.authService = new AuthService();
//   }



//   // {
// //   "email": "eventorganizer@example.com",
// //   "username": "eventorganizer",
// //   "password": "123456",
// //   "role": "Event Organizer",
// //   "phoneNumber": "133-456-7890",
// //   "organization": "bakk",
// //   "commercialRegistrationDocument" : "blabla"
// // }


// // {
// //   "email": "attendee@example.com",
// //   "username": "attendee",
// //   "password": "123456",
// //   "role": "Attendee",
// //   "phoneNumber": "133-456-7r90"
// // }


// // {
// //   "email": "venuemanager2@example.com",
// //   "username": "venuemanager2",
// //   "password": "123456",
// //   "role": "Venue Manager",
// //   "phoneNumber": "133-456-ui2323",
// //   "venueAuthorizationDocument" :"2jiui2"
// // }

// // {
// //   "email": "admin@example.com",
// //   "username": "admin",
// //   "password": "123456",
// //   "role": "Admin",
// //   "phoneNumber": "131-456-7r2323"
// // }

//   async register(req, res, next) {
//     try {
//       const user = req.body
//       await this.authService.registerService(user);
//       res.status(201).json({ success: "true", message: "User registered successfully in the system"});

//         // const data = await this.orderProdsService.getAllOrderProdsService();
//         // if (data.length !== 0) {
//         //     res.status(200).json({ success: "true", message: "All orders' products are retrieved successfully", data });
//         // }
//         // else {
//         //     res.status(200).json({ success: "true", message: "No orders exist to retrieve their products", data });
//         // }
//     } catch (err) {
//       next(err);
//     }
//   }



//   // {
// //   "username": "admin",
// //   "password": "123456"
// // }


//   async login(req, res, next) {
//     try {
//       const result = await this.authService.login(req.body);
//       res.status(200).json(result);
//     } catch (err) {
//       next(err);
//     }
//   }

//   async getProfile(req, res, next) {
//     try {
//       res.json(req.user);
//     } catch (err) {
//       next(err);
//     }
//   }
// }

// module.exports = AuthController;

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
      message:"If an account exists, a reset link has been sent."
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