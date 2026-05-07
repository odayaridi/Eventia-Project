// import axiosInstance from "./interceptor/axiosInstance";

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface EventTicket {
//   eventTicketId: number;
//   ticketTypeName: string;
//   eventTicketPerks: string;
//   ticketPrice: string;
//   quantityAvailable: number;
//   quantitySold: number;
//   remainingTickets: number;
// }

// export interface EventResult {
//   eventId: number;
//   organizerId: number;
//   venueAvailabilityId: number;
//   eventName: string;
//   eventDescription: string;
//   imageUrl: string;
//   eventDate: string;
//   startTime: string;
//   endTime: string;
//   eventCapacity: number;
//   venueName: string;
//   eventType: string;
//   tickets: EventTicket[];
// }

// export interface EventFilterParams {
//   page?: number;
//   limit?: number;
//   eventName?: string;
//   venueName?: string;
//   eventTypeName?: string;
//   date?: string;
//   startTime?: string;
//   endTime?: string;
//   description?: string;
//   location?: string;
// }

// export interface FilterEventsResponse {
//   events: EventResult[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// interface BackendResponse<T = unknown> {
//   success: string | boolean;
//   message: string;
//   data?: T;
//   error?: string;
// }

// const getErrorMessage = (error: unknown): string => {
//   const fallback = "Something went wrong. Please try again.";

//   if (
//     typeof error === "object" &&
//     error !== null &&
//     "response" in error &&
//     typeof (error as { response?: unknown }).response === "object"
//   ) {
//     const response = (error as {
//       response?: { data?: { error?: string; message?: string } };
//     }).response;
//     return response?.data?.error || response?.data?.message || fallback;
//   }

//   if (error instanceof Error) {
//     return error.message;
//   }

//   return fallback;
// };

// // ─── Filter Events ────────────────────────────────────────────────────────────

// export const filterEvents = async (
//   params: EventFilterParams
// ): Promise<FilterEventsResponse> => {
//   try {
//     const response = await axiosInstance.get<BackendResponse<FilterEventsResponse>>(
//       "/event/filterEvents",
//       {
//         params,
//         _requiresAuth: true, // Added flag
//       } as any
//     );

//     if (!response.data.data) {
//       throw new Error("Failed to retrieve events.");
//     }

//     return response.data.data;
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };



import axiosInstance from "./interceptor/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventTicket {
  eventTicketId: number;
  ticketTypeName: string;
  eventTicketPerks: string;
  ticketPrice: string;
  quantityAvailable: number;
  quantitySold: number;
  remainingTickets: number;
}

export interface EventResult {
  eventId: number;
  organizerId: number;
  venueAvailabilityId: number;
  eventName: string;
  eventDescription: string;
  imageUrl: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventCapacity: number;
  venueName: string;
  eventType: string;
  seatsLeft: number;
  tickets: EventTicket[];
}

export interface EventFilterParams {
  page?: number;
  limit?: number;
  eventName?: string;
  venueName?: string;
  eventTypeName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
}

export interface FilterEventsResponse {
  events: EventResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
    const response = (error as {
      response?: { data?: { error?: string; message?: string } };
    }).response;
    return response?.data?.error || response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

// ─── Filter Events ────────────────────────────────────────────────────────────

export const filterEvents = async (
  params: EventFilterParams
): Promise<FilterEventsResponse> => {
  try {
    const response = await axiosInstance.get<BackendResponse<FilterEventsResponse>>(
      "/event/filterEvents",
      {
        params,
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      throw new Error("Failed to retrieve events.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};














export interface SendAttendeeSupportPayload {
  attendeeId: number;
  subject: string;
  message: string;
}

export interface AttendeeSupportResponse {
  id: number;
  attendeeId: number;
  subject: string;
  message: string;
}



export const sendAttendeeSupport = async (
  payload: SendAttendeeSupportPayload
): Promise<AttendeeSupportResponse> => {
  try {
    const response = await axiosInstance.post<BackendResponse<AttendeeSupportResponse>>(
      "/supportRequestAttendee/create",
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













export interface AttendeeBookingTicket {
  ticketType: string;
  quantity: number;
  priceSnapshot: number;
}

export interface AttendeeBookingItem {
  eventId:number,
  bookingId: number;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  totalPrice: string;
  tickets: AttendeeBookingTicket[];
}

export const getAttendeeBookings = async (
  attendeeId: number
): Promise<AttendeeBookingItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<AttendeeBookingItem[]>>(
      "/booking/getAttendeeBookings",
      {
        params: { attendeeId },
        _requiresAuth: true,
      } as any
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
















// ─── ADD these types + method to your existing attendeeApi.ts ────────────────

export interface CheckoutTicketItem {
  eventTicketId: number;
  quantity: number;
  ticketTypeName: string;
  ticketPrice: string;
}

export interface CreateCheckoutSessionPayload {
  attendeeId: number;
  eventId: number;
  tickets: CheckoutTicketItem[];
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  url: string;
}

// ─── ADD this function to your existing attendeeApi.ts ────────────────────────

export const createCheckoutSession = async (
  payload: CreateCheckoutSessionPayload
): Promise<CreateCheckoutSessionResponse> => {
  try {
    const response = await axiosInstance.post<CreateCheckoutSessionResponse>(
      "/payment/checkout",
      payload,
      { _requiresAuth: true } as any
    );

    if (!response.data.url) {
      throw new Error("No checkout URL returned from server.");
    }

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};












// export interface AttendeeBookingTicketItem {
//   eventName: string;
//   eventDate: string;
//   eventTime: string;
//   venueName: string;
//   qrCode: string;
//   quantity: number;
//   price: string;
//   ticketTypeName: string;
//   purchased: string;
// }

// export const getAttendeeBookingTickets = async (
//   attendeeId: number
// ): Promise<AttendeeBookingTicketItem[]> => {
//   try {
//     const response = await axiosInstance.get<
//       BackendResponse<AttendeeBookingTicketItem[]>
//     >("/bookingTickets/getAttendeeBookingTickets", {
//       params: { attendeeId },
//       _requiresAuth: true,
//     } as any);

//     return Array.isArray(response.data.data) ? response.data.data : [];
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };




export interface BookingSingleTicketQrItem {
  ticketId: number;
  qr: string;
  purchased: string;
}

export interface AttendeeBookingTicketItem {
  bookingTicketId: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  ticketType: string;
  quantity: number;
  price: number;
  tickets: BookingSingleTicketQrItem[];
}

export const getAttendeeBookingTickets = async (
  attendeeId: number
): Promise<AttendeeBookingTicketItem[]> => {
  try {
    const response = await axiosInstance.get<
      BackendResponse<AttendeeBookingTicketItem[]>
    >("/bookingTickets/getAttendeeBookingTickets", {
      params: { attendeeId },
      _requiresAuth: true,
    } as any);

    const rawData = Array.isArray(response.data.data) ? response.data.data : [];

    return rawData.map((item) => ({
      bookingTicketId: Number(item.bookingTicketId) || 0,
      eventName: item.eventName || "",
      eventDate: item.eventDate || "",
      eventTime: item.eventTime || "",
      venueName: item.venueName || "",
      ticketType: item.ticketType || "",
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
      tickets: Array.isArray(item.tickets)
        ? item.tickets.map((ticket) => ({
            ticketId: Number(ticket.ticketId) || 0,
            qr: ticket.qr || "",
            purchased: ticket.purchased || "",
          }))
        : [],
    }));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
















export interface AskChatbotPayload {
  prompt: string;
}

export interface AskChatbotResponse {
  success: boolean;
  reply: string;
}

export const askAttendeeChatbot = async (
  payload: AskChatbotPayload
): Promise<string> => {
  try {
    const response = await axiosInstance.post<AskChatbotResponse>(
      "/chatbot/askchatbot",
      payload,
      {
        _requiresAuth: true,
      } as any
    );

    if (!response.data.reply) {
      throw new Error("No reply was returned from the AI assistant.");
    }

    return response.data.reply;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};





















export interface SendEventFeedbackPayload {
  eventId: number;
  attendeeId: number;
  rating: number;
  comment?: string;
}

export const sendEventFeedback = async (
  payload: SendEventFeedbackPayload
): Promise<void> => {
  try {
    await axiosInstance.post(
      "/eventFeedback/sendFeedback",
      payload,
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};













// export interface CheckAttendeeRatedPayload {
//   attendeeId: number;
//   eventId: number;
// }

// export interface CheckAttendeeRatedResponse {
//   success: boolean;
//   message: string;
//   ratingExists: boolean;
// }

// export const checkAttendeeRated = async (
//   payload: CheckAttendeeRatedPayload
// ): Promise<boolean> => {
//   try {
//     const response = await axiosInstance.get<CheckAttendeeRatedResponse>(
//       "/eventFeedback/checkAttendeeRated",
//       {
//         params: {
//           attendeeId: payload.attendeeId,
//           eventId: payload.eventId,
//         },
//         _requiresAuth: true,
//       } as any
//     );

//     return Boolean(response.data.ratingExists);
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };







export interface AttendeeFeedbackItem {
  eventId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  eventName: string;
  eventTypeName: string;
}

export const getAttendeeFeedbacks = async (
  attendeeId: number
): Promise<AttendeeFeedbackItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<AttendeeFeedbackItem[]>>(
      "/eventFeedback/getAttendeeFeedbacks",
      {
        params: { attendeeId },
        _requiresAuth: true,
      } as any
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export interface EditAttendeeFeedbackPayload {
  attendeeId: number;
  eventId: number;
  rating: number;
  comment?: string;
}

export const editAttendeeFeedback = async (
  payload: EditAttendeeFeedbackPayload
): Promise<void> => {
  try {
    await axiosInstance.put(
      "/eventFeedback/editAttendeeFeedback",
      payload,
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};


export interface CheckAttendeeRatedPayload {
  attendeeId: number;
  eventId: number;
}

export const checkAttendeeRated = async (
  payload: CheckAttendeeRatedPayload
): Promise<boolean> => {
  try {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      ratingExists: boolean;
    }>("/eventFeedback/checkAttendeeRated", {
      params: {
        attendeeId: payload.attendeeId,
        eventId: payload.eventId,
      },
      _requiresAuth: true,
    } as any);

    return Boolean(response.data.ratingExists);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};























// ─── ADD these types + methods to your existing attendeeApi.ts ───────────────

export interface AnnouncementItem {
  announcementId: number;
  eventId: number;
  organizerId: number;
  title: string;
  message: string;
  createdAt: string;
  eventName: string;
}

// GET /announcement/getBookedEventAnncs?attendeeId=X
export const getAttendeeAnnouncements = async (
  attendeeId: number
): Promise<AnnouncementItem[]> => {
  try {
    const response = await axiosInstance.get<
      BackendResponse<{ announcements: AnnouncementItem[] }>
    >("/announcement/getBookedEventAnncs", {
      params: { attendeeId },
      _requiresAuth: true,
    } as any);

    // Backend returns { success, announcements } (not nested under data)
    const raw = response.data as any;
    return raw.announcements || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



















export interface AttendeeProfileItem {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
}

export interface EditAttendeeProfilePayload {
  attendeeId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
}

export const getAttendeeProfile = async (
  attendeeId: number
): Promise<AttendeeProfileItem> => {
  try {
    const response = await axiosInstance.get(
      "/profile/getAttendeeProfile",
      {
        params: { attendeeId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const editAttendeeProfile = async (
  payload: EditAttendeeProfilePayload
): Promise<AttendeeProfileItem> => {
  try {
    const response = await axiosInstance.put(
      "/profile/editAttendeeProfile",
      payload,
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};







export const deleteAttendeeBooking = async (payload: {
  eventName: string;
  bookingId: number;
  attendeeEmail: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  eventType: string;
  totalPrice: string | number;
  ticketsCount: number;
  tickets: AttendeeBookingTicket[];
}): Promise<void> => {
  try {
    await axiosInstance.delete(
      `/booking/delete/eventName/${encodeURIComponent(payload.eventName)}/bookingId/${payload.bookingId}`,
      {
        data: payload,
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};


