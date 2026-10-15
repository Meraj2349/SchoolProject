import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import QuizLeaderboardPage from "./QuizLeaderboardPage";
import QuizResultsPage from "./QuizResultsPage";

const api = vi.hoisted(() => ({ sessions: vi.fn(), leaderboard: vi.fn(), classNames: vi.fn() }));
vi.mock("@/services/quizAdmin.service", () => ({
  quizAdminService: { sessions: api.sessions, leaderboard: api.leaderboard },
}));
vi.mock("@/services/classes.service", () => ({ classesService: { getNames: api.classNames } }));

const SESSION = {
  SessionID: 5,
  StudentName: "Rahim Uddin",
  StudentRoll: "1",
  ClassName: "Class 8",
  Section: "Good",
  ClassKey: "8",
  Subject: "Math",
  TotalQuestions: 10,
  CorrectAnswers: 8,
  ScorePercentage: 80,
  TimeTakenSeconds: 125,
  CompletedAt: "2026-10-15T10:00:00Z",
};

describe("Quiz results", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.classNames.mockResolvedValue(["Class 8", "Class 10"]);
    api.sessions.mockResolvedValue({ items: [SESSION, { ...SESSION, SessionID: 6, Subject: null, ScorePercentage: 45 }], total: 2 });
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: null });
  });

  it("lists quizzes with student, class, subject, score and grade", async () => {
    renderWithQuery(<QuizResultsPage />);

    const rows = (await screen.findAllByText("Rahim Uddin")).map((cell) => cell.closest("tr"));
    expect(within(rows[0]).getByText("Class 8 · Good")).toBeInTheDocument();
    expect(within(rows[0]).getByText("Math")).toBeInTheDocument();
    expect(within(rows[0]).getByText("8/10 (80%)")).toBeInTheDocument();
    expect(within(rows[0]).getByText("B")).toBeInTheDocument();
    expect(within(rows[0]).getByText("2:05")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Mixed")).toBeInTheDocument();
    expect(within(rows[1]).getByText("F")).toBeInTheDocument();
  });

  it("filters by class and pages on the server", async () => {
    api.sessions.mockResolvedValue({ items: [SESSION], total: 60 });
    renderWithQuery(<QuizResultsPage />);
    await screen.findByText("Rahim Uddin");
    await waitFor(() => expect(screen.getByRole("option", { name: "Class 10" })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "10" } });
    await waitFor(() => expect(api.sessions).toHaveBeenLastCalledWith({ classKey: "10", page: 1, pageSize: 25 }));

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(api.sessions).toHaveBeenLastCalledWith({ classKey: "10", page: 2, pageSize: 25 }));
  });

  it("reloads when the admin switches branch", async () => {
    renderWithQuery(<QuizResultsPage />);
    await screen.findAllByText("Rahim Uddin");
    const calls = api.sessions.mock.calls.length;

    useBranchStore.setState({ currentBranchId: 2 });

    await waitFor(() => expect(api.sessions.mock.calls.length).toBeGreaterThan(calls));
  });
});

describe("Quiz leaderboard", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.classNames.mockResolvedValue(["Class 8", "Class 10"]);
    api.leaderboard.mockResolvedValue([
      { StudentID: 1, StudentName: "Rahim Uddin", ClassName: "Class 8", Section: "Good", StudentRoll: "1", sessions: 3, avgScore: 86.666, bestScore: 100 },
      { StudentID: 2, StudentName: "Nadia Akter", ClassName: "Class 8", Section: "Good", StudentRoll: "2", sessions: 1, avgScore: 40, bestScore: 40 },
    ]);
    useLanguageStore.getState().setLanguage("en");
  });

  it("ranks students by average score", async () => {
    renderWithQuery(<QuizLeaderboardPage />);

    const first = (await screen.findByText("Rahim Uddin")).closest("tr");
    const rankOf = (row) => within(row).getAllByRole("cell")[0].textContent;
    expect(rankOf(first)).toBe("1");
    expect(within(first).getByText("87%")).toBeInTheDocument();
    expect(within(first).getByText("100%")).toBeInTheDocument();
    expect(rankOf(screen.getByText("Nadia Akter").closest("tr"))).toBe("2");
  });

  it("can be limited to one class", async () => {
    renderWithQuery(<QuizLeaderboardPage />);
    await screen.findByText("Rahim Uddin");
    await waitFor(() => expect(screen.getByRole("option", { name: "Class 8" })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "8" } });

    await waitFor(() => expect(api.leaderboard).toHaveBeenLastCalledWith({ classKey: "8", limit: 50 }));
  });
});
