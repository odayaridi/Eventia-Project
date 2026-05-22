import axiosInstance from "./interceptor/axiosInstance";

export interface VenueInfo {
  id: number;
  name: string;
  location: string;
  locationLink: string;
  capacity: number;
  facilities: string;
  createdAt: string;
  images: string[];
}

export interface CreateVenuePayload {
  name: string;
  location: string;
  locationLink: string;
  capacity: number;
  facilities: string;
  managerId: number;
}

export interface UpdateVenuePayload {
  id: number;
  name?: string;
  location?: string;
  locationLink?: string;
  capacity?: number;
  facilities?: string;
  managerId?: number;
}

// export interface VenueAvailabilityItem {
//   id: number;
//   venueId: number;
//   date: string;
//   startTime: string;
//   endTime: string;
// }


export interface VenueAvailabilityItem {
  id: number;
  venueId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

// export interface CreateVenueAvailabilityPayload {
//   managerId: number;
//   date: string;
//   startTime: string;
//   endTime: string;
// }


export interface CreateVenueAvailabilityPayload {
  managerId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}


interface BackendResponse<T = unknown> {
  success: string | boolean;
  message: string;
  data?: T;
  venueExists?: boolean;
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

// --- VENUE PROFILE METHODS ---

export const managerVenueExists = async (managerId: number): Promise<boolean> => {
  try {
    const response = await axiosInstance.get<BackendResponse>("/venue/hasVenue", {
      params: { managerId },
      _requiresAuth: true,
    } as any);

    return Boolean(response.data.venueExists);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createVenueForManager = async (
  payload: CreateVenuePayload,
  images: File[]
): Promise<CreateVenuePayload & { id: number; images: string[] }> => {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("location", payload.location);
    formData.append("locationLink", payload.locationLink);
    formData.append("capacity", String(payload.capacity));
    formData.append("facilities", payload.facilities);
    formData.append("managerId", String(payload.managerId));

    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await axiosInstance.post<
      BackendResponse<CreateVenuePayload & { id: number; images: string[] }>
    >("/venue/createVenue", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      _requiresAuth: true,
    } as any);

    if (!response.data.data) {
      throw new Error("Venue was not created successfully.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const retrieveVenueInfo = async (managerId: number): Promise<VenueInfo> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueInfo>>(
      "/venue/getVenueInfo",
      {
        params: { managerId },
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      throw new Error("Venue information was not found.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateVenueInfo = async (
  payload: UpdateVenuePayload,
  images?: File[]
): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("id", String(payload.id));
    if (payload.name !== undefined) formData.append("name", payload.name);
    if (payload.location !== undefined) formData.append("location", payload.location);
    if (payload.locationLink !== undefined)
      formData.append("locationLink", payload.locationLink);
    if (payload.capacity !== undefined)
      formData.append("capacity", String(payload.capacity));
    if (payload.facilities !== undefined)
      formData.append("facilities", payload.facilities);
    if (payload.managerId !== undefined)
      formData.append("managerId", String(payload.managerId));

    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("images", file);
      });
    }

    await axiosInstance.put<BackendResponse>("/venue/updateVenue", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      _requiresAuth: true,
    } as any);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createVenueAvailabiltyForManager = async (
  payload: CreateVenueAvailabilityPayload
): Promise<VenueAvailabilityItem> => {
  try {
    const response = await axiosInstance.post<BackendResponse<VenueAvailabilityItem>>(
      "/venueAvailability/createVenueAvailability",
      payload,
      {
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      throw new Error("Venue availability was not created successfully.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};


// ─── REPLACE / ADD these types in your venueApi.ts ───────────────────────────

// export interface VenueAvailabilitySlot {
//   startTime: string;
//   endTime: string;
// }

// export interface VenueAvailabilitySlot {
//   startTime: string;
//   endTime: string;
//   price: number;
// }

// export interface VenueAvailabilityDay {
//   date: string;
//   slots: VenueAvailabilitySlot[];
// }



export interface VenueAvailabilitySlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
}



export interface VenueAvailabilityDay {
  date: string;
  slots: VenueAvailabilitySlot[];
}

// ─── REPLACE getALLVenueAvailabilities in your venueApi.ts ───────────────────

export const getALLVenueAvailabilities = async (
  managerId: number
): Promise<VenueAvailabilityDay[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueAvailabilityDay[]>>(
      "/venueAvailability/getVenueAvailablities",
      {
        params: { managerId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};




export interface EventRequestCounts {
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  rejectedRequestsCount: number;
}

export interface EventRequestItem {
  eventId: number;
  organizerId: number;
  organizerUsername: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventDescription: string;
  eventCapacity: number;
  venueAvailabilityId: number;
  venueName: string;
  venueLocation: string;
  requestStatus: string;
}

export interface EventRequestsPaginatedResponse {
  requests: EventRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export const countEventReqsStatus = async (
  managerId: number
): Promise<EventRequestCounts> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EventRequestCounts>>(
      "/eventVenueReqs/countEventRequests",
      {
        params: { managerId },
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      throw new Error("Event request counts were not found.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



export const fetchEventReqsToVenue = async (payload: {
  managerId: number;
  page?: number;
  limit?: number;
}): Promise<EventRequestsPaginatedResponse> => {
  try {
    const response = await axiosInstance.get<BackendResponse<EventRequestsPaginatedResponse>>(
      "/venue/fetchEventRequests",
      {
        params: payload,
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      return {
        requests: [],
        total: 0,
        page: payload.page || 1,
        limit: payload.limit || 10,
        totalPages: 1,
      };
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



export const acceptEventReqToVenue = async (payload: {
  eventId: number;
  venueAvailabilityId: number;
}): Promise<void> => {
  try {
    await axiosInstance.put("/event/approveEventVenueReq", payload, {
      _requiresAuth: true,
    } as any);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const rejectEventReqToVenue = async (payload: {
  eventId: number;
  venueAvailabilityId: number;
}): Promise<void> => {
  try {
    await axiosInstance.put("/event/rejectEventVenueReq", payload, {
      _requiresAuth: true,
    } as any);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};












export interface SendSupportPayload {
  managerId: number;
  subject: string;
  message: string;
}

export interface SupportRequestResponse {
  id: number;
  managerId: number;
  subject: string;
  message: string;
  createdAt?: string;
}

export const sendSupport = async (
  payload: SendSupportPayload
): Promise<SupportRequestResponse> => {
  try {
    const response = await axiosInstance.post<BackendResponse<SupportRequestResponse>>(
      "/supportRequestManager/create",
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






export const fetchVenueBookedTimes = async (
  managerId: number
): Promise<VenueAvailabilityItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueAvailabilityItem[]>>(
      "/venueAvailability/getVenueBookedTimes",
      {
        params: { managerId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
















// --- Add these types to your existing venueApi.ts ---

export interface VenueAvailability {
  availability_id: number;
  date: string;
  start_time: string;
  end_time: string;
}


// NEW
// export interface VenueAvailabilitySlot {
//   start_time: string;
//   end_time: string;
//   price: number;
// }

export interface VenueAvailability {
  date: string;
  slots: VenueAvailabilitySlot[];
}

export interface VenueResult {
  id: number;
  name: string;
  location: string;
  location_link: string;
  capacity: number;
  facilities: string;
  manager_id: number;
  created_at: string;
  availabilities: VenueAvailability[];
  images: string[];
}

export interface VenueFilterParams {
  page?: number;
  limit?: number;
  name?: string;
  location?: string;
  facilities?: string;
  capacity?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
}

export interface FilterVenuesResponse {
  venues: VenueResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const filterVenues = async (
  params: VenueFilterParams
): Promise<FilterVenuesResponse> => {
  try {
    const response = await axiosInstance.get<BackendResponse<FilterVenuesResponse>>(
      "/venue/filterVenues",
      {
        params,
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      throw new Error("Failed to retrieve venues.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};













export interface ManagerProfileItem {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
}

export const getVenueManagerProfile = async (
  managerId: number
): Promise<ManagerProfileItem> => {
  try {
    const response = await axiosInstance.get(
      "/profile/getVenueManagerProfile",
      {
        params: { managerId },
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

export const askVenueChatbot = async (
  prompt: string
): Promise<string> => {
  try {
    const response = await axiosInstance.post<ChatbotReplyResponse>(
      "/chatbot/askchatbot/manager",
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

















// ─── ADD these types + 3 methods to your existing venueApi.ts ────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VenueDashboardStats {
  approvedBookings: number;
  estimatedRevenue: number;
  utilizationRate:  number;   // percentage 0–100
  totalRequests:    number;
}

export interface UpcomingReservationItem {
  date:    string;
  slots:   number;
  revenue: number;
}

export interface BookingByStatus {
  available: number;
  booked:    number;
}

// ── 3 Methods ─────────────────────────────────────────────────────────────────

export const getVenueDashboardStats = async (
  managerId: number
): Promise<VenueDashboardStats> => {
  try {
    const response = await axiosInstance.get<BackendResponse<VenueDashboardStats>>(
      `/venue/dashboard/bookingStats/${managerId}`,
      { _requiresAuth: true } as any
    );
    if (!response.data.data) throw new Error("No data returned.");
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getUpcomingReservations = async (
  managerId: number
): Promise<UpcomingReservationItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<UpcomingReservationItem[]>>(
      "/venueAvailability/dashboard/upcomingReservations",
      {
        params: { managerId },
        _requiresAuth: true,
      } as any
    );
    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getBookingByStatus = async (
  managerId: number
): Promise<BookingByStatus> => {
  try {
    const response = await axiosInstance.get<BackendResponse<BookingByStatus>>(
      "/venueAvailability/dashboard/bookingByStatus",
      {
        params: { managerId },
        _requiresAuth: true,
      } as any
    );
    return response.data.data || { available: 0, booked: 0 };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};






// export interface OrganizerChattingItem {
//   conversationId: number;
//   organizerId: number;
//   organizerName: string;
//   managerId: number;
//   venueId: number | null;
//   venueName: string | null;
//   lastMessagePreview: string | null;
//   lastMessageAt: string | null;
// }

// export interface ConversationItem {
//   id: number;
//   organizerId: number;
//   managerId: number;
//   venueId: number | null;
//   createdAt: string;
// }

// export interface ChatMessageItem {
//   id: number;
//   conversationId: number;
//   senderId: number;
//   senderUsername: string;
//   message: string;
//   isRead: number | boolean;
//   createdAt: string;
// }

// export const getOrganizersChatting = async (
//   managerId: number
// ): Promise<OrganizerChattingItem[]> => {
//   try {
//     const response = await axiosInstance.get<BackendResponse<OrganizerChattingItem[]>>(
//       "/messages/getOrganizersChatting",
//       {
//         params: { managerId },
//         _requiresAuth: true,
//       } as any
//     );

//     return response.data.data || [];
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };

// export const createOrGetConversationForVenue = async (payload: {
//   organizerId: number;
//   managerId: number;
//   venueId?: number | null;
// }): Promise<ConversationItem> => {
//   try {
//     const response = await axiosInstance.post<BackendResponse<ConversationItem>>(
//       "/messages/conversation",
//       payload,
//       {
//         _requiresAuth: true,
//       } as any
//     );

//     if (!response.data.data) {
//       throw new Error("Failed to create or retrieve conversation.");
//     }

//     return response.data.data;
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };

// export const getConversationMessagesForVenue = async (
//   conversationId: number
// ): Promise<ChatMessageItem[]> => {
//   try {
//     const response = await axiosInstance.get<BackendResponse<ChatMessageItem[]>>(
//       `/messages/${conversationId}/messages`,
//       {
//         _requiresAuth: true,
//       } as any
//     );

//     return response.data.data || [];
//   } catch (error) {
//     throw new Error(getErrorMessage(error));
//   }
// };




export interface OrganizerChattingItem {
  conversationId: number;
  organizerId: number;
  organizerName: string;
  managerId: number;
  venueId: number | null;
  venueName: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
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

export interface ManagerUnreadConversationItem {
  conversationId: number;
  organizerId: number;
  venueId: number | null;
  unreadCount: number;
}

export interface ManagerUnreadSummaryResponse {
  totalUnread: number;
  conversations: ManagerUnreadConversationItem[];
}

export const getOrganizersChatting = async (
  managerId: number
): Promise<OrganizerChattingItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<OrganizerChattingItem[]>>(
      "/messages/getOrganizersChatting",
      {
        params: { managerId },
        _requiresAuth: true,
      } as any
    );

    return response.data.data || [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createOrGetConversationForVenue = async (payload: {
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

export const getConversationMessagesForVenue = async (
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

export const getManagerUnreadSummary = async (
  managerId: number
): Promise<ManagerUnreadSummaryResponse> => {
  try {
    const response = await axiosInstance.get<
      BackendResponse<ManagerUnreadSummaryResponse>
    >("/messages/unread/manager", {
      params: { managerId },
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

export const markConversationReadForVenue = async (payload: {
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










export interface UpdateVenueAvailabilityPayload {
  venueAvailabilityId: number;
  managerId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface DeleteVenueAvailabilityPayload {
  venueAvailabilityId: number;
  managerId: number;
}

export const updateVenueAvailability = async (
  payload: UpdateVenueAvailabilityPayload
): Promise<VenueAvailabilityItem> => {
  try {
    const response = await axiosInstance.put<BackendResponse<VenueAvailabilityItem>>(
      `/venueAvailability/updateVenueAvailability/${payload.venueAvailabilityId}`,
      {
        managerId: payload.managerId,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        price: payload.price,
      },
      {
        _requiresAuth: true,
      } as any
    );

    if (!response.data.data) {
      throw new Error("Venue availability was not updated successfully.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteVenueAvailability = async (
  payload: DeleteVenueAvailabilityPayload
): Promise<void> => {
  try {
    await axiosInstance.delete(
      `/venueAvailability/deleteVenueAvailability/${payload.venueAvailabilityId}`,
      {
        data: {
          managerId: payload.managerId,
        },
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
