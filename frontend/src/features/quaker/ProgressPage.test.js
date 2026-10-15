import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import ProgressPage from "./ProgressPage";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock("next/image", () => ({ default: () => null }));

const api = vi.hoisted(() => ({ token: null, myProgress: vi.fn(), mySessions: vi.fn(), verifyStudent: vi.fn(), classesOf: vi.fn() }));
vi.mock("@/services/quiz.service", () => ({
  quizService: { myProgress: api.myProgress, mySessions: api.mySessions, verifyStudent: api.verifyStudent, classesOf: api.classesOf },
  quizTokenHolder: { get: () => api.token, set: vi.fn(), clear: vi.fn() },
  quizErrorMessage: (error, fallback) => fallback,
  isQuizSessionExpired: (error) => error?.response?.status === 401,
}));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [{ id: 1, name_en: "Main Campus" }] } }));

const SESSIONS = [
  { SessionID: 1, Subject: "Math", ClassKey: "8", TotalQuestions: 10, CorrectAnswers: 9, ScorePercentage: 90, TimeTakenSeconds: 75, CompletedAt: "2026-10-15T10:00:00Z" },
];

describe("ProgressPage", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => typeof fn === "function" && fn.mockReset());
    api.token = "quiz-token";
    api.myProgress.mockResolvedValue({ totals: { sessions: 1, avgScore: 90, totalCorrect: 9, totalQuestions: 10 }, bySubject: [] });
    api.mySessions.mockResolvedValue(SESSIONS);
    useLanguageStore.getState().setLanguage("en");
  });

  it("asks who the student is when there is no quiz session", async () => {
    api.token = null;

    render(<ProgressPage />);

    expect(await screen.findByRole("button", { name: "Continue" })).toBeInTheDocument();
    expect(api.mySessions).not.toHaveBeenCalled();
  });

  it("shows past quizzes with the class they were taken in", async () => {
    render(<ProgressPage />);

    const row = (await screen.findByText("Math")).closest("tr");
    expect(within(row).getByText("Class 8")).toBeInTheDocument();
    expect(within(row).getByText(/9\/10/)).toBeInTheDocument();
  });

  it("asks again when the quiz session has expired", async () => {
    api.mySessions.mockRejectedValue({ response: { status: 401 } });

    render(<ProgressPage />);

    expect(await screen.findByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("loads the history once the student is verified", async () => {
    api.token = null;
    api.classesOf.mockResolvedValue([{ ClassName: "Class 8", Section: "Good" }]);
    api.verifyStudent.mockResolvedValue({ token: "t", student: { studentId: 7, firstName: "Rahim" } });
    render(<ProgressPage />);
    const pick = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
    await waitFor(() => expect(screen.getByRole("option", { name: "Main Campus" })).toBeInTheDocument());
    pick("Branch", "1");
    await waitFor(() => expect(screen.getByRole("option", { name: "Class 8" })).toBeInTheDocument());
    pick("Class", "Class 8");
    pick("Section", "Good");
    pick("First name", "Rahim");
    pick("Last name", "Uddin");
    pick("Roll number", "1");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Math")).toBeInTheDocument();
    expect(api.mySessions).toHaveBeenCalledTimes(1);
  });
});
