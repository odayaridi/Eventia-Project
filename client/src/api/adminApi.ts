import axiosInstance from "./interceptor/axiosInstance";

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

// export interface PendingEventOrganizerItem {
//   email: string;
//   username: string;
//   phoneNumber: string | null;
//   organization: string | null;
//   commercialRegistrationDocument: string | null;
// }

// export interface PendingVenueManagerItem {
//   email: string;
//   username: string;
//   phoneNumber: string | null;
//   venueAuthorizationDocument: string | null;
// }


export interface PendingEventOrganizerItem {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
  organization: string | null;
  commercialRegistrationDocument: string | null;
}

export interface PendingVenueManagerItem {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
  venueAuthorizationDocument: string | null;
}

export interface PendingEventOrganizersResponse {
  pendingEventOrganizers: PendingEventOrganizerItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PendingVenueManagersResponse {
  pendingVenueManagers: PendingVenueManagerItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getPendingEventOrganizers = async (
  page: number,
  limit: number,
  query = ""
): Promise<PendingEventOrganizersResponse> => {
  try {
    const response =
      await axiosInstance.get<BackendResponse<PendingEventOrganizersResponse>>(
        "/admin/getPendingEventOrganizers",
        {
          params: { page, limit, query },
          _requiresAuth: true,
        } as any
      );

    return (
      response.data.data || {
        pendingEventOrganizers: [],
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

export const getPendingVenueManagers = async (
  page: number,
  limit: number,
  query = ""
): Promise<PendingVenueManagersResponse> => {
  try {
    const response =
      await axiosInstance.get<BackendResponse<PendingVenueManagersResponse>>(
        "/admin/getPendingVenueManagers",
        {
          params: { page, limit, query },
          _requiresAuth: true,
        } as any
      );

    return (
      response.data.data || {
        pendingVenueManagers: [],
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




export const acceptVenueManager = async (venueManagerName: string): Promise<void> => {
  try {
    await axiosInstance.put(
      "/admin/acceptVenueManager",
      { venueManagerName },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const rejectVenueManager = async (venueManagerName: string): Promise<void> => {
  try {
    await axiosInstance.put(
      "/admin/rejectVenueManager",
      { venueManagerName },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const acceptEventOrganizer = async (organizerName: string): Promise<void> => {
  try {
    await axiosInstance.put(
      "/admin/acceptEventOrganizer",
      { organizerName },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const rejectEventOrganizer = async (organizerName: string): Promise<void> => {
  try {
    await axiosInstance.put(
      "/admin/rejectEventOrganizer",
      { organizerName },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};






















// export interface AdminAttendeeItem {
//   attendeeId: number;
//   email: string;
//   username: string;
//   phoneNumber: string | null;
// }

// export interface AdminAttendeesResponse {
//   attendees: AdminAttendeeItem[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// export interface UpdateAttendeePayload {
//   attendeeId: number;
//   email: string;
//   username: string;
//   password: string;
//   phoneNumber: string;
// }


export interface AdminAttendeeItem {
  attendeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
}

export interface AdminAttendeesResponse {
  attendees: AdminAttendeeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateAttendeePayload {
  attendeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
}


export const getAllAttendees = async (
  page: number,
  limit: number
): Promise<AdminAttendeesResponse> => {
  try {
    const response = await axiosInstance.get<BackendResponse<AdminAttendeesResponse>>(
      "/admin/getAllAttendees",
      {
        params: { page, limit },
        _requiresAuth: true,
      } as any
    );

    return (
      response.data.data || {
        attendees: [],
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

export const updateAttendeeAdmin = async (
  payload: UpdateAttendeePayload
): Promise<AdminAttendeeItem> => {
  try {
    const response = await axiosInstance.put(
      "/admin/updateAttendee",
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

export const deleteAttendeeAdmin = async (attendeeId: number): Promise<void> => {
  try {
    await axiosInstance.put(
      "/admin/deleteAttendee",
      { attendeeId },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



export interface AdminOrganizerItem {
  organizerId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
  organization: string | null;
}

export interface AdminOrganizersResponse {
  eventOrganizers: AdminOrganizerItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrganizerPayload {
  organizerId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  organization: string;
}

export const getAllEventOrganizers = async (
  page: number,
  limit: number
): Promise<AdminOrganizersResponse> => {
  try {
    const response = await axiosInstance.get<BackendResponse<AdminOrganizersResponse>>(
      "/admin/getAllEventOrganizers",
      {
        params: { page, limit },
        _requiresAuth: true,
      } as any
    );

    return (
      response.data.data || {
        eventOrganizers: [],
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

export const updateEventOrganizerAdmin = async (
  payload: UpdateOrganizerPayload
): Promise<AdminOrganizerItem> => {
  try {
    const response = await axiosInstance.put(
      "/admin/updateEventOrganizerProfileAdmin",
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

export const deleteEventOrganizerAdmin = async (organizerId: number): Promise<void> => {
  try {
    await axiosInstance.put(
      "/admin/deleteEventOrganizer",
      { organizerId },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};





export interface AdminManagerItem {
  managerId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string | null;
}

export interface AdminManagersResponse {
  venueManagers: AdminManagerItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateManagerPayload {
  managerId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
}

export const getAllVenueManagers = async (
  page: number,
  limit: number
): Promise<AdminManagersResponse> => {
  try {
    const response = await axiosInstance.get<BackendResponse<AdminManagersResponse>>(
      "/admin/getAllVenueManagers",
      {
        params: { page, limit },
        _requiresAuth: true,
      } as any
    );

    return (
      response.data.data || {
        venueManagers: [],
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

export const updateVenueManagerAdmin = async (
  payload: UpdateManagerPayload
): Promise<AdminManagerItem> => {
  try {
    const response = await axiosInstance.put(
      "/admin/updateVenueManagerProfileAdmin",
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

export const deleteVenueManagerAdmin = async (managerId: number): Promise<void> => {
  try {
    await axiosInstance.put(
      "/admin/deleteVenueManager",
      { managerId },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};




















export interface ContactRequestItem {
  id: number;
  subject: string;
  message: string;
  created_at: string;
  username: string;
  email: string;
  phoneNumber: string;
}

export const getAttendeeRequests = async (): Promise<ContactRequestItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<ContactRequestItem[]>>(
      "/supportRequestAttendee/getAttendeeRequests",
      {
        _requiresAuth: true,
      } as any
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const resolveAttendeeReq = async (id: number): Promise<void> => {
  try {
    await axiosInstance.put(
      "/supportRequestAttendee/resolveAttendeeReq",
      { id },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getManagerRequests = async (): Promise<ContactRequestItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<ContactRequestItem[]>>(
      "/supportRequestManager/getManagerRequests",
      {
        _requiresAuth: true,
      } as any
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const resolveManagerReq = async (id: number): Promise<void> => {
  try {
    await axiosInstance.put(
      "/supportRequestManager/resolveManagerReq",
      { id },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getOrganizerRequests = async (): Promise<ContactRequestItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<ContactRequestItem[]>>(
      "/supportRequestOrganizer/getOrganizerRequests",
      {
        _requiresAuth: true,
      } as any
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const resolveOrganizerReq = async (id: number): Promise<void> => {
  try {
    await axiosInstance.put(
      "/supportRequestOrganizer/resolveOrganizerReq",
      { id },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};























export interface PlatformSettingItem {
  id: number;
  name: string;
}

export const getEventTypeNames = async (): Promise<PlatformSettingItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<PlatformSettingItem[]>>(
      "/platformSettings/getEventTypeNames",
      {
        _requiresAuth: true,
      } as any
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getTicketTypeNames = async (): Promise<PlatformSettingItem[]> => {
  try {
    const response = await axiosInstance.get<BackendResponse<PlatformSettingItem[]>>(
      "/platformSettings/getTicketTypeNames",
      {
        _requiresAuth: true,
      } as any
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addEventType = async (name: string): Promise<PlatformSettingItem> => {
  try {
    const response = await axiosInstance.post(
      "/platformSettings/addEventType",
      { name },
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const editEventType = async (
  id: number,
  name: string
): Promise<PlatformSettingItem> => {
  try {
    const response = await axiosInstance.put(
      "/platformSettings/editEventType",
      { id, name },
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteEventType = async (id: number): Promise<void> => {
  try {
    await axiosInstance.put(
      "/platformSettings/deleteEventType",
      { id },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addTicketType = async (name: string): Promise<PlatformSettingItem> => {
  try {
    const response = await axiosInstance.post(
      "/platformSettings/addTicketType",
      { name },
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const editTicketType = async (
  id: number,
  name: string
): Promise<PlatformSettingItem> => {
  try {
    const response = await axiosInstance.put(
      "/platformSettings/editTicketType",
      { id, name },
      {
        _requiresAuth: true,
      } as any
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteTicketType = async (id: number): Promise<void> => {
  try {
    await axiosInstance.put(
      "/platformSettings/deleteTicketType",
      { id },
      {
        _requiresAuth: true,
      } as any
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};















// ─── ADD these types + 5 methods to your existing adminApi.ts ────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminCountAllUsers {
  totalUsers:           number;
  totalAttendees:       number;
  totalEventOrganizers: number;
  totalVenueManagers:   number;
}

export interface AdminCountEventsAndVenues {
  totalEvents: number;
  totalVenues: number;
}

export interface AdminCountPendingUsers {
  pendingVenueManagers:   number;
  pendingEventOrganizers: number;
  totalPending:           number;
}

export interface AdminCountVenueManagers {
  approvedVenueManagers: number;
  rejectedVenueManagers: number;
}

export interface AdminCountEventOrganizers {
  approvedEventOrganizers: number;
  rejectedEventOrganizers: number;
}

// ── Shared helper ─────────────────────────────────────────────────────────────

const adminDashboardGet = async <T>(path: string): Promise<T> => {
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

// ── 5 Methods ─────────────────────────────────────────────────────────────────

export const adminCountAllUsers = () =>
  adminDashboardGet<AdminCountAllUsers>("/admin/dashboard/countAllUsers");

export const adminCountEventsAndVenues = () =>
  adminDashboardGet<AdminCountEventsAndVenues>("/admin/dashboard/countEventsAndVenues");

export const adminCountPendingUsers = () =>
  adminDashboardGet<AdminCountPendingUsers>("/admin/dashboard/countPendingUsers");

export const adminCountVenueManagers = () =>
  adminDashboardGet<AdminCountVenueManagers>("/admin/dashboard/countVenueManagers");

export const adminCountEventOrganizers = () =>
  adminDashboardGet<AdminCountEventOrganizers>("/admin/dashboard/countEventOrganizers");