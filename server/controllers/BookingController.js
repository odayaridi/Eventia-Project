const BookingService = require("../services/BookingService");
const sendMail = require("../utils/mailer");

class BookingController {

    constructor(){
        this.bookingService = new BookingService();
    }





    async createBookingController(req,res,next){
        try{

            const {attendeeId,eventId} = req.params;
            const bookingData = req.body;

            const result = await this.bookingService.createBookingService(
                attendeeId,
                eventId,
                bookingData.tickets
            );

            res.status(201).json({
                success:true,
                bookingId:result.bookingId
            });

        }catch(error){
            next(error);
        }
    }


    async getBookingsByAttendeeIdController (req,res,next) {
        try {
            const {attendeeId} = req.query;
            const data  = await this.bookingService.getBookingsByAttendeeIdService(attendeeId);
            res.status(200).json({success : true, message: 'Bookings Retrieved Successfully',data})
        } catch (error) {
            next(error)
        }
    }



async deleteBookingController(req, res, next) {
  try {
    const { eventName, bookingId } = req.params;

    const {
      attendeeEmail,
      eventDate,
      eventTime,
      venueName,
      eventType,
      totalPrice,
      ticketsCount,
      tickets = [],
    } = req.body || {};

    await this.bookingService.deleteBookingService(eventName, bookingId);

    if (attendeeEmail) {
      const ticketsRows = Array.isArray(tickets)
        ? tickets
            .map(
              (ticket) => `
                <tr>
                  <td style="padding:12px; border-bottom:1px solid #f3f4f6; font-weight:700;">
                    ${ticket.ticketType || "Ticket"}
                  </td>
                  <td style="padding:12px; border-bottom:1px solid #f3f4f6;">
                    ${ticket.quantity || 0}
                  </td>
                  <td style="padding:12px; border-bottom:1px solid #f3f4f6;">
                    $${Number(ticket.priceSnapshot || 0).toFixed(2)}
                  </td>
                </tr>
              `
            )
            .join("")
        : "";

      const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:24px 12px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e5e7eb;">
                
                <!-- HEADER -->
                <tr>
                  <td align="center" style="background:#f97316; padding:30px 20px;">
                    <table>
                      <tr>
                        <td align="center" style="width:54px; height:54px; background:#ffffff; color:#f97316; font-size:28px; font-weight:800; border-radius:12px; line-height:54px;">
                          E
                        </td>
                      </tr>
                    </table>

                    <h1 style="margin:14px 0 4px; color:#ffffff; font-size:28px; font-weight:800;">
                      Eventia
                    </h1>

                    <p style="margin:0; color:#ffffff; font-size:15px; font-weight:600;">
                      Booking cancellation confirmation
                    </p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:36px 30px 24px;">
                    <h2 style="margin:0 0 16px; color:#111827; font-size:26px;">
                      Your booking has been cancelled
                    </h2>

                    <p style="margin:0 0 16px; color:#4b5563;">
                      Hello,
                    </p>

                    <p style="margin:0 0 20px; color:#4b5563;">
                      Your booking for <strong>${eventName}</strong> has been deleted successfully.
                      Since the event has not started yet, please contact our refund support team.
                    </p>

                    <!-- REFUND BOX -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed; border:1px solid #fed7aa; border-radius:12px;">
                      <tr>
                        <td style="padding:16px; color:#9a3412;">
                          <strong>Refund Contact:</strong> +96103187846
                        </td>
                      </tr>
                    </table>

                    <br/>

                    <!-- SUMMARY -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:12px;">
                      <tr>
                        <td style="padding:14px; background:#f9fafb; font-weight:700;">
                          Booking Summary
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px;">
                          <p><strong>Event:</strong> ${eventName}</p>
                          <p><strong>Type:</strong> ${eventType || "N/A"}</p>
                          <p><strong>Date:</strong> ${eventDate || "N/A"}</p>
                          <p><strong>Time:</strong> ${eventTime || "N/A"}</p>
                          <p><strong>Venue:</strong> ${venueName || "N/A"}</p>
                          <p><strong>Tickets:</strong> ${ticketsCount || 0}</p>
                          <p><strong>Total Paid:</strong> $${Number(totalPrice || 0).toFixed(2)}</p>
                        </td>
                      </tr>
                    </table>

                    ${
                      ticketsRows
                        ? `
                        <br/>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:12px;">
                          <tr style="background:#f9fafb;">
                            <th align="left" style="padding:12px;">Ticket Type</th>
                            <th align="left" style="padding:12px;">Quantity</th>
                            <th align="left" style="padding:12px;">Price</th>
                          </tr>
                          ${ticketsRows}
                        </table>
                        `
                        : ""
                    }

                    <p style="margin:24px 0 16px; color:#6b7280;">
                      Please keep this email for your records.
                    </p>

                    <p style="color:#6b7280;">
                      Best regards,<br/>
                      <strong>The Eventia Team</strong>
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
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

      await sendMail(attendeeEmail, "Your Eventia booking was cancelled", html);
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}


}

module.exports = BookingController;