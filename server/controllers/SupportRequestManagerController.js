const SupportRequestManagerService = require("../services/SupportRequestManagerService");
const HttpError = require("../utils/HttpError");
const sendMail = require("../utils/mailer");

class SupportRequestManagerController {
    constructor(){
        this.supportRequestManagerService = new SupportRequestManagerService();
    }



    

    async createSupportReqController(req,res,next) {
        try {
            const data = await this.supportRequestManagerService.createSupportReqService(req.body);

            res.status(201).json({
                success: "true",
                message: "Venue Manager request submitted successfully in the system",
                data
            });

        } catch (error) {
            next(error);
        }
    }

    async resolveManagerController(req, res, next) {
        try {
          const { id, username, email, subject, message } = req.body || {};

          await this.supportRequestManagerService.resolveManagerService(id);

          if (email) {
            const safeUsername = username || "Eventia user";
            const safeSubject = subject || "Contact Request";
            const safeMessage = message || "N/A";

            const html = `
            <!DOCTYPE html>
            <html>
            <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:24px 12px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e5e7eb;">
                      <tr>
                        <td align="center" style="background:#f97316; padding:30px 20px;">
                          <div style="width:54px; height:54px; background:#ffffff; color:#f97316; font-size:28px; font-weight:800; border-radius:12px; line-height:54px;">E</div>
                          <h1 style="margin:14px 0 4px; color:#ffffff; font-size:28px; font-weight:800;">Eventia</h1>
                          <p style="margin:0; color:#ffffff; font-size:15px; font-weight:600;">Contact request resolved</p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:36px 30px 24px;">
                          <h2 style="margin:0 0 16px; color:#111827; font-size:26px;">Your issue has been resolved</h2>

                          <p style="margin:0 0 16px; color:#4b5563;">Dear <strong>${safeUsername}</strong>,</p>

                          <p style="margin:0 0 20px; color:#4b5563;">
                            We are happy to inform you that your venue manager contact request has been reviewed and marked as resolved by the Eventia admin team.
                          </p>

                          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:12px;">
                            <tr>
                              <td style="padding:14px; background:#f9fafb; font-weight:700;">Request Summary</td>
                            </tr>
                            <tr>
                              <td style="padding:16px;">
                                <p><strong>Subject:</strong> ${safeSubject}</p>
                                <p><strong>Message:</strong> ${safeMessage}</p>
                                <p><strong>Status:</strong> Resolved</p>
                              </td>
                            </tr>
                          </table>

                          <p style="margin:24px 0 16px; color:#6b7280;">
                            If you still need assistance, you may submit a new contact request through Eventia.
                          </p>

                          <p style="color:#6b7280;">
                            Best regards,<br/>
                            <strong>The Eventia Team</strong>
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding:18px; border-top:1px solid #f3f4f6; color:#9ca3af; font-size:12px;">
                          This is an automated email from Eventia.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `;

      await sendMail(email, "Your Eventia venue manager request has been resolved", html);
    }

    res.status(200).json({ success: true, message: "Resolved successfully" });
  } catch (error) {
    next(error);
  }
}


    async getManagerRequestsController(req,res,next){
        try {
            const data = await this.supportRequestManagerService.getManagerRequestsService();
             res.status(200).json({success : true , message:"Fetched successfully",data})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = SupportRequestManagerController;