const MessageService = require("../services/MessageService");

class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  async createOrGetConversationController(req, res, next) {
    try {
      const { organizerId, managerId, venueId } = req.body;

      const data = await this.messageService.createOrGetConversationService({
        organizerId,
        managerId,
        venueId,
      });

      res.status(200).json({
        success: true,
        message: "Conversation retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessagesController(req, res, next) {
    try {
      const { conversationId } = req.params;

      const data = await this.messageService.getMessagesService(Number(conversationId));

      res.status(200).json({
        success: true,
        message:
          data.length > 0
            ? "Messages retrieved successfully"
            : "No messages found for this conversation",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVenuesChattingController(req, res, next) {
    try {
      const { organizerId } = req.query;

      const data = await this.messageService.getVenuesChattingService(Number(organizerId));

      res.status(200).json({
        success: true,
        message: data.length > 0
          ? "Venues retrieved successfully"
          : "No venues found",
        data,
      });
    } catch (error) {
      next(error);
    }
  }



  async getOrganizersChattingController(req, res, next) {
  try {
    const { managerId } = req.query;

    const data = await this.messageService.getOrganizersChattingService(Number(managerId));

    res.status(200).json({
      success: true,
      message: data.length > 0
        ? "Organizers retrieved successfully"
        : "No organizers found",
      data,
    });
  } catch (error) {
    next(error);
  }
}














async getOrganizerUnreadSummaryController(req, res, next) {
  try {
    const { organizerId } = req.query;

    const data = await this.messageService.getOrganizerUnreadSummaryService(
      Number(organizerId)
    );

    res.status(200).json({
      success: true,
      message: "Organizer unread summary fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async getManagerUnreadSummaryController(req, res, next) {
  try {
    const { managerId } = req.query;

    const data = await this.messageService.getManagerUnreadSummaryService(
      Number(managerId)
    );

    res.status(200).json({
      success: true,
      message: "Manager unread summary fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async markConversationReadController(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { readerUserId } = req.body;

    const data = await this.messageService.markConversationReadService({
      conversationId: Number(conversationId),
      readerUserId: Number(readerUserId),
    });

    res.status(200).json({
      success: true,
      message: "Conversation messages marked as read successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}


}

module.exports = MessageController;