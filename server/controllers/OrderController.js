const OrderService = require("../services/OrderService");

class OrderController {
    constructor() {
        this.orderService = new OrderService();
    }

    // http://localhost:3010/api/order/create/buyerId/1/cartId/1
    
// {
//     "data": [
//         {
//             "eventName": "Activity Conference",
//             "eventDescription": "A Conference food stalls, and family activities.",
//             "imageUrl": "https://example.com/images/spring-music-festival.jpg",
//             "eventDate": "2026-08-21T21:00:00.000Z",
//             "startEndTime": "15:00:00 - 20:00:00",
//             "venueName": "HERO ROOK",
//             "eventType": "Conference",
//             "tickets": [
//                 {
//                     "cartTicketId": 2,
//                     "ticketTypeName": "General",
//                     "quantity": 4,
//                     "ticketPrice": "123.00",
//                     "totalPrice": "492.00"
//                 },
//                 {
//                     "cartTicketId": 1,
//                     "ticketTypeName": "VIP",
//                     "quantity": 5,
//                     "ticketPrice": "130.00",
//                     "totalPrice": "650.00"
//                 }
//             ],
//             "totalEventPrice": "1142.00"
//         },
//         {
//             "eventName": "Kiki Conference",
//             "eventDescription": "A Conference food stalls, and family activities.",
//             "imageUrl": "https://example.com/images/spring-music-festival.jpg",
//             "eventDate": "2026-09-09T21:00:00.000Z",
//             "startEndTime": "10:00:00 - 12:00:00",
//             "venueName": "Kiki ",
//             "eventType": "Conference",
//             "tickets": [
//                 {
//                     "cartTicketId": 4,
//                     "ticketTypeName": "VIP",
//                     "quantity": 2,
//                     "ticketPrice": "100.00",
//                     "totalPrice": "200.00"
//                 }
//             ],
//             "totalEventPrice": "200.00"
//         }
//     ],
//     "cartTotalPrice": "1342.00"
// }
    async insertOrderController(req,res,next) {
        try {
            const cartInfo = req.body;
            const {buyerId} = req.params;
            const {cartId} = req.params;
            await this.orderService.insertOrderService(cartInfo.data,buyerId,cartId,'hi',cartInfo.cartTotalPrice);
            res.status(201).json({success: 'true'})
        } catch (error) {
            next(error);
        }
    }
}

module.exports = OrderController;