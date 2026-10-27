import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminPage from "./AdminPage";

const exams = vi.hoisted(() => ({ getAll: vi.fn(), create: vi.fn() }));
vi.mock("@/services/exams.service", () => ({ examsService: exams }));
vi.mock("@/services/classes.service", () => ({
  classesService: {
    getAll: async () => [{ ClassID: 5, ClassName: "Class 5", Section: "Good" }],
  },
}));

describe("exams", () => {
  beforeEach(() => {
    exams.getAll.mockResolvedValue([]);
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main" });
  });

  it("shows the server's reason when it refuses an exam", async () => {
    exams.create.mockRejectedValue({
      message: "Request failed with status code 400",
      response: {
        data: {
          success: false,
          message: "The exam date cannot be in the past.",
        },
      },
    });
    renderWithQuery(<AdminPage />);
    await screen.findByRole("option", { name: "Class 5" });

    fireEvent.change(screen.getByLabelText("Exam Type"), {
      target: { value: "Monthly" },
    });
    fireEvent.change(screen.getByLabelText("Exam Name"), {
      target: { value: "October test" },
    });
    fireEvent.change(screen.getByLabelText("Class"), {
      target: { value: "Class 5" },
    });
    fireEvent.change(screen.getByLabelText("Section"), {
      target: { value: "Good" },
    });
    fireEvent.change(screen.getByLabelText("Exam Date"), {
      target: { value: "2020-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Exam" }));

    expect(
      await screen.findByText("The exam date cannot be in the past."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/status code 400/)).not.toBeInTheDocument();
  });
});
