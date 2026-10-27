import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminNoticesPage from "./AdminNoticesPage";

vi.mock("@/services/notices.service", () => ({
  noticesService: {
    getAll: async () => [
      { NoticeID: 1, Title: "Holiday", Description: "Closed", Show: 1, branch_id: null },
      { NoticeID: 2, Title: "Exam week", Description: "Study", Show: 0, branch_id: null },
    ],
  },
}));
vi.mock("@/services/branch.service", () => ({ branchService: { getAll: async () => [] } }));

describe("notices", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null, currentBranchName: "All Branches" });
  });

  it("says whether each notice is shown on the website", async () => {
    renderWithQuery(<AdminNoticesPage />);

    const holiday = (await screen.findByText("Holiday")).closest("tr");
    const exams = screen.getByText("Exam week").closest("tr");
    expect(holiday.querySelector("button[aria-label='Show']")).toHaveAttribute("aria-pressed", "true");
    expect(exams.querySelector("button[aria-label='Show']")).toHaveAttribute("aria-pressed", "false");
  });
});
