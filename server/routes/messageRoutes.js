const express = require("express");
const authenticateToken = require("../middleware/authenticateToken");
const restrictTo = require("../middleware/restrictTo");
const validationRequest = require("../middleware/validateRequest");
const MessageController = require("../controllers/MessageController");
const {
  createOrGetConversationValidator,
  getMessagesValidator,
  getVenuesChattingValidator,
  getOrganizersChattingValidator,
  markConversationReadValidator,
  getManagerUnreadSummaryValidator,
  getOrganizerUnreadSummaryValidator,
} = require("../validations/messageValidations");

const router = express.Router();
const messageController = new MessageController();

router.post(
  "/conversation",
  // authenticateToken,
  // restrictTo("eventOrganizer", "venueManager"),
  createOrGetConversationValidator,
  validationRequest,
  messageController.createOrGetConversationController.bind(messageController)
);

router.get(
  "/:conversationId/messages",
  // authenticateToken,
  // restrictTo("eventOrganizer", "venueManager"),
  getMessagesValidator,
  validationRequest,
  messageController.getMessagesController.bind(messageController)
);

router.get(
  "/getVenuesChatting",
  // authenticateToken,
  // restrictTo("eventOrganizer"),
  getVenuesChattingValidator,
  validationRequest,
  messageController.getVenuesChattingController.bind(messageController)
);




router.get(
  "/getOrganizersChatting",
  // authenticateToken,
  // restrictTo("venueManager"),
  getOrganizersChattingValidator,
  validationRequest,
  messageController.getOrganizersChattingController.bind(messageController)
);












router.get(
  "/unread/organizer",
  // authenticateToken,
  // restrictTo("eventOrganizer"),
  getOrganizerUnreadSummaryValidator,
  validationRequest,
  messageController.getOrganizerUnreadSummaryController.bind(messageController)
);

router.get(
  "/unread/manager",
  // authenticateToken,
  // restrictTo("venueManager"),
  getManagerUnreadSummaryValidator,
  validationRequest,
  messageController.getManagerUnreadSummaryController.bind(messageController)
);

router.put(
  "/:conversationId/mark-read",
  // authenticateToken,
  // restrictTo("eventOrganizer", "venueManager"),
  markConversationReadValidator,
  validationRequest,
  messageController.markConversationReadController.bind(messageController)
);

module.exports = router;