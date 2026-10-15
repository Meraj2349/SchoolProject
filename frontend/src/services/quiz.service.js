/**
 * Student-side quiz calls. They carry the quiz JWT (from sessionStorage), never
 * the admin token, and no site branch filter. Admin quiz calls live in
 * quizAdmin.service.js.
 */
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// ── Token holder (sessionStorage, so a page refresh keeps the session) ────

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

const quizClient = axios.create({ baseURL: BASE_URL });

quizClient.interceptors.request.use((config) => {
  const token = quizTokenHolder.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("language") : null;
    config.headers["Accept-Language"] = JSON.parse(stored)?.state?.language ?? "bn";
  } catch {
    config.headers["Accept-Language"] = "bn";
  }
  return config;
});

// API answers { success, data }; callers get the data.
const dataOf = (response) => response.data?.data;

/** The server's message for a failed call, else `fallback`. */
export const quizErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback;

export const isQuizSessionExpired = (error) => error?.response?.status === 401;

export const quizService = {
  /** Public: { ClassName, Section } pairs of one branch, for the identity form. */
  classesOf: (branchId) =>
    quizClient.get("/classes/distinct", { params: { branch_id: branchId } }).then((r) => r.data?.data ?? r.data ?? []),

  /** Public: check the student's identity; stores the 30-minute quiz token. */
  verifyStudent: async (identity) => {
    const data = dataOf(await quizClient.post("/quiz/verify", identity));
    quizTokenHolder.set(data.token);
    return data; // { token, student }
  },

  /** The student's class and its subjects: { className, classKey, subjects: [{ subject, count }], total }. */
  getMeta: async () => dataOf(await quizClient.get("/quiz/meta")),

  /** { subject?, count } → { questions, subject, classKey, startedAt } */
  start: async (payload) => dataOf(await quizClient.post("/quiz/start", payload)),

  /** { answers, timeTakenSeconds } → { totalQuestions, correctAnswers, scorePercentage, grade, details } */
  finish: async (payload) => dataOf(await quizClient.post("/quiz/finish", payload)),

  mySessions: async () => dataOf(await quizClient.get("/quiz/my-sessions")),

  myProgress: async () => dataOf(await quizClient.get("/quiz/my-progress")),
};
