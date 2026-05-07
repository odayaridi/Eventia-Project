const TicketsService = require("../services/TicketService");
const HttpError = require("../utils/HttpError");

class TicketsController {
    constructor() {
        this.ticketsService = new TicketsService();
    }


    
// {
//     "ticketCode": "BT-1"
// }
      async validateTicket(req, res, next) {
        try {
            const { ticketCode } = req.body;

            if (!ticketCode) {
                throw new HttpError("Ticket code is required", 400);
            }

            // Call service to validate ticket
            const data = await this.ticketsService.validateTicket(ticketCode);

            res.status(200).json({success : "true" , message :"Ticket validated successfully" , data });
        } catch (error) {
            // Pass to your global error handler
            next(error);
        }
    }
}

module.exports = TicketsController;