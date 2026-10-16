import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery as render } from "@/test-utils";
import { useQuizSessionStore } from "@/store/quizSessionStore";
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
    useQuizSessionStore.getState().clearSession();
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

  it("shows the totals and subject breakdown, with one page heading", async () => {
    api.myProgress.mockResolvedValue({
      totals: { sessions: 3, avgScore: 76.4, totalCorrect: 23, totalQuestions: 30 },
      bySubject: [{ subject: "Math", sessions: 2, totalCorrect: 17, totalQuestions: 20, avgScore: 85 }],
    });
    render(<ProgressPage />);

    expect(await screen.findByText(/2 quizzes · 17\/20 correct/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Your learning journey" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("Average score").nextSibling).toHaveTextContent("76%");
    expect(screen.getByText(/2 quizzes · 17\/20 correct/)).toBeInTheDocument();
    const row = screen.getAllByText("Math").at(-1).closest("tr");
    expect(within(row).getByText("1m 15s")).toBeInTheDocument();
    expect(within(row).getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New Quiz" })).toHaveAttribute("href", "/quaker/quiz");
  });

  it("speaks Bangla", async () => {
    useLanguageStore.getState().setLanguage("bn");
    render(<ProgressPage />);

    expect(await screen.findByRole("columnheader", { name: "বিষয়" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "আপনার শেখার যাত্রা" })).toBeInTheDocument();
    expect(screen.getByText("১ মি ১৫ সে")).toBeInTheDocument();
    expect(screen.queryByText(/Session History|Total Sessions|New Quiz/)).not.toBeInTheDocument();
  });

  it("says so when the history cannot load, instead of showing zeros", async () => {
    api.mySessions.mockRejectedValueOnce({ response: { status: 500 } }).mockResolvedValueOnce(SESSIONS);
    render(<ProgressPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load your progress.");
    expect(screen.queryByText("No quizzes yet.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("Math")).toBeInTheDocument();
  });
});
