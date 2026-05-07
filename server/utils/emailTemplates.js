// const buildBookingConfirmationEmail = ({
//   username,
//   bookingId,
//   eventName,
//   eventDate,
//   startTime,
//   endTime,
//   venueName,
//   totalAmount,
//   currency = "USD",
// }) => {
//   return `
//   <!DOCTYPE html>
//   <html lang="en">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <title>Booking Confirmed</title>
//     </head>
//     <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif; color:#111827;">
//       <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f8; margin:0; padding:32px 16px;">
//         <tr>
//           <td align="center">
//             <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
              
//               <tr>
//                 <td style="background:linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding:32px 24px; text-align:center;">
//                   <div style="display:inline-block; background-color:#ffffff; color:#f97316; font-size:24px; font-weight:bold; width:52px; height:52px; line-height:52px; border-radius:12px; text-align:center; margin-bottom:14px;">
//                     E
//                   </div>
//                   <h1 style="margin:0; font-size:28px; line-height:36px; color:#ffffff; font-weight:700;">
//                     Eventia
//                   </h1>
//                   <p style="margin:8px 0 0 0; font-size:14px; line-height:22px; color:#ffedd5;">
//                     Booking confirmation
//                   </p>
//                 </td>
//               </tr>

//               <tr>
//                 <td style="padding:40px 32px 24px 32px;">
//                   <h2 style="margin:0 0 16px 0; font-size:24px; line-height:32px; color:#111827; font-weight:700;">
//                     Your booking is confirmed
//                   </h2>

//                   <p style="margin:0 0 16px 0; font-size:15px; line-height:26px; color:#4b5563;">
//                     Hello <strong style="color:#111827;">${username}</strong>,
//                   </p>

//                   <p style="margin:0 0 24px 0; font-size:15px; line-height:26px; color:#4b5563;">
//                     Your payment was successful and your booking has been confirmed.
//                     We’re excited to have you at the event.
//                   </p>

//                   <div style="background-color:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:18px 18px; margin:0 0 24px 0;">
//                     <p style="margin:0 0 10px 0; font-size:14px; color:#9a3412;"><strong>Booking ID:</strong> #${bookingId}</p>
//                     <p style="margin:0 0 10px 0; font-size:14px; color:#9a3412;"><strong>Event:</strong> ${eventName}</p>
//                     <p style="margin:0 0 10px 0; font-size:14px; color:#9a3412;"><strong>Date:</strong> ${eventDate}</p>
//                     <p style="margin:0 0 10px 0; font-size:14px; color:#9a3412;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
//                     <p style="margin:0 0 10px 0; font-size:14px; color:#9a3412;"><strong>Venue:</strong> ${venueName}</p>
//                     <p style="margin:0; font-size:14px; color:#9a3412;"><strong>Total Paid:</strong> ${totalAmount} ${currency.toUpperCase()}</p>
//                   </div>

//                   <p style="margin:0 0 16px 0; font-size:14px; line-height:24px; color:#6b7280;">
//                     Please keep this email for your records. You may also need your booking confirmation details when attending the event.
//                   </p>

//                   <p style="margin:0; font-size:14px; line-height:24px; color:#6b7280;">
//                     Best regards,<br />
//                     <strong style="color:#111827;">The Eventia Team</strong>
//                   </p>
//                 </td>
//               </tr>

//               <tr>
//                 <td style="padding:20px 32px 32px 32px; border-top:1px solid #f3f4f6; text-align:center;">
//                   <p style="margin:0; font-size:12px; line-height:20px; color:#9ca3af;">
//                     This is an automated booking confirmation email from Eventia.
//                   </p>
//                 </td>
//               </tr>

//             </table>
//           </td>
//         </tr>
//       </table>
//     </body>
//   </html>
//   `;
// };

// module.exports = buildBookingConfirmationEmail;



const buildBookingConfirmationEmail = ({
  username,
  bookingId,
  eventName,
  eventDate,
  startTime,
  endTime,
  venueName,
  totalAmount,
  currency = "USD",
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:24px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e5e7eb;">
            
            <tr>
              <td align="center" style="background:#f97316; padding:30px 20px;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="width:54px; height:54px; background:#ffffff; color:#f97316; font-size:28px; font-weight:800; border-radius:12px; line-height:54px;">
                      E
                    </td>
                  </tr>
                </table>

                <h1 style="margin:14px 0 4px; color:#ffffff; font-size:28px; line-height:34px; font-weight:800;">
                  Eventia
                </h1>

                <p style="margin:0; color:#ffffff; font-size:15px; line-height:22px; font-weight:600;">
                  Booking confirmation
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 30px 24px;">
                <h2 style="margin:0 0 16px; color:#111827; font-size:26px; line-height:34px;">
                  Your booking is confirmed
                </h2>

                <p style="margin:0 0 16px; color:#4b5563; font-size:15px; line-height:26px;">
                  Hello <strong style="color:#111827;">${username}</strong>,
                </p>

                <p style="margin:0 0 24px; color:#4b5563; font-size:15px; line-height:26px;">
                  Your payment was successful and your booking has been confirmed.
                  We’re excited to have you at the event.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed; border:1px solid #fed7aa; border-radius:12px;">
                  <tr>
                    <td style="padding:18px;">
                      <p style="margin:0 0 10px; color:#9a3412; font-size:14px;"><strong>Booking ID:</strong> #${bookingId}</p>
                      <p style="margin:0 0 10px; color:#9a3412; font-size:14px;"><strong>Event:</strong> ${eventName}</p>
                      <p style="margin:0 0 10px; color:#9a3412; font-size:14px;"><strong>Date:</strong> ${eventDate}</p>
                      <p style="margin:0 0 10px; color:#9a3412; font-size:14px;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
                      <p style="margin:0 0 10px; color:#9a3412; font-size:14px;"><strong>Venue:</strong> ${venueName}</p>
                      <p style="margin:0; color:#9a3412; font-size:14px;"><strong>Total Paid:</strong> ${totalAmount} ${currency.toUpperCase()}</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 16px; color:#6b7280; font-size:14px; line-height:24px;">
                  Please keep this email for your records.
                </p>

                <p style="margin:0; color:#6b7280; font-size:14px; line-height:24px;">
                  Best regards,<br />
                  <strong style="color:#111827;">The Eventia Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:18px 30px 28px; border-top:1px solid #f3f4f6;">
                <p style="margin:0; color:#9ca3af; font-size:12px; line-height:20px;">
                  This is an automated booking confirmation email from Eventia.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

module.exports = buildBookingConfirmationEmail;