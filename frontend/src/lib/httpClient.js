import axios from "axios";
import Cookies from "js-cookie";
import { useBranchStore } from "@/store/branchStore";

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

  // Read branch_id direct from Zustand store (in-memory) — not localStorage.
  // Persist middleware writes to localStorage async, so reading storage can
  // return stale branch_id while React Query already refetched with new key.
  try {
    const branchId = useBranchStore.getState().currentBranchId ?? null;
    if (branchId != null) {
      const separator = config.url && config.url.includes("?") ? "&" : "?";
      config.url = `${config.url}${separator}branch_id=${branchId}`;
    }
  } catch {
    // Ignore — branch_id optional
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
