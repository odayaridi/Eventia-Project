const CartTicketsRepository = require("../repositories/CartTicketsRepository");
const EventRepository = require("../repositories/EventRepository");
const EventTicketsRepository = require("../repositories/EventTicketsRepository");
const QRCode = require("qrcode");
const OrderRepository = require("../repositories/OrderRepository");
const OrderTicketsRepository = require("../repositories/OrderTicketsRepository");
const PaymentRepository = require("../repositories/PaymentRepository");
const TicketsRepository = require("../repositories/TicketsRepository");
const HttpError = require("../utils/HttpError");

class OrderService {
    constructor() {
        this.orderRepo = new OrderRepository();
        this.orderTicketsRepo = new OrderTicketsRepository();
        this.eventRepo = new EventRepository();
        this.cartTicketsRepo = new CartTicketsRepository();
        this.eventTicketsRepo = new EventTicketsRepository();
        this.paymentRepo = new PaymentRepository();
        this.ticketRepo = new TicketsRepository();
    }

    // async insertOrderService(cartInfo,buyerId,cartId,transRef,totalCartPrice){
    //     if(cartInfo.length == 0 || !totalCartPrice){
    //         throw new HttpError();
    //     }
    //     for(let i = 0;i<cartInfo.length;i++){
    //          const eventId = await this.eventRepo.getEventIdByName(cartInfo[i].eventName);
    //          const newOrder = await this.orderRepo.insertOrderRepository(buyerId,eventId,cartInfo[i].totalEventPrice);
    //          const orderId = newOrder.insertId;

    //          for(let j = 0; j<cartInfo[i].ticket.length;j++) {
    //             let eventTicketId = await this.cartTicketsRepo.getEventTicketIdByCartTicketId(cartId);
    //             if(!eventTicketId){
    //                 throw new HttpError('Event ticket id is not found',404);
    //             }
    //             const newOrderTicket = await this.orderTicketsRepo.insertOrderTicketsRepo(orderId,eventTicketId,cartInfo[i].ticket[i].quantity,cartInfo[i].ticket[i].totalPrice);
    //             const originalQuantityAvailable = await this.eventTicketsRepo.getEventTicketQuantityAvailableByPk(eventTicketId);
    //             const modifiedQuantityAvailable = originalQuantityAvailable - cartInfo[i].ticket[i].quantity;
    //             if(modifiedQuantityAvailable < 0) {
    //                 throw new HttpError('Insufficient quantity',400);
    //             }
    //             await this.eventTicketsRepo.updateQuantityAvailableRepo(modifiedQuantityAvailable);
    //             const quantitySold = cartInfo[i].ticket[i].quantity;
    //             await this.eventTicketsRepo.updateQuantitySoldRepo(quantitySold);
    //          }
    //     }
    //       await this.paymentRepo.insertPaymentRepo(orderId,totalCartPrice,transRef);
    // }



//     async insertOrderService(cartInfo, buyerId, cartId, transRef, totalCartPrice) {
//     if (!cartInfo || cartInfo.length === 0 || !totalCartPrice) {
//         throw new HttpError('Cart is empty or total price missing', 400);
//     }

//     for (let i = 0; i < cartInfo.length; i++) {
//         const eventItem = cartInfo[i];

//         // 1️⃣ Get the event ID by name
//         const eventId = await this.eventRepo.getEventIdByName(eventItem.eventName);
//         if (!eventId) {
//             throw new HttpError(`Event not found: ${eventItem.eventName}`, 404);
//         }

//         // 2️⃣ Insert order for this event
//         const newOrder = await this.orderRepo.insertOrderRepository(buyerId, eventId, eventItem.totalEventPrice);
//         const orderId = newOrder.insertId;

//         // 3️⃣ Loop over tickets for this event
//         for (let j = 0; j < eventItem.tickets.length; j++) {
//             const ticket = eventItem.tickets[j];
//             console.log('ticketttttttttttt ',ticket);
//             console.log('ticket.cartTicketId ' + ticket.cartTicketId)
//             // Get event_ticket_id from cart ticket
//             const eventTicketId = await this.cartTicketsRepo.getEventTicketIdByCartTicketId(ticket.cartTicketId);
//             if (!eventTicketId) {
//                 throw new HttpError(`Event ticket not found for cartTicketId: ${ticket.cartTicketId}`, 404);
//             }

//             // Insert into order tickets
//             await this.orderTicketsRepo.insertOrderTicketsRepo(
//                 orderId,
//                 eventTicketId,
//                 ticket.quantity,
//                 ticket.totalPrice
//             );

//             // Update quantities
//             const originalQuantity = await this.eventTicketsRepo.getEventTicketQuantityAvailableByPk(eventTicketId);
//             const modifiedQuantity = originalQuantity - ticket.quantity;
//             if (modifiedQuantity < 0) {
//                 throw new HttpError(`Insufficient quantity for ticket ID: ${eventTicketId}`, 400);
//             }

//             await this.eventTicketsRepo.updateQuantityAvailableRepo(eventTicketId, modifiedQuantity);
//             await this.eventTicketsRepo.updateQuantitySoldRepo(eventTicketId, ticket.quantity);
//         }

//         // 4️⃣ Insert payment for this order
//         await this.paymentRepo.insertPaymentRepo(orderId, eventItem.totalEventPrice, transRef);


//        // await this.cartTicketsRepo.deleteCartTicketsRepo(cartId);
//     }
// }


async insertOrderService(cartInfo, buyerId, cartId, transRef, totalCartPrice) {

    if (!cartInfo || cartInfo.length === 0 || !totalCartPrice) {
        throw new HttpError('Cart is empty or total price missing', 400);
    }

    for (let i = 0; i < cartInfo.length; i++) {

        const eventItem = cartInfo[i];

        // 1️⃣ Get event ID
        const eventId = await this.eventRepo.getEventIdByName(eventItem.eventName);
        if (!eventId) {
            throw new HttpError(`Event not found: ${eventItem.eventName}`, 404);
        }

        // 2️⃣ Insert Order
        const newOrder = await this.orderRepo.insertOrderRepository(
            buyerId,
            eventId,
            eventItem.totalEventPrice
        );

        const orderId = newOrder.insertId;

        // 3️⃣ Loop over tickets for this event
        for (let j = 0; j < eventItem.tickets.length; j++) {

            const ticket = eventItem.tickets[j];

            // Get event_ticket_id from cart ticket
            const eventTicketId =
                await this.cartTicketsRepo.getEventTicketIdByCartTicketId(ticket.cartTicketId);

            if (!eventTicketId) {
                throw new HttpError(
                    `Event ticket not found for cartTicketId: ${ticket.cartTicketId}`,
                    404
                );
            }

            // 4️⃣ Insert OrderTickets
            const orderTicket =
                await this.orderTicketsRepo.insertOrderTicketsRepo(
                    orderId,
                    eventTicketId,
                    ticket.quantity,
                    ticket.totalPrice
                );

            const orderTicketId = orderTicket.insertId;

            // 5️⃣ Generate Tickets with QR codes per quantity
            for (let k = 0; k < ticket.quantity; k++) {

                // Ticket code for uniqueness
                const ticketCode = `${orderTicketId}-${k + 1}`;

                // Generate a URL that the employee can open
                const validationLink = `http://localhost:3010/validateTicket/${ticketCode}`;

                // Generate QR for the link
                const qrImage = await QRCode.toDataURL(validationLink);

                // Insert into Tickets table
                await this.ticketRepo.insertTicketRepo(
                    orderTicketId,
                    qrImage,
                    ticketCode
                );
            }

            // 6️⃣ Update Ticket Quantities
            const originalQuantity =
                await this.eventTicketsRepo.getEventTicketQuantityAvailableByPk(eventTicketId);

            const modifiedQuantity = originalQuantity - ticket.quantity;

            if (modifiedQuantity < 0) {
                throw new HttpError(
                    `Insufficient quantity for ticket ID: ${eventTicketId}`,
                    400
                );
            }

            await this.eventTicketsRepo.updateQuantityAvailableRepo(eventTicketId, modifiedQuantity);
            await this.eventTicketsRepo.updateQuantitySoldRepo(eventTicketId, ticket.quantity);
        }
    }

    // 7️⃣ Optional: Insert payment
    // await this.paymentRepo.insertPaymentRepo(orderId, eventItem.totalEventPrice, transRef);

    // 8️⃣ Optional: Clear Cart
    await this.cartTicketsRepo.deleteCartTicketsRepo(cartId);

    // return {
    //     message: "Order successfully created",
    //     totalPrice: totalCartPrice
    // };
}



}

module.exports = OrderService;