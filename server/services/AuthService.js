const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/HttpError');
const UserRepository = require('../repositories/UserRepository');
const EventOrganizerRepository = require('../repositories/EventOrganizerRepository');
const VenueManagerRepository = require('../repositories/VenueManagerRepository');
const AttendeeRepository = require('../repositories/AttendeeRepository');
const RoleRepository = require('../repositories/RoleRepository');
const AuthRepository = require('../repositories/AuthRepository');
const sendMail = require('../utils/mailer');

class AuthService {
  constructor() {
    this.userRepo = new UserRepository();
    this.eventOrganizerRepo = new EventOrganizerRepository();
    this.venueManagerRepo = new VenueManagerRepository();
    this.attendeeRepo = new AttendeeRepository();
    this.roleRepo = new RoleRepository();
    this.authRepo = new AuthRepository()
  }


  async registerService(userCredentials) {
  const role = await this.roleRepo.findRoleByName(userCredentials.role);
  if (!role) throw new HttpError('Invalid role', 400);

  const exists = await this.userRepo.findUserByEmailOrUsername(
    userCredentials.email,
    userCredentials.username
  );

  if (exists) throw new HttpError('User already exists with this email or username', 400);

  const userExists = await this.userRepo.findUserByPhone(userCredentials.phoneNumber);
  if (userExists) {
    throw new HttpError('User already exists with this phone number', 400);
  }

  const hashed = await bcrypt.hash(userCredentials.password, 10);

  const newUser = await this.userRepo.createUser({
    firstName: userCredentials.firstName,
    lastName: userCredentials.lastName,
    email: userCredentials.email,
    username: userCredentials.username,
    password: hashed,
    phoneNumber: userCredentials.phoneNumber,
    roleId: role.id,
  });

  switch (role.name) {
    case 'Attendee':
      await this.attendeeRepo.createAttendee(newUser.id);
      break;

    case 'Event Organizer':
      await this.eventOrganizerRepo.createEventOrganizer(
        newUser.id,
        userCredentials.organization,
        userCredentials.commercialRegistrationDocument
      );
      break;

    case 'Venue Manager':
      await this.venueManagerRepo.createVenueManager(
        newUser.id,
        userCredentials.venueAuthorizationDocument
      );
      break;
  }
}



async login(dto) {
  const user = await this.userRepo.findUserByUsername(dto.username);
  if (!user) throw new HttpError("Invalid credentials", 401);

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new HttpError("Invalid credentials", 401);

  let roleIdField = {};

  if (user.roleName === "Event Organizer") {
    const userExists = await this.eventOrganizerRepo.isEventOrganizerApproved(user.id);
    if (userExists.approved == 0) {
      throw new HttpError("Your account has not yet been approved by the admin", 403);
    }

    if(userExists.approved == 2) {
      throw new HttpError('Your account has been rejected by the admin',403)
    }

    const organizerId = await this.eventOrganizerRepo.getOrganizerIdByUserId(user.id);
    roleIdField = { organizerId };
  } else if (user.roleName === "Venue Manager") {
    const userExists = await this.venueManagerRepo.isVenueManagerApproved(user.id);
    if (userExists.approved == 0) {
      throw new HttpError("Your account has not yet been approved by the admin", 403);
    }

    if(userExists.approved == 2) {
      throw new HttpError('Your account has been rejected by the admin',403)
    }

    const managerId = await this.venueManagerRepo.getManagerIdByUserId(user.id);
    roleIdField = { managerId };
  } else if (user.roleName === "Attendee") {
    const attendeeId = await this.attendeeRepo.getAttendeeIdByUserId(user.id);
    roleIdField = { attendeeId };
  }

  else {
     roleIdField = { userId:user.id };
  }

  const roleMap = {
    Admin: "admin",
    "Event Organizer": "eventOrganizer",
    "Venue Manager": "venueManager",
    Attendee: "attendee",
  };

  const payload = {
    userId: user.id,
    roleName: roleMap[user.roleName],
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });



   return {
    accessToken: token,
    user: {
      userId: user.id,   
      username: user.username,
      email: user.email,
      phoneNumber: user.phone_number,
      role: roleMap[user.roleName],
      ...roleIdField,
    },
  };
}



async forgotPassword(email) {
  const user = await this.authRepo.findUserByEmail(email);

  if (!user) {
    throw new HttpError(
      "Email is not registered in our system to change the password",
      404
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      purpose: "password_reset",
    },
    process.env.JWT_RESET_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif; color:#111827;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f8; margin:0; padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding:32px 24px; text-align:center;">
                  <div style="display:inline-block; background-color:#ffffff; color:#f97316; font-size:24px; font-weight:bold; width:52px; height:52px; line-height:52px; border-radius:12px; text-align:center; margin-bottom:14px;">
                    E
                  </div>
                  <h1 style="margin:0; font-size:28px; line-height:36px; color:#ffffff; font-weight:700;">
                    Eventia
                  </h1>
                  <p style="margin:8px 0 0 0; font-size:14px; line-height:22px; color:#ffedd5;">
                    Secure password reset request
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 32px 24px 32px;">
                  <h2 style="margin:0 0 16px 0; font-size:24px; line-height:32px; color:#111827; font-weight:700;">
                    Reset your password
                  </h2>

                  <p style="margin:0 0 16px 0; font-size:15px; line-height:26px; color:#4b5563;">
                    Hello,
                  </p>

                  <p style="margin:0 0 16px 0; font-size:15px; line-height:26px; color:#4b5563;">
                    We received a request to reset the password for your Eventia account.
                    Click the button below to create a new password.
                  </p>

                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
                    <tr>
                      <td align="center" style="border-radius:10px; background-color:#f97316;">
                        <a
                          href="${resetLink}"
                          style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px;"
                        >
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <div style="background-color:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:16px; margin:0 0 24px 0;">
                    <p style="margin:0; font-size:14px; line-height:24px; color:#9a3412;">
                      <strong>Security Notice:</strong> This password reset link will expire in <strong>15 minutes</strong>.
                    </p>
                  </div>

                  <p style="margin:0 0 12px 0; font-size:14px; line-height:24px; color:#4b5563;">
                    If the button does not work, copy and paste this link into your browser:
                  </p>

                  <p style="margin:0 0 24px 0; word-break:break-word;">
                    <a
                      href="${resetLink}"
                      style="font-size:14px; line-height:24px; color:#ea580c; text-decoration:none;"
                    >
                      ${resetLink}
                    </a>
                  </p>

                  <p style="margin:0 0 16px 0; font-size:14px; line-height:24px; color:#6b7280;">
                    If you did not request a password reset, you can safely ignore this email.
                    Your account will remain secure.
                  </p>

                  <p style="margin:0; font-size:14px; line-height:24px; color:#6b7280;">
                    Best regards,<br />
                    <strong style="color:#111827;">The Eventia Team</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px 32px 32px; border-top:1px solid #f3f4f6; text-align:center;">
                  <p style="margin:0; font-size:12px; line-height:20px; color:#9ca3af;">
                    This is an automated security email from Eventia. Please do not reply to this message.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  await sendMail(user.email, "Reset your password", html);
}


async verifyResetToken(token){

  try{

    const decoded = jwt.verify(
      token,
      process.env.JWT_RESET_SECRET
    );

    if(decoded.purpose !== "password_reset"){
      throw new HttpError("Invalid token",400);
    }

    return { valid:true };

  }catch(err){
    throw new HttpError("Invalid or expired reset token",400);
  }
}



async resetPassword(token,newPassword){

  let decoded;

  try{
    decoded = jwt.verify(
      token,
      process.env.JWT_RESET_SECRET
    );
  }catch(err){
    throw new HttpError("Invalid or expired token",400);
  }

  const hashed = await bcrypt.hash(newPassword,10);

  await this.authRepo.updatePassword(decoded.userId,hashed);
}

}

module.exports = AuthService;













