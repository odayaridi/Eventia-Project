const EventFeedbackService = require("../services/EventFeedbackService");

class EventFeedbackController {
    constructor() {
        this.eventFeedbackService = new EventFeedbackService();
    }


    async sendFeedbackController(req,res,next) {
        try {
            const feedbackObj = req.body;
            const data = await this.eventFeedbackService.sendFeedbackService(feedbackObj);
            res.status(201).json({success: true, message: "Feedback sent successfully"})
        } catch (error) {
             next(error);
        }
    }


async checkAttendeeRatedController(req, res, next) {
  try {
    const { attendeeId, eventId } = req.query;

    const ratingExists = await this.eventFeedbackService.checkAttendeeRatedService(
      Number(attendeeId),
      Number(eventId)
    );

    res.status(200).json({
      success: true,
      message: "Rating checked",
      ratingExists,
    });
  } catch (error) {
    next(error);
  }
}


    async getAttendeeFeedbacksController(req, res, next) {
  try {
    const { attendeeId } = req.query;

    const feedbacks = await this.eventFeedbackService.getAttendeeFeedbacksService(
      Number(attendeeId)
    );

    res.status(200).json({
      success: true,
      message: "Attendee feedbacks fetched successfully",
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }

}


async getOrganizerEventsFeedbacksController(req, res, next) {
  try {
    const data = await this.eventFeedbackService.getOrganizerEventsFeedbacksService(req.query);

    res.status(200).json({
      success: true,
      message: "Organizer events feedbacks fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}








async analyzeEventFeedbackSummaryController(req, res, next) {
  try {
    const { organizerId, eventName } = req.body;

    const data = await this.eventFeedbackService.analyzeEventFeedbackSummaryService({
      organizerId: Number(organizerId),
      eventName,
    });

    res.status(200).json({
      success: true,
      message: "Event feedback summary generated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}






async editAttendeeFeedbackController(req, res, next) {
  try {
    const data = await this.eventFeedbackService.editAttendeeFeedbackService(req.body);

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}








}

module.exports = EventFeedbackController;