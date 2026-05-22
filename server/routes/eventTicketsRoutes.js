const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const { createEventTicketValidator, updateEventTicketValidator, getEventTicketsValidator } = require("../validations/eventTicketsValidation");
const EventTicketsController = require("../controllers/EventTicketsController");
const eventTicketsController = new EventTicketsController();

const router = express.Router();



router.get(
    "/get",
    authenticateToken,
    restrictTo('eventOrganizer'),
    getEventTicketsValidator,
    validationRequest,
    eventTicketsController.getEventTicketsController.bind(eventTicketsController)
);

// Venue Manager Support Request
router.post(
    "/create",
    authenticateToken,
    restrictTo('eventOrganizer'),
    createEventTicketValidator,
    validationRequest,
    eventTicketsController.createEventTicketsController.bind(eventTicketsController)
);

router.put(
    "/update",
    authenticateToken,
    restrictTo('eventOrganizer'),
    updateEventTicketValidator,
    validationRequest,
    eventTicketsController.updateEventTicketsController.bind(eventTicketsController)
);



router.get(
  "/getTicketTypes",
  authenticateToken,
  restrictTo('eventOrganizer'),
  eventTicketsController.getTicketTypesController.bind(eventTicketsController)
);



router.get(
  "/getTotalTicketsQuantityAllEvents",
  authenticateToken,
  restrictTo('eventOrganizer'),
  eventTicketsController.getEventsTotalTicketsQuantitiesController.bind(eventTicketsController)
);


module.exports = router;