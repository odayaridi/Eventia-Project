import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3010/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Request Interceptor
 */
axiosInstance.interceptors.request.use(
  (config: any) => {
    // Manually check for the custom flag
    if (config._requiresAuth) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const isAuthRoute = originalRequest?.url?.includes("/login");

      if (!isAuthRoute) {
        console.warn("Unauthorized, redirecting to login...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("managerId");
        localStorage.removeItem("organizerId");
        localStorage.removeItem("attendeeId");
        
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;