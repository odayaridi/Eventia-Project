// const express = require("express");
// const restrictTo = require("../middleware/restrictTo");
// const validationRequest = require("../middleware/validateRequest");
// const authenticateToken = require("../middleware/authenticateToken");
// const ChatBotController = require("../controllers/ChatBotController");
// const { askChatbotValidator } = require("../validations/chatbotValidation");

// const router = express.Router();
// const chatbotController = new ChatBotController();

// router.post(
//     "/askchatbot",
//     // authenticateToken,
//     // restrictTo("attendee"),
//     askChatbotValidator,
//     validationRequest,
//     chatbotController.askChatbot.bind(chatbotController)
// );

// module.exports = router;





const express = require("express");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");
const ChatBotController = require("../controllers/ChatBotController");
const { askChatbotValidator } = require("../validations/chatbotValidation");

const router = express.Router();
const chatbotController = new ChatBotController();

/**
 * General FAQ chatbot
 */
router.post(
    "/askchatbot",
    // authenticateToken,
    // restrictTo("attendee"),
    askChatbotValidator,
    validationRequest,
    chatbotController.askChatbot.bind(chatbotController)
);

/**
 * Event FAQ chatbot
 */
router.post(
    "/askchatbot/organizer",
    askChatbotValidator,
    validationRequest,
    chatbotController.askEventChatbot.bind(chatbotController)
);

/**
 * Venue FAQ chatbot
 */
router.post(
    "/askchatbot/manager",
    askChatbotValidator,
    validationRequest,
    chatbotController.askVenueChatbot.bind(chatbotController)
);

module.exports = router;