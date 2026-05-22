import axiosInstance from "./interceptor/axiosInstance";

export type UserRole =
  | "admin"
  | "eventOrganizer"
  | "venueManager"
  | "attendee";

export interface AuthResponse {
  accessToken: string;
  user: {
    firstName: string;   
    lastName: string;    
    username: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    userId:number
    organizerId?: number;
    managerId?: number;
    attendeeId?: number;
  };
}

interface BackendResponse<T = unknown> {
  success: string | boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Extracts error message from backend response
 */
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

/**
 * Register User
 */
export const createUser = async (formData: FormData) => {
  try {
    const response = await axiosInstance.post(
      "/auth/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Login User
 */
export const loginUser = async (credentials: {
  username: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};






/**
 * Forgot Password
 */
export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Verify Reset Token
 */
export const verifyResetToken = async (token: string) => {
  try {
    const response = await axiosInstance.post("/auth/verify-reset-token", {
      token,
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (
  token: string,
  newPassword: string
) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", {
      token,
      newPassword,
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
