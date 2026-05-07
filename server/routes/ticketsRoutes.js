const express = require("express");
const validationRequest = require("../middleware/validateRequest");
const TicketsController = require("../controllers/TicketsController");
const { validateTicket } = require("../validations/ticketsValidation");

const router = express.Router();
const ticketsController = new TicketsController();

router.post(
    "/validate",
    validateTicket,         
    validationRequest,      
    ticketsController.validateTicket.bind(ticketsController)
);

module.exports = router;