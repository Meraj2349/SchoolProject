import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminPage from "./AdminPage";

const teachers = vi.hoisted(() => ({ getAll: vi.fn(), getAppAccess: vi.fn(), setAppAccess: vi.fn() }));
vi.mock("@/services/teachers.service", () => ({ teachersService: teachers }));
vi.mock("@/services/subjects.service", () => ({ subjectsService: { getAll: async () => [] } }));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));

describe("teacher list", () => {
  beforeEach(() => {
    teachers.getAll.mockResolvedValue([
      { TeacherID: 7, FirstName: "Nasima", LastName: "Akter", Subject: "Bangla", Email: "n@x.test" },
      { TeacherID: 8, FirstName: "Kamal", LastName: "Hossain", Subject: "Math", Email: "k@x.test" },
    ]);
    teachers.getAppAccess.mockResolvedValue({ success: true, data: [{ teacherId: 7, phone: "01711000001", enabled: true, hasPassword: true }] });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1, currentBranchName: "Main Campus" });
  });

  it("shows whose attendance app access is on, and opens it to change", async () => {
    renderWithQuery(<AdminPage />);

    const nasima = (await screen.findByText("Nasima Akter")).closest("tr");
    const kamal = screen.getByText("Kamal Hossain").closest("tr");
    expect(await within(nasima).findByText("On")).toBeInTheDocument();
    expect(within(kamal).getByText("Off")).toBeInTheDocument();

    fireEvent.click(within(nasima).getByRole("button", { name: "App access" }));

    const drawer = screen.getByRole("dialog", { name: "Attendance app: Nasima Akter" });
    expect(within(drawer).getByLabelText("Mobile number")).toHaveValue("01711000001");
  });
});
