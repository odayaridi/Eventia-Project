import axiosInstance from "./interceptor/axiosInstance";

export interface VenueRequestCounts {
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  rejectedRequestsCount: number;
}

export interface VenueRequestItem {
  eventName: string;
  venueName: string;
  eventDate: string;
  timing: string;
  requested: string;
  status: string;
}

interface BackendResponse<T = unknown> {
  success: string | boolean;
  message: string;
  data?: T;
  error?: string;
}

const getErrorMessage = (error: unknown): string => {
  const fallback = "Something went wrong. Please try again.";

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response?: { data?: { error?: string; message?: string } } })
      .response;
    return response?.data?.error || response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};



export const countVenueRequestsForEvents = async (
  organizerId: number
): Promise<VenueRequestCounts> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueRequestCounts>>(
      "/eventVenueReqs/countEventBookingRequests",
      {
        params: { organizerId },
        _requiresAuth: true, // Added flag
      } as any
    );

    if (!response.data.data) {
      throw new Error("Venue request counts were not found.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const fetchVenueRequestsForEvents = async (
  organizerId: number
): Promise<VenueRequestItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueRequestItem[]>>(
      "/eventVenueReqs/getById",
      {
        params: { organizerId },
        _requiresAuth: true, // Added flag
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};





export interface OrganizerSupportPayload {
  organizerId: number;
  subject: string;
  message: string;
}

export interface OrganizerSupportResponse {
  id: number;
  organizerId: number;
  subject: string;
  message: string;
  createdAt?: string;
}

export const sendSupportToAdmin = async (
  payload: OrganizerSupportPayload
): Promise<OrganizerSupportResponse> => {
  try {
    const response = await axiosInstance.post<BackendResponse<OrganizerSupportResponse>>(
      "/supportRequestOrganizer/create",
      payload,
      {
        _requiresAuth: true, // Added flag
      } as any
    );

    if (!response.data.data) {
      throw new Error("Support request was not sent successfully.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};


















export interface EventTicketItem {
  eventId: number;
  eventName: string;
  eventStatus: string;
  ticketTypeId: number;
  ticketType: string;
  eventTicketId: number;
  price: string;
  perks: string;
  quantityAvailable: number;
  quantitySold: number;
}

export interface EventNameItem {
  name: string;
}

export interface CreateEventTicketPayload {
  eventName: string;
  type: string;
  perks: string;
  price: number;
  quantityAvailable: number;
}

export interface UpdateEventTicketPayload {
  eventTicketId: number;
  type: string;
  perks: string;
  price: number;
  quantityAvailable: number;
}

export const getEventTickets = async (
  organizerId: number
): Promise<EventTicketItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EventTicketItem[]>>(
      "/eventTickets/get",
      {
        params: { organizerId },
        _requiresAuth: true, // Added flag
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateEventTicket = async (
  payload: UpdateEventTicketPayload
): Promise<void> => {
  try {
    await axiosInstance.put<BackendResponse>("/eventTickets/update", payload, {
      _requiresAuth: true, // Added flag
    } as any);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createEventTicket = async (
  payload: CreateEventTicketPayload
): Promise<void> => {
  try {
    await axiosInstance.post<BackendResponse>("/eventTickets/create", payload, {
      _requiresAuth: true, // Added flag
    } as any);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getEventNamesHelper = async (
  organizerId: number
): Promise<EventNameItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EventNameItem[]>>(
      `/event/getEventNames/${organizerId}`,
      {
        _requiresAuth: true, // Added config object with flag
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};




export const getUpcomingEventNamesHelper = async (
  organizerId: number
): Promise<EventNameItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EventNameItem[]>>(
      `/event/getUpcomingEventNames/${organizerId}`,
      {
        _requiresAuth: true, // Added config object with flag
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};









export interface EventTypeItem {
  name: string;
}

export interface VenueNameItem {
  name: string;
}

export interface VenueNamesResponse {
  venues: VenueNameItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VenueAvailabilityDateItem {
  date: string;
}

export interface VenueAvailabilityTimeItem {
  timeSlot: string;
}

export interface CreateEventPayload {
  image: File;
  name: string;
  description: string;
  organizerId: number;
  eventType: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface OrganizerEventItem {
  eventId: number;
  organizerId: number;
  venueAvailabilityId: number;
  name: string;
  description: string;
  imageUrl: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  createdAt: string;
  date: string;
  eventType: string;
  eventStatus: string;
  venueName:string
}



export const getAllEventTypes = async (): Promise<EventTypeItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EventTypeItem[]>>(
      "/eventType/getEventTypes",
      {
        _requiresAuth: true, // Added flag
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getVenueNamesPaginated = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<VenueNamesResponse> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueNamesResponse>>(
      "/venue/getVenuesNames",
      {
        params,
        _requiresAuth: true, // Added flag
      } as any
    );

    return (
      response.data.data || {
        venues: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      }
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getVenueAvailabilityDates = async (
  venueName: string
): Promise<VenueAvailabilityDateItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueAvailabilityDateItem[]>>(
      "/venue/getVenueAvailabilityDates",
      {
        params: { venueName },
        _requiresAuth: true, // Added flag
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getVenueAvailabilityTimes = async (
  venueName: string,
  date: string
): Promise<VenueAvailabilityTimeItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueAvailabilityTimeItem[]>>(
      "/venue/getVenueAvailabilityTimes",
      {
        params: { venueName, date },
        _requiresAuth: true, // Added flag
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createEventWithImage = async (payload: CreateEventPayload): Promise<void> => {
  try {
    const formData = new FormData();

    formData.append("image", payload.image);
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("organizerId", String(payload.organizerId));
    formData.append("eventType", payload.eventType);
    formData.append("venueName", payload.venueName);
    formData.append("date", payload.date);
    formData.append("startTime", payload.startTime);
    formData.append("endTime", payload.endTime);
    formData.append("capacity", String(payload.capacity));

    await axiosInstance.post("/event/createEvent", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      _requiresAuth: true, // Added flag
    } as any);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getOrganizerEvents = async (
  organizerId: number
): Promise<OrganizerEventItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<OrganizerEventItem[]>>(
      `/event/getEvents/${organizerId}`,
      {
        _requiresAuth: true, // Added flag
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



export interface UpdateEventPayload {
  eventId: number;
  venueName: string;
  eventTypeName: string;
  name: string;
  description: string;
  image?: File | null;
  imageUrl?: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export const updateEventDetails = async (
  payload: UpdateEventPayload
): Promise<void> => {
  try {
    const formData = new FormData();

    formData.append("eventId", String(payload.eventId));
    formData.append("venueName", payload.venueName);
    formData.append("eventTypeName", payload.eventTypeName);
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("date", payload.date);
    formData.append("startTime", payload.startTime);
    formData.append("endTime", payload.endTime);
    formData.append("capacity", String(payload.capacity));

    if (payload.image) {
      formData.append("image", payload.image);
    } else if (payload.imageUrl) {
      formData.append("imageUrl", payload.imageUrl);
    }

    await axiosInstance.put("/event/updateEvent", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      _requiresAuth: true, // Added flag
    } as any);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



export interface CheckInAttendeePayload {
  ticketCode: string;
}

export interface CheckInAttendeeResponse {
  attendanceId: number;
  ticketId: number;
  eventId: number;
}

export const checkInAttendee = async (
  payload: CheckInAttendeePayload
): Promise<CheckInAttendeeResponse> => {
  try {
    const response = await axiosInstance.post<BackendResponse<CheckInAttendeeResponse>>(
      "/eventAttendance/checkInAttendee",
      payload,
      {
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      throw new Error("Attendee check-in failed.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};




export interface OrganizerEventFeedbackItem {
  username: string;
  email: string;
  phoneNumber: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  eventName: string;
  eventTypeName: string;
}

export interface OrganizerEventsFeedbacksResponse {
  feedbacks: OrganizerEventFeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getOrganizerEventsFeedbacks = async (
  organizerId: number,
  page: number,
  limit: number
): Promise<OrganizerEventsFeedbacksResponse> => {
  try {
    const response =
      await axiosInstance.get<BackendResponse<OrganizerEventsFeedbacksResponse>>(
        "/eventFeedback/getOrganizerEventsFeedbacks",
        {
          params: { organizerId, page, limit },
          _requiresAuth: true,
        } as any
      );

    return (
      response.data.data || {
        feedbacks: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};









export interface AnalyzeEventFeedbackSummaryPayload {
  organizerId: number;
  eventName: string;
}

export interface AnalyzeEventFeedbackSummaryResponse {
  eventName: string;
  totalFeedbacks: number;
  averageRating?: number;
  summary: string;
}

export const analyzeEventFeedbackSummary = async (
  payload: AnalyzeEventFeedbackSummaryPayload
): Promise<AnalyzeEventFeedbackSummaryResponse> => {
  try {
    const response =
      await axiosInstance.post<BackendResponse<AnalyzeEventFeedbackSummaryResponse>>(
        "/eventFeedback/analyzeEventFeedbackSummary",
        payload,
        {
          _requiresAuth: true,
        } as any
      );

    return (
      response.data.data || {
        eventName: payload.eventName,
        totalFeedbacks: 0,
        summary: "No summary available.",
      }
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};










export interface OrganizerAnnouncementItem {
  announcementId: number;
  title: string;
  message: string;
  createdAt: string;
  eventName: string;
}

export interface CreateAnnouncementPayload {
  organizerId: number;
  eventName: string;
  title: string;
  message: string;
}

// GET /announcement/getOrganizerAnncs?organizerId=X
export const getOrganizerAnnouncements = async (
  organizerId: number
): Promise<OrganizerAnnouncementItem[]> => {
  try {
    const response = await axiosInstance.get<
      BackendResponse<OrganizerAnnouncementItem[]>
    >("/announcement/getOrganizerAnncs", {
      params: { organizerId },
      _requiresAuth: true,
    } as any);

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// POST /announcement/createEventAnnouncement
export const createAnnouncement = async (
  payload: CreateAnnouncementPayload
): Promise<void> => {
  try {
    await axiosInstance.post(
      "/announcement/createEventAnnouncement",
      payload,
      { _requiresAuth: true } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};







export interface OrganizerProfileItem {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
  organization: string | null;
}

export const getEventOrganizerProfile = async (
  organizerId: number
): Promise<OrganizerProfileItem> => {
  try {
    const response = await axiosInstance.get(
      "/profile/getEventOrganizerProfile",
      {
        params: { organizerId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



export interface ChatbotReplyResponse {
  success: boolean;
  reply: string;
}

export const askEventChatbot = async (
  prompt: string
): Promise<string> => {
  try {
    const response = await axiosInstance.post<ChatbotReplyResponse>(
      "/chatbot/askchatbot/organizer",
      { prompt },
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.reply || "";
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



export interface DashboardTotalEvents      { totalEvents: number }
export interface DashboardTicketsSold     { totalTicketsSold: number }
export interface DashboardTotalRevenue    { totalRevenue: number }
export interface DashboardAvgAttendance   { avgAttendanceRate: number }
export interface DashboardRevenuePerEventItem {
  eventName:  string;
  eventId:    number;
  revenue:    number;
  percentage: number;
}
export interface DashboardRevenuePerEvent {
  revenuePerEvent: DashboardRevenuePerEventItem[];
  totalRevenue:    number;
}
export interface DashboardEventsThisMonth    { eventsThisMonth: number }
export interface DashboardPendingVenueReqs   { pendingVenueRequests: number }
export interface DashboardTotalAnnouncements { totalAnnouncements: number }
export interface DashboardTotalFeedbacks     { totalFeedbacks: number }

// ── Helper ───────────────────────────────────────────────────────────────────

const dashboardGet = async <T>(path: string): Promise<T> => {
  try {
    const response = await axiosInstance.get<BackendResponse<T>>(path, {
      _requiresAuth: true,
    } as any);
    if (!response.data.data) throw new Error("No data returned.");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ── 9 Methods ────────────────────────────────────────────────────────────────

export const getDashboardTotalEvents = (organizerId: number) =>
  dashboardGet<DashboardTotalEvents>(`/event/dashboard/totalEvents/${organizerId}`);

export const getDashboardTicketsSold = (organizerId: number) =>
  dashboardGet<DashboardTicketsSold>(`/event/dashboard/totalTicketsSold/${organizerId}`);

export const getDashboardTotalRevenue = (organizerId: number) =>
  dashboardGet<DashboardTotalRevenue>(`/event/dashboard/totalRevenue/${organizerId}`);

export const getDashboardAvgAttendance = (organizerId: number) =>
  dashboardGet<DashboardAvgAttendance>(`/event/dashboard/avgAttendance/${organizerId}`);

export const getDashboardRevenuePerEvent = (organizerId: number) =>
  dashboardGet<DashboardRevenuePerEvent>(`/event/dashboard/revenuePerEvent/${organizerId}`);

export const getDashboardEventsThisMonth = (organizerId: number) =>
  dashboardGet<DashboardEventsThisMonth>(`/event/dashboard/eventsThisMonth/${organizerId}`);

export const getDashboardPendingVenueRequests = (organizerId: number) =>
  dashboardGet<DashboardPendingVenueReqs>(`/event/dashboard/pendingVenueRequests/${organizerId}`);

export const getDashboardTotalAnnouncements = (organizerId: number) =>
  dashboardGet<DashboardTotalAnnouncements>(`/event/dashboard/totalAnnouncements/${organizerId}`);

export const getDashboardTotalFeedbacks = (organizerId: number) =>
  dashboardGet<DashboardTotalFeedbacks>(`/event/dashboard/totalFeedbacks/${organizerId}`);





export interface FinishedOrganizerEventNameItem {
  eventId: number;
  eventName: string;
}

export interface AttendanceRowItem {
  attendeeId: number;
  username: string;
  email: string;
  phoneNumber: string;
  ticketTypes: string[];
}

export interface AttendanceSummaryItem {
  attendedCount: number;
  unattendedCount: number;
  total: number;
  attendedPercentage: number;
  unattendedPercentage: number;
}

export const getFinishedOrganizerEventNames = async (
  organizerId: number
): Promise<FinishedOrganizerEventNameItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<FinishedOrganizerEventNameItem[]>>(
      "/eventAttendance/getFinishedOrganizerEventNames",
      {
        params: { organizerId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAttendedAttendeesByEvent = async (
  eventId: number
): Promise<AttendanceRowItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<AttendanceRowItem[]>>(
      "/eventAttendance/getAttendedAttendeesByEvent",
      {
        params: { eventId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getUnattendedAttendeesByEvent = async (
  eventId: number
): Promise<AttendanceRowItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<AttendanceRowItem[]>>(
      "/eventAttendance/getUnattendedAttendeesByEvent",
      {
        params: { eventId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAttendanceSummary = async (
  eventId: number
): Promise<AttendanceSummaryItem> => {
  try {
    const response = await axiosInstance.get<BackendResponse<AttendanceSummaryItem>>(
      "/eventAttendance/getAttendanceSummary",
      {
        params: { eventId },
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      return {
        attendedCount: 0,
        unattendedCount: 0,
        total: 0,
        attendedPercentage: 0,
        unattendedPercentage: 0,
      };
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};





export interface TicketTypeItem {
  name: string;
}

export const getTicketTypes = async (): Promise<TicketTypeItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<TicketTypeItem[]>>(
      "/eventTickets/getTicketTypes",
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};





export interface EndedEventNameItem {
  name: string;
}

export interface EventAttendancePieChartResponse {
  chart: {
    attended: number;
    nonAttended: number;
  };
}

export interface EventTotalTicketsQuantityItem {
  eventName: string;
  eventId: number;
  sumQuantitySold: string;
  sumQuantityAvailable: string;
}

export const getEndedEventNamesForAnalytics = async (
  organizerId: number
): Promise<EndedEventNameItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EndedEventNameItem[]>>(
      `/event/getEndedEventNames/${organizerId}`,
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getEventAttendancePieChart = async (
  eventName: string
): Promise<EventAttendancePieChartResponse> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EventAttendancePieChartResponse>>(
      `/eventAttendance/getEventAttendancePieChart/${encodeURIComponent(eventName)}`,
      {
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      return {
        chart: {
          attended: 0,
          nonAttended: 0,
        },
      };
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getTotalTicketsQuantityAllEvents = async (): Promise<
  EventTotalTicketsQuantityItem[]
> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EventTotalTicketsQuantityItem[]>>(
      "/eventTickets/getTotalTicketsQuantityAllEvents",
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};





export interface VenueChattingItem {
  venueId: number;
  venueName: string;
  managerId: number;
  managerName: string;
  conversationId?: number | null;
  unreadCount?: number;
}

export interface ConversationItem {
  id: number;
  organizerId: number;
  managerId: number;
  venueId: number | null;
  createdAt: string;
}

export interface ChatMessageItem {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  message: string;
  isRead: number | boolean;
  createdAt: string;
}

export interface OrganizerUnreadConversationItem {
  conversationId: number;
  venueId: number | null;
  managerId: number;
  unreadCount: number;
}

export interface OrganizerUnreadSummaryResponse {
  totalUnread: number;
  conversations: OrganizerUnreadConversationItem[];
}

export const getVenuesChatting = async (
  organizerId: number
): Promise<VenueChattingItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueChattingItem[]>>(
      "/messages/getVenuesChatting",
      {
        params: { organizerId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createOrGetConversation = async (payload: {
  organizerId: number;
  managerId: number;
  venueId?: number | null;
}): Promise<ConversationItem> => {
  try {
    const response = await axiosInstance.post<BackendResponse<ConversationItem>>(
      "/messages/conversation",
      payload,
      {
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      throw new Error("Failed to create or retrieve conversation.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getConversationMessages = async (
  conversationId: number
): Promise<ChatMessageItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<ChatMessageItem[]>>(
      `/messages/${conversationId}/messages`,
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getOrganizerUnreadSummary = async (
  organizerId: number
): Promise<OrganizerUnreadSummaryResponse> => {
  try {
    const response = await axiosInstance.get<
      BackendResponse<OrganizerUnreadSummaryResponse>
    >("/messages/unread/organizer", {
      params: { organizerId },
      _requiresAuth: true,
    } as any);

    return (
      response.data.data || {
        totalUnread: 0,
        conversations: [],
      }
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const markConversationRead = async (payload: {
  conversationId: number;
  readerUserId: number;
}): Promise<void> => {
  try {
    await axiosInstance.put(
      `/messages/${payload.conversationId}/mark-read`,
      {
        readerUserId: payload.readerUserId,
      },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};






export const deleteEvent = async (eventId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/event/deleteEvent/${eventId}`, {
      _requiresAuth: true,
    } as any);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



export type WebRTCCallType = "audio";

export interface WebRTCAck {
  success: boolean;
  message: string;
  receiverUserId?: number;
}

export interface WebRTCIncomingCallPayload {
  conversationId: number;
  callerUserId: number;
  receiverUserId: number;
  callerUsername: string;
  callType: WebRTCCallType;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerPayload {
  conversationId: number;
  callerUserId: number;
  receiverUserId: number;
  answer: RTCSessionDescriptionInit;
}

export interface WebRTCIceCandidatePayload {
  conversationId: number;
  senderUserId: number;
  receiverUserId: number;
  candidate: RTCIceCandidateInit;
}