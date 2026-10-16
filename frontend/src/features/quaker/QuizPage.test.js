import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import QuizPage from "./QuizPage";

const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const api = vi.hoisted(() => ({ getMeta: vi.fn(), start: vi.fn(), finish: vi.fn(), token: "quiz-token" }));
vi.mock("@/services/quiz.service", () => ({
  quizService: { getMeta: api.getMeta, start: api.start, finish: api.finish },
  quizTokenHolder: { get: () => api.token, set: vi.fn(), clear: vi.fn() },
  quizErrorMessage: (error, fallback) => error?.response?.data?.message || fallback,
  isQuizSessionExpired: (error) => error?.response?.status === 401,
}));

const META = {
  className: "Class 8",
  classKey: "8",
  subjects: [
    { subject: "Math", count: 208 },
    { subject: "Science", count: 220 },
  ],
  total: 428,
};

const QUESTIONS = [
  {
    id: 11,
    subject: "Science",
    prompt: "What type of mirror is a rear view mirror?",
    options: { A: "Concave", B: "Convex", C: "Plain", D: "Convergent" },
    promptBn: "রিয়ার ভিউ মিরর কোন ধরনের দর্পণ?",
    optionsBn: { A: "অবতল", B: "উত্তল", C: "সমতল", D: "অভিসারী" },
  },
  {
    id: 12,
    subject: "Math",
    prompt: "What is 2 + 2?",
    options: { A: "3", B: "4", C: "5", D: "6" },
    promptBn: null,
    optionsBn: null,
  },
];

const startQuiz = async () => {
  render(<QuizPage />);
  fireEvent.click(await screen.findByRole("button", { name: "Start quiz" }));
  await screen.findByRole("heading", { level: 2 });
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
};

describe("QuizPage", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => typeof fn === "function" && fn.mockReset());
    router.replace.mockReset();
    api.token = "quiz-token";
    api.getMeta.mockResolvedValue(META);
    api.start.mockResolvedValue({ quizId: 42, questions: QUESTIONS, subject: null, classKey: "8" });
    api.finish.mockResolvedValue({
      totalQuestions: 2,
      correctAnswers: 1,
      scorePercentage: 50,
      grade: "F",
      details: [
        { questionId: 11, userAnswer: "B", correctAnswer: "B", isCorrect: true },
        { questionId: 12, userAnswer: "A", correctAnswer: "B", isCorrect: false },
      ],
    });
    useLanguageStore.getState().setLanguage("en");
  });

  it("sends a student without a quiz session to the identity form", async () => {
    api.token = null;

    render(<QuizPage />);

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/quaker/start"));
  });

  it("shows the student's own class and its subjects only", async () => {
    render(<QuizPage />);

    expect(await screen.findByText("Class 8")).toBeInTheDocument();
    const subject = screen.getByLabelText("Subject");
    expect(within(subject).getAllByRole("option").map((o) => o.textContent)).toEqual([
      "All subjects (428 questions)",
      "Math (208 questions)",
      "Science (220 questions)",
    ]);
    expect(screen.queryByText(/difficulty/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^grade$/i)).not.toBeInTheDocument();
  });

  it("explains when the class has no questions yet", async () => {
    api.getMeta.mockResolvedValue({ className: "Class 6", classKey: "6", subjects: [], total: 0 });

    render(<QuizPage />);

    expect(await screen.findByText("No questions for your class yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start quiz" })).not.toBeInTheDocument();
  });

  it("starts a quiz for the chosen subject and number of questions", async () => {
    render(<QuizPage />);
    fireEvent.change(await screen.findByLabelText("Subject"), { target: { value: "Math" } });
    fireEvent.click(screen.getByRole("button", { name: "15" }));
    fireEvent.click(screen.getByRole("button", { name: "Start quiz" }));

    await waitFor(() => expect(api.start).toHaveBeenCalledWith({ subject: "Math", count: 15 }));
  });

  it("shows questions in the site language and can switch to the other language", async () => {
    useLanguageStore.getState().setLanguage("bn");
    render(<QuizPage />);
    fireEvent.click(await screen.findByRole("button", { name: "কুইজ শুরু করুন" }));

    expect(await screen.findByRole("heading", { name: "রিয়ার ভিউ মিরর কোন ধরনের দর্পণ?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /উত্তল/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("heading", { name: "What type of mirror is a rear view mirror?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Convex/ })).toBeInTheDocument();
  });

  it("falls back to English for a question without Bangla, and says so", async () => {
    useLanguageStore.getState().setLanguage("bn");
    render(<QuizPage />);
    fireEvent.click(await screen.findByRole("button", { name: "কুইজ শুরু করুন" }));
    await screen.findByRole("heading", { level: 2 });

    fireEvent.click(screen.getByRole("button", { name: "পরের" }));

    expect(screen.getByRole("heading", { name: "What is 2 + 2?" })).toBeInTheDocument();
    expect(screen.getByText("এই প্রশ্নটি শুধু ইংরেজিতে আছে।")).toBeInTheDocument();
  });

  it("submits the answers and shows the score and a review", async () => {
    await startQuiz();
    fireEvent.click(screen.getByRole("button", { name: /Convex/ }));
    expect(screen.getByRole("button", { name: /Convex/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: /^A\s*3$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Submit quiz" }));

    await waitFor(() => expect(api.finish).toHaveBeenCalled());
    const payload = api.finish.mock.calls[0][0];
    expect(payload.quizId).toBe(42);
    expect(payload.answers).toEqual([
      expect.objectContaining({ questionId: 11, userAnswer: "B" }),
      expect.objectContaining({ questionId: 12, userAnswer: "A" }),
    ]);

    expect(await screen.findByText("1 out of 2 correct")).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Quiz complete" })).toBeInTheDocument();
    const review = screen.getByRole("region", { name: "Answer review" });
    expect(within(review).getAllByText("Correct")).toHaveLength(1);
    expect(within(review).getByText("Wrong")).toBeInTheDocument();
  });

  it("asks before submitting with unanswered questions", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await startQuiz();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.click(screen.getByRole("button", { name: "Submit quiz" }));

    expect(confirm).toHaveBeenCalledWith("2 questions are not answered yet. Submit anyway?");
    expect(api.finish).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it("shows the server's message when the class has no questions for a subject", async () => {
    api.start.mockRejectedValue({ response: { status: 404, data: { message: "There are no questions for this subject yet." } } });
    render(<QuizPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Start quiz" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("There are no questions for this subject yet.");
  });

  it("returns to the identity form when the quiz session has ended", async () => {
    api.start.mockRejectedValue({ response: { status: 401, data: {} } });
    render(<QuizPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Start quiz" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/quaker/start"));
  });
});
