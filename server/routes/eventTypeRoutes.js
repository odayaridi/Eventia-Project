const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const authenticateToken = require("../middleware/authenticateToken");
const EventTypeController = require("../controllers/EventTypeController");

const eventTypeRoutes = express.Router();
const eventTypeController = new EventTypeController();


eventTypeRoutes.get(
    "/getEventTypes",
    // authenticateToken,
    // restrictTo('eventOrganizer'),

    eventTypeController.getAllEventTypesController.bind(eventTypeController)
);

module.exports = eventTypeRoutes;