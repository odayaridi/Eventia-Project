const { format } = require("date-fns/format");
const EventFeedbackRepository = require("../repositories/EventFeedbackRepository");
const Groq = require("groq-sdk");
const HttpError = require("../utils/HttpError");

class EventFeedbackService {
    constructor() {
        this.eventFeedbackRepo = new EventFeedbackRepository();
    }



    async sendFeedbackService(feedback){
        return await this.eventFeedbackRepo.sendFeedbackRepo(feedback)
    }


      async checkAttendeeRatedService(attendeeId, eventId) {
    if (!attendeeId || !eventId) {
      throw new HttpError("attendeeId and eventId are required", 400);
    }

    const ratingExists = await this.eventFeedbackRepo.checkAttendeeRatedRepo(
      attendeeId,
      eventId
    );

    return ratingExists;
  }

  

async getAttendeeFeedbacksService(attendeeId) {
  if (!attendeeId) {
    throw new HttpError("attendeeId is required", 400);
  }

  const feedbacks = await this.eventFeedbackRepo.getAttendeeFeedbacksRepo(attendeeId);

  // Format dates here
  const formattedFeedbacks = feedbacks.map((fb) => ({
    ...fb,
    createdAt: fb.createdAt
      ? format(fb.createdAt, "dd MMM yyyy, HH:mm:ss")
      : null,
  }));

  return formattedFeedbacks;
}


 async getOrganizerEventsFeedbacksService(query) {
    const organizerId = Number(query.organizerId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    if (!organizerId) {
      throw new HttpError("organizerId is required", 400);
    }

    const result = await this.eventFeedbackRepo.getOrganizerEventsFeedbacksRepo({
      organizerId,
      page,
      limit,
    });

    const formattedFeedbacks = result.feedbacks.map((item) => ({
      ...item,
      createdAt: item.createdAt
        ? format(new Date(item.createdAt), "dd MMM yyyy, HH:mm:ss")
        : null,
    }));

    return {
      feedbacks: formattedFeedbacks,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }



async analyzeEventFeedbackSummaryService({ organizerId, eventName }) {
  if (!organizerId) {
    throw new HttpError("organizerId is required", 400);
  }

  if (!eventName || !eventName.trim()) {
    throw new HttpError("eventName is required", 400);
  }

  const feedbackRows =
    await this.eventFeedbackRepo.getFeedbackSummaryRowsForOrganizerEventRepo({
      organizerId,
      eventName: eventName.trim(),
    });

  if (!feedbackRows.length) {
    return {
      eventName: eventName.trim(),
      totalFeedbacks: 0,
      summary:
        "No feedback is available yet for this event, so an AI summary could not be generated.",
    };
  }

  const totalFeedbacks = feedbackRows.length;

  const avgRating =
    feedbackRows.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
    totalFeedbacks;

  const commentsOnly = feedbackRows
    .filter((item) => item.comment && item.comment.trim().length > 0)
    .map(
      (item, index) =>
        `Feedback ${index + 1}:
Rating: ${item.rating}/5
Comment: ${item.comment}`
    )
    .join("\n\n");

  const fallbackCommentsText =
    commentsOnly && commentsOnly.trim().length > 0
      ? commentsOnly
      : "No written comments were submitted. Only numeric ratings are available.";

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const systemPrompt = `
You are an AI assistant for the Eventia platform.

Your task is to summarize feedback for one selected event.

Rules:
- Be concise, professional, and structured.
- Focus on overall attendee sentiment.
- Mention recurring strengths if present.
- Mention common complaints if present.
- Mention rating trends.
- Do not invent information.
- If comments are limited, say that the summary is based mostly on ratings.
- Output in plain readable text with short sections.
`;

  const userPrompt = `
Event name: ${eventName.trim()}
Total feedback count: ${totalFeedbacks}
Average rating: ${avgRating.toFixed(2)} / 5

Feedback entries:
${fallbackCommentsText}

Please generate a professional summary for this event's feedback.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    max_tokens: 500,
  });

  const summary =
    response?.choices?.[0]?.message?.content?.trim() ||
    "AI summary could not be generated at this time.";

  return {
    eventName: eventName.trim(),
    totalFeedbacks,
    averageRating: Number(avgRating.toFixed(2)),
    summary,
  };
}




async editAttendeeFeedbackService(data) {
  const { attendeeId, eventId, rating, comment } = data;

  if (!attendeeId) {
    throw new HttpError("attendeeId is required", 400);
  }

  if (!eventId) {
    throw new HttpError("eventId is required", 400);
  }

  if (!rating) {
    throw new HttpError("rating is required", 400);
  }

  const feedbackExists = await this.eventFeedbackRepo.checkAttendeeRatedRepo(
    attendeeId,
    eventId
  );

  if (!feedbackExists) {
    throw new HttpError("Feedback not found for this attendee and event", 404);
  }

  const updatedFeedback = await this.eventFeedbackRepo.editAttendeeFeedbackRepo({
    attendeeId,
    eventId,
    rating,
    comment: comment?.trim() || null,
  });

  return updatedFeedback;
}






}


module.exports = EventFeedbackService;