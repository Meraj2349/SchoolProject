import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import QuestionBankPage from "./QuestionBankPage";

const api = vi.hoisted(() => ({
  questions: vi.fn(),
  subjects: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  setActive: vi.fn(),
  classNames: vi.fn(),
}));
vi.mock("@/services/quizAdmin.service", () => ({
  quizAdminService: {
    questions: api.questions,
    subjects: api.subjects,
    createQuestion: api.create,
    updateQuestion: api.update,
    setQuestionActive: api.setActive,
  },
}));
vi.mock("@/services/classes.service", () => ({ classesService: { getNames: api.classNames } }));

const mirror = {
  id: 1,
  classKey: "10",
  subject: "Physics",
  prompt: "Which mirror is a rear view mirror?",
  options: { A: "Concave", B: "Convex", C: "Plain", D: "Convergent" },
  promptBn: "রিয়ার ভিউ মিরর কোন দর্পণ?",
  optionsBn: { A: "অবতল", B: "উত্তল", C: "সমতল", D: "অভিসারী" },
  answer: "B",
  active: true,
};
const force = { ...mirror, id: 2, subject: "Physics", prompt: "Unit of force?", promptBn: null, optionsBn: null, answer: "A" };

// Labels of required fields end with " *", so match from the start.
const startsWith = (label) => new RegExp(`^${label.replace(/[()]/g, "\\$&")}`);
const pick = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const rowOf = (text) => screen.getByText(text).closest("tr");

async function openClass10() {
  renderWithQuery(<QuestionBankPage />);
  await waitFor(() => expect(screen.getByRole("option", { name: "Class 10" })).toBeInTheDocument());
  pick("Class", "10");
  await screen.findByText("Which mirror is a rear view mirror?");
}

describe("Question bank", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.classNames.mockResolvedValue(["Class 10", "Nursery", "Class 8"]);
    api.questions.mockResolvedValue({ items: [mirror, force], total: 2, page: 1, pageSize: 25 });
    api.subjects.mockResolvedValue([
      { subject: "Physics", count: 314 },
      { subject: "Math", count: 375 },
    ]);
    api.create.mockResolvedValue({ success: true });
    api.update.mockResolvedValue({ success: true });
    api.setActive.mockResolvedValue({ success: true });
    useLanguageStore.getState().setLanguage("en");
  });

  it("asks for a class first, listing classes in school order", async () => {
    renderWithQuery(<QuestionBankPage />);

    await waitFor(() =>
      expect(within(screen.getByLabelText("Class")).getAllByRole("option").map((o) => o.textContent)).toEqual([
        "Select class",
        "Nursery",
        "Class 8",
        "Class 10",
      ]),
    );
    expect(screen.getByText("Choose a class to see its questions.")).toBeInTheDocument();
    expect(api.questions).not.toHaveBeenCalled();
  });

  it("lists a class's questions with subject, answer and status", async () => {
    await openClass10();

    expect(api.questions).toHaveBeenCalledWith({ classKey: "10", subject: "", search: "", status: "active", page: 1, pageSize: 25 });
    const row = rowOf("Which mirror is a rear view mirror?");
    expect(within(row).getByText("Physics")).toBeInTheDocument();
    expect(within(row).getByText("B")).toBeInTheDocument();
    expect(within(row).getByText("Shown")).toBeInTheDocument();
    expect(within(row).getByText("বাংলা")).toBeInTheDocument();
    expect(within(rowOf("Unit of force?")).queryByText("বাংলা")).not.toBeInTheDocument();
  });

  it("shows questions in Bangla for a Bangla admin, falling back to English", async () => {
    useLanguageStore.getState().setLanguage("bn");
    renderWithQuery(<QuestionBankPage />);
    await waitFor(() => expect(screen.getByRole("option", { name: "দশম শ্রেণি" })).toBeInTheDocument());

    pick("শ্রেণি", "10");

    expect(await screen.findByText("রিয়ার ভিউ মিরর কোন দর্পণ?")).toBeInTheDocument();
    expect(screen.getByText("Unit of force?")).toBeInTheDocument();
  });

  it("filters by subject, status and search", async () => {
    await openClass10();
    expect(within(screen.getByLabelText("Subject")).getAllByRole("option").map((o) => o.textContent)).toEqual([
      "All subjects",
      "Physics (314)",
      "Math (375)",
    ]);

    pick("Subject", "Math");
    pick("Status", "hidden");
    fireEvent.change(screen.getByRole("searchbox", { name: "Search questions" }), { target: { value: "mirror" } });
    fireEvent.submit(screen.getByRole("searchbox", { name: "Search questions" }));

    await waitFor(() =>
      expect(api.questions).toHaveBeenLastCalledWith({ classKey: "10", subject: "Math", search: "mirror", status: "hidden", page: 1, pageSize: 25 }),
    );
  });

  it("pages through the server's results", async () => {
    api.questions.mockResolvedValue({ items: [mirror, force], total: 60, page: 1, pageSize: 25 });
    await openClass10();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(api.questions).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  });

  it("adds a question for the chosen class with a live preview", async () => {
    await openClass10();
    fireEvent.click(screen.getByRole("button", { name: "Add question" }));
    const form = screen.getByRole("dialog", { name: "Add question" });
    const fill = (label, value) => fireEvent.change(within(form).getByLabelText(startsWith(label)), { target: { value } });

    expect(within(form).getByLabelText(startsWith("Class"))).toHaveValue("10");
    fill("Subject", "Math");
    fill("Question (English)", "What is 2 + 2?");
    fill("Option A", "3");
    fill("Option B", "4");
    fill("Option C", "5");
    fill("Option D", "6");
    fill("Correct answer", "B");
    expect(within(form).getByRole("region", { name: "Preview" })).toHaveTextContent("What is 2 + 2?");

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(api.create).toHaveBeenCalledWith({
        classKey: "10",
        subject: "Math",
        prompt: "What is 2 + 2?",
        options: { A: "3", B: "4", C: "5", D: "6" },
        promptBn: null,
        optionsBn: null,
        answer: "B",
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does not save an incomplete question", async () => {
    await openClass10();
    fireEvent.click(screen.getByRole("button", { name: "Add question" }));
    const form = screen.getByRole("dialog", { name: "Add question" });

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    expect(within(form).getAllByText("This field is required").length).toBeGreaterThan(0);
    expect(api.create).not.toHaveBeenCalled();
  });

  it("edits a question with its Bangla text filled in", async () => {
    await openClass10();
    fireEvent.click(within(rowOf("Which mirror is a rear view mirror?")).getByRole("button", { name: "Edit" }));
    const form = screen.getByRole("dialog", { name: "Edit question" });

    expect(within(form).getByLabelText(startsWith("Question (Bangla)"))).toHaveValue("রিয়ার ভিউ মিরর কোন দর্পণ?");
    fireEvent.change(within(form).getByLabelText(startsWith("Correct answer")), { target: { value: "C" } });
    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.update).toHaveBeenCalled());
    expect(api.update.mock.calls[0][0]).toBe(1);
    expect(api.update.mock.calls[0][1]).toMatchObject({ answer: "C", optionsBn: mirror.optionsBn });
  });

  it("shows the server's message when saving fails", async () => {
    api.update.mockRejectedValue({ response: { data: { message: "The correct answer must be A, B, C or D." } } });
    await openClass10();
    fireEvent.click(within(rowOf("Unit of force?")).getByRole("button", { name: "Edit" }));
    const form = screen.getByRole("dialog", { name: "Edit question" });

    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    expect(await within(form).findByRole("alert")).toHaveTextContent("The correct answer must be A, B, C or D.");
  });

  it("hides a question from students, and shows a hidden one again", async () => {
    await openClass10();

    fireEvent.click(within(rowOf("Unit of force?")).getByRole("button", { name: "Hide" }));
    await waitFor(() => expect(api.setActive).toHaveBeenCalledWith(2, false));

    api.questions.mockResolvedValue({ items: [{ ...force, active: false }], total: 1, page: 1, pageSize: 25 });
    pick("Status", "hidden");
    const row = (await screen.findByText("Hidden")).closest("tr");
    fireEvent.click(within(row).getByRole("button", { name: "Show" }));

    await waitFor(() => expect(api.setActive).toHaveBeenLastCalledWith(2, true));
  });
});
