const CartTicketsService = require("../services/CartTicketsService");

class CartTicketsController {
    constructor() {
        this.cartTicketsService = new CartTicketsService();
    }

    async addCartTicketsController(req,res,next){
        try {
            const cartTickets = req.body;
           const cartId =  await this.cartTicketsService.addCartTicketsService(cartTickets);
            res.status(200).json({success:"true",message:'Event Tickets are added successfully to the cart',data:cartId});
        } catch (error) {
            next(error);
        }
    }


    async getCartTicketsController(req,res,next) {
        try {
            const {attendeeId} = req.params;
            const data = await this.cartTicketsService.getCartTicketsService(attendeeId);
             res.status(200).json({success:"true",message:'Event Tickets are retrieved successfully',...data});
        } catch (error) {
            next(error);
        }
    }


    async deleteEventCartController(req,res,next) {
        try {
            const cartTicketsObj = req.body;
            await this.cartTicketsService.deleteEventCartService(cartTicketsObj.cartId,cartTicketsObj.cartTicketsArr);
            res.status(200).json({success:"true",message:'Cart tickets deleted successfully'});
        } catch (error) {
            next(error);
        }
    }
}


module.exports = CartTicketsController;