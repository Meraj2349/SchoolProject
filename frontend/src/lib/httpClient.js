import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach token, language, and branch_id to every request
httpClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Send current language as Accept-Language header so the backend responds
  // in the user's selected language. Read from localStorage (Zustand persist key).
  try {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("language") : null;
    const parsed = stored ? JSON.parse(stored) : null;
    const lang = parsed?.state?.language ?? "bn";
    config.headers["Accept-Language"] = lang;
  } catch {
    config.headers["Accept-Language"] = "bn";
  }

  // Append branch_id from the branch store so all API calls are branch-scoped.
  // The backend auth middleware uses the JWT branch_id for write operations;
  // this query param is used by the frontend to scope read queries for super_admin.
  try {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("branch-store")
        : null;
    const parsed = stored ? JSON.parse(stored) : null;
    const branchId = parsed?.state?.currentBranchId ?? null;
    if (branchId != null) {
      // Append to query string without overwriting existing params
      const separator = config.url && config.url.includes("?") ? "&" : "?";
      config.url = `${config.url}${separator}branch_id=${branchId}`;
    }
  } catch {
    // Ignore storage errors — branch_id is optional
  }

  return config;
});

// Global response error handling
httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default httpClient;
