import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import AdminPage from "./AdminPage";

const api = vi.hoisted(() => ({ getAll: vi.fn(), getOverview: vi.fn(), remove: vi.fn(), toastError: vi.fn() }));
vi.mock("@/services/branch.service", () => ({
  branchService: { getAll: api.getAll, getOverview: api.getOverview, remove: api.remove, create: vi.fn(), update: vi.fn() },
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: api.toastError } }));

const BRANCHES = [
  { id: 1, name_en: "Main Campus", name_bn: "প্রধান", is_proposed: 0 },
  { id: 2, name_en: "North Campus", name_bn: "উত্তর", is_proposed: 0 },
];

describe("Branch management", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.getAll.mockResolvedValue(BRANCHES);
    api.getOverview.mockResolvedValue([
      { id: 1, studentCount: 120, adminCount: 2, feesBilled: 180000, feesCollected: 150000 },
      { id: 2, studentCount: 0, adminCount: 0, feesBilled: 0, feesCollected: 0 },
    ]);
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "super_admin" });
  });

  it("shows each branch's students, admins and this month's fees", async () => {
    renderWithQuery(<AdminPage />);

    const row = (await screen.findByText("Main Campus")).closest("tr");
    await waitFor(() => expect(within(row).getByText("120")).toBeInTheDocument());
    expect(within(row).getByText("2")).toBeInTheDocument();
    expect(within(row).getByText("৳1,50,000.00 / ৳1,80,000.00")).toBeInTheDocument();
  });

  it("explains why a branch with data cannot be deleted", async () => {
    api.remove.mockRejectedValue({
      response: {
        status: 409,
        data: {
          message: "This branch still has students, staff, admins or fee records. Move or remove them first.",
          data: { students: 120, teachers: 9, classes: 6, admins: 2, invoices: 340, payments: 0 },
        },
      },
    });
    renderWithQuery(<AdminPage />);
    const row = (await screen.findByText("Main Campus")).closest("tr");

    fireEvent.click(within(row).getByRole("button", { name: /delete/i }));
    fireEvent.click(within(row).getByRole("button", { name: /delete/i }));

    await waitFor(() => expect(api.toastError).toHaveBeenCalled());
    expect(api.toastError.mock.calls[0][0]).toBe(
      "This branch still has students, staff, admins or fee records. Move or remove them first. (120 students, 9 teachers, 6 classes, 2 admins, 340 fee invoices)",
    );
  });

  it("is only for super admins", () => {
    useAuthStore.setState({ role: "branch_admin" });

    renderWithQuery(<AdminPage />);

    expect(api.getOverview).not.toHaveBeenCalled();
  });
});
