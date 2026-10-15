import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminApplicationsPage from "./AdminPage";

const APPLICATIONS = [
  { id: 1, applicant_name: "Nusrat Jahan", parent_name: "J", applying_for_class: "Class 3", parent_contact: "0170", status: "pending", branch_id: 2 },
  { id: 2, applicant_name: "Old Applicant", parent_name: "O", applying_for_class: "Class 1", parent_contact: "0171", status: "pending", branch_id: null },
];
vi.mock("@/services/application.service", () => ({
  applicationService: { getAll: async () => ({ success: true, data: APPLICATIONS }) },
}));
vi.mock("@/services/branch.service", () => ({
  branchService: { getAll: async () => [{ id: 1, name_en: "Main" }, { id: 2, name_en: "North" }] },
}));

const rowOf = async (name) => (await screen.findByText(name)).closest("tr");

describe("AdminApplicationsPage", () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null });
  });

  it("lets a super admin on All branches handle applications, which already name their branch", async () => {
    renderWithQuery(<AdminApplicationsPage />);

    const row = await rowOf("Nusrat Jahan");
    expect(await within(row).findByText("North")).toBeInTheDocument();
    expect(within(row).getByRole("combobox")).toBeEnabled();
    expect(within(row).getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.queryByText(/Choose a branch in the top bar/)).not.toBeInTheDocument();
  });

  it("marks old applications that have no branch", async () => {
    renderWithQuery(<AdminApplicationsPage />);

    expect(within(await rowOf("Old Applicant")).getByText("No branch")).toBeInTheDocument();
  });
});
