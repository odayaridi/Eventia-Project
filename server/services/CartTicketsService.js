const CartRepository = require("../repositories/CartRepository");
const CartTicketsRepository = require("../repositories/CartTicketsRepository");
const HttpError = require("../utils/HttpError");

class CartTicketsService {
    constructor() {
        this.cartTicketsRepo = new CartTicketsRepository();
        this.cartRepo = new CartRepository();
    }


    
// {
//   "attendeeId": 1,
//   "eventTickets": [
//     {
//       "eventTicketId": 1,
//       "quantity": 5
//     },
//     {
//       "eventTicketId": 2,
//       "quantity": 4
//     }
//   ]
// }
  async addCartTicketsService(cartTickets) {
    const cartExists = await this.cartRepo.attendeeCartExists(cartTickets.attendeeId);

    let cartId;

    if (!cartExists) {
        cartId = await this.cartRepo.addCartRepo(cartTickets.attendeeId);
    } else {
        cartId = cartExists.id;
    }

    const result = await this.cartTicketsRepo.insertCartTicketsBatch(
        cartId,
        cartTickets.eventTickets
    );

    if (!result) {
        throw new HttpError();
    }

    return cartId;
}


async getCartTicketsService(attendeeId){
    return await this.cartTicketsRepo.getCartTicketsRepo(attendeeId);
}

async deleteEventCartService(cartId,cartTicketsArr){
      if(!cartId || cartTicketsArr.length == 0){
                throw new HttpError('Cart Id is not passed or cartTicketsArr is empty',400);
            }
    for(let i =0; i<cartTicketsArr.length;i++) {
        const response = await this.cartTicketsRepo.deleteEventCartRepo(cartId,cartTicketsArr[i]);
    }
}
}

module.exports = CartTicketsService;