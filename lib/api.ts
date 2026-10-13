
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";

type ApiErrorResponse = {
  message?: string;
  detail?: string;
  error?: string;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Enable only if your Python backend uses cookies.
  withCredentials: false,
});

// Request interceptor: attach the token automatically.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: central error handling.
api.interceptors.response.use(
  (response) => response,

  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    const message =
      data?.message ||
      data?.detail ||
      data?.error;

    if (status === 401 && typeof window !== "undefined") {
      // Avoid redirect loops on the login page.
      if (window.location.pathname !== "/") {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        window.location.replace("/");
      }
    } else if (status === 403) {
      toast.error(message || "You don't have permission to perform this action.");
    } else if (status === 422 || status === 400) {
      toast.error(message || "Please check your input.");
    } else if (status && status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Please try again.");
    } else if (!error.response) {
      toast.error("Unable to connect to the server.");
    } else if (status !== 401) {
      toast.error(message || "Something went wrong.");
    }

    return Promise.reject(error);
  }
);

export default api;