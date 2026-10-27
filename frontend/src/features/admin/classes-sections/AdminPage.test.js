import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminPage from "./AdminPage";

vi.mock("@/services/classes.service", () => ({
  classesService: {
    getAll: async () => [
      {
        ClassID: 5,
        ClassName: "Class 5",
        Section: "Good",
        TeacherID: null,
        branch_id: 1,
      },
    ],
    getNames: async () => ["Class 5", "Class 6"],
    getStandardSections: async () => ["Better", "Good", "General"],
  },
}));

describe("classes & sections", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main" });
  });

  it("lets a super admin add a class", async () => {
    useAuthStore.setState({ role: "super_admin" });
    renderWithQuery(<AdminPage />);

    expect(await screen.findByText("Class 5")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Class" }),
    ).toBeInTheDocument();
    // The database keeps 10 characters of a section name.
    expect(screen.getByLabelText(/Section/)).toHaveAttribute("maxLength", "10");
  });

  it("does not offer a branch admin an add they cannot save, but lets them edit", async () => {
    useAuthStore.setState({ role: "branch_admin" });
    renderWithQuery(<AdminPage />);

    expect(await screen.findByText("Class 5")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add Class" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent(
      "Only the super admin can add classes and sections.",
    );

    fireEvent.click(screen.getByTitle("Edit"));
    expect(
      screen.getByRole("button", { name: "Update Class" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Section/)).toHaveValue("Good");
  });
});
