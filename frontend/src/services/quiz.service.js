/**
 * Quiz service — all student-side calls inject the quiz JWT from sessionStorage.
 * Admin calls use the regular httpClient (which injects the admin JWT).
 */
import axios from "axios";
import httpClient from "@/lib/httpClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// ── Token holder (in-memory + sessionStorage for page-refresh recovery) ────

const TOKEN_KEY = "quizToken";

export const quizTokenHolder = {
  get() {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(TOKEN_KEY) || null;
  },
  set(token) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

// ── Axios instance for quiz-token-authenticated requests ──────────────────

const quizClient = axios.create({ baseURL: BASE_URL });

quizClient.interceptors.request.use((config) => {
  const token = quizTokenHolder.get();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ── Service ───────────────────────────────────────────────────────────────

export const quizService = {
  /** Public: fetch subjects + grades for dropdown filters. */
  getMeta: async () => {
    const { data } = await quizClient.get("/quiz/meta");
    return data;
  },

  /**
   * Public: verify student identity, receive a 30-min quiz JWT.
   * Stores token in sessionStorage on success.
   */
  verifyStudent: async ({ branchId, firstName, lastName, className, section, rollNumber }) => {
    const { data } = await quizClient.post("/quiz/verify", {
      branchId,
      firstName,
      lastName,
      className,
      section,
      rollNumber,
    });
    if (data.token) {
      quizTokenHolder.set(data.token);
    }
    return data; // { token, student }
  },

  /** Start quiz — requires quiz token. */
  start: async (payload) => {
    const { data } = await quizClient.post("/quiz/start", payload);
    return data;
  },

  /** Finish quiz, submit answers — requires quiz token. */
  finish: async (payload) => {
    const { data } = await quizClient.post("/quiz/finish", payload);
    return data;
  },

  /** Fetch own sessions — requires quiz token. */
  mySessions: async () => {
    const { data } = await quizClient.get("/quiz/my-sessions");
    return data;
  },

  /** Fetch own progress aggregates — requires quiz token. */
  myProgress: async () => {
    const { data } = await quizClient.get("/quiz/my-progress");
    return data;
  },

  // ── Admin endpoints (use admin JWT from httpClient) ──

  adminSessions: async (params = {}) => {
    const { data } = await httpClient.get("/quiz/admin/sessions", { params });
    return data;
  },

  adminLeaderboard: async (params = {}) => {
    const { data } = await httpClient.get("/quiz/admin/leaderboard", { params });
    return data;
  },
};
