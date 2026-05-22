const MessageRepository = require("../repositories/MessageRepository");
const HttpError = require("../utils/HttpError");

class MessageService {
  constructor() {
    this.messageRepo = new MessageRepository();
  }

  async createOrGetConversationService(payload) {
    const organizerId = Number(payload.organizerId);
    const managerId = Number(payload.managerId);
    const venueId =
      payload.venueId === undefined || payload.venueId === null || payload.venueId === ""
        ? null
        : Number(payload.venueId);

    if (!organizerId || !managerId) {
      throw new HttpError("Organizer ID and Manager ID are required", 400);
    }

    const organizerExists = await this.messageRepo.checkOrganizerExistsRepo(organizerId);
    if (!organizerExists) {
      throw new HttpError("Organizer not found", 404);
    }

    const managerExists = await this.messageRepo.checkManagerExistsRepo(managerId);
    if (!managerExists) {
      throw new HttpError("Manager not found", 404);
    }

    if (venueId !== null) {
      const venueExists = await this.messageRepo.checkVenueExistsRepo(venueId);
      if (!venueExists) {
        throw new HttpError("Venue not found", 404);
      }
    }

    let conversation = await this.messageRepo.findConversationRepo(
      organizerId,
      managerId,
      venueId
    );

    if (!conversation) {
      const result = await this.messageRepo.createConversationRepo({
        organizerId,
        managerId,
        venueId,
      });

      conversation = await this.messageRepo.getConversationByIdRepo(result.insertId);
    }

    return conversation;
  }

  async getMessagesService(conversationId) {
    if (!conversationId) {
      throw new HttpError("Conversation ID is required", 400);
    }

    const conversationExists = await this.messageRepo.getConversationByIdRepo(conversationId);
    if (!conversationExists) {
      throw new HttpError("Conversation not found", 404);
    }

    return await this.messageRepo.getMessagesByConversationIdRepo(conversationId);
  }

  async sendMessageService(payload) {
    const conversationId = Number(payload.conversationId);
    const senderId = Number(payload.senderId);
    const message = payload.message?.trim();

    if (!conversationId) {
      throw new HttpError("Conversation ID is required", 400);
    }

    if (!senderId) {
      throw new HttpError("Sender ID is required", 400);
    }

    if (!message) {
      throw new HttpError("Message should not be empty", 400);
    }

    const conversation = await this.messageRepo.getConversationByIdRepo(conversationId);
    if (!conversation) {
      throw new HttpError("Conversation not found", 404);
    }

    const senderExists = await this.messageRepo.checkUserExistsRepo(senderId);
    if (!senderExists) {
      throw new HttpError("Sender user not found", 404);
    }

    const inserted = await this.messageRepo.createMessageRepo({
      conversationId,
      senderId,
      message,
    });

    const savedMessage = await this.messageRepo.getMessageByIdRepo(inserted.insertId);

    return savedMessage;
  }

  async getVenuesChattingService(organizerId) {
    if (!organizerId) {
      throw new HttpError("Organizer ID is required", 400);
    }

    const organizerExists = await this.messageRepo.checkOrganizerExistsRepo(organizerId);
    if (!organizerExists) {
      throw new HttpError("Organizer not found", 404);
    }

    return await this.messageRepo.getVenuesChattingRepo(organizerId);
  }



  async getOrganizersChattingService(managerId) {
  if (!managerId) {
    throw new HttpError("Manager ID is required", 400);
  }

  const managerExists = await this.messageRepo.checkManagerExistsRepo(managerId);
  if (!managerExists) {
    throw new HttpError("Manager not found", 404);
  }

  return await this.messageRepo.getOrganizersChattingRepo(managerId);
}


async getOrganizerUnreadSummaryService(organizerId) {
  if (!organizerId) {
    throw new HttpError("Organizer ID is required", 400);
  }

  const organizerExists = await this.messageRepo.checkOrganizerExistsRepo(organizerId);
  if (!organizerExists) {
    throw new HttpError("Organizer not found", 404);
  }

  return await this.messageRepo.getOrganizerUnreadSummaryRepo(organizerId);
}

async getManagerUnreadSummaryService(managerId) {
  if (!managerId) {
    throw new HttpError("Manager ID is required", 400);
  }

  const managerExists = await this.messageRepo.checkManagerExistsRepo(managerId);
  if (!managerExists) {
    throw new HttpError("Manager not found", 404);
  }

  return await this.messageRepo.getManagerUnreadSummaryRepo(managerId);
}

async markConversationReadService(payload) {
  const conversationId = Number(payload.conversationId);
  const readerUserId = Number(payload.readerUserId);

  if (!conversationId) {
    throw new HttpError("Conversation ID is required", 400);
  }

  if (!readerUserId) {
    throw new HttpError("Reader user ID is required", 400);
  }

  const conversation = await this.messageRepo.getConversationByIdRepo(conversationId);
  if (!conversation) {
    throw new HttpError("Conversation not found", 404);
  }

  const readerExists = await this.messageRepo.checkUserExistsRepo(readerUserId);
  if (!readerExists) {
    throw new HttpError("Reader user not found", 404);
  }

  const result = await this.messageRepo.markConversationReadRepo({
    conversationId,
    readerUserId,
  });

  return {
    affectedRows: result.affectedRows,
  };
}

async getReceiverUserIdForMessageService(conversationId, senderId) {
  return await this.messageRepo.getReceiverUserIdForMessageRepo(
    Number(conversationId),
    Number(senderId)
  );
}

async getUnreadSummaryForUserService(userId) {
  return await this.messageRepo.getUnreadSummaryForUserRepo(Number(userId));
}








async getConversationParticipantsService(conversationId) {
  const id = Number(conversationId);

  if (!id) {
    throw new HttpError("Conversation ID is required", 400);
  }

  const participants = await this.messageRepo.getConversationParticipantsRepo(id);

  if (!participants) {
    throw new HttpError("Conversation not found", 404);
  }

  return participants;
}


}

module.exports = MessageService;