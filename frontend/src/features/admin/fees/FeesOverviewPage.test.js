import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import FeesOverviewPage from "./FeesOverviewPage";

const api = vi.hoisted(() => ({
  getSummary: vi.fn(),
  getStructures: vi.fn(),
  getHeads: vi.fn(),
  generateInvoices: vi.fn(),
  applyLateFines: vi.fn(),
}));
vi.mock("@/services/fees.service", () => ({ feesService: api }));
vi.mock("@/lib/dates", () => ({ localDateString: () => "2026-03-15" }));
const toasts = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: toasts, ToastContainer: () => null }));

const summary = {
  year: 2026, month: 3, invoices: 3, billed: 4500, collected: 2300, outstanding: 2200, overdue: 2,
  by_class: [
    { class_name: "Class 5", invoices: 2, billed: 3000, collected: 2300, outstanding: 700 },
    { class_name: "Class 6", invoices: 1, billed: 1500, collected: 0, outstanding: 1500 },
  ],
};

describe("Fees overview page", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    Object.values(toasts).forEach((fn) => fn.mockReset());
    api.getSummary.mockResolvedValue({ success: true, data: summary });
    api.getStructures.mockResolvedValue({ success: true, data: [
      { id: 1, class_name: "Class 5", academic_year: 2026, monthly_tuition: "1500.00" },
      { id: 2, class_name: "Class 6", academic_year: 2026, monthly_tuition: "1500.00" },
    ] });
    api.getHeads.mockResolvedValue({ success: true, data: [
      { id: 4, name_en: "Exam fee", default_amount: "300.00", active: 1 },
      { id: 5, name_en: "Old bus fee", default_amount: "500.00", active: 0 },
    ] });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1 });
  });

  it("shows the month's totals and collection by class", async () => {
    renderWithQuery(<FeesOverviewPage />);

    expect(await screen.findByText("৳4,500.00")).toBeInTheDocument();
    expect(api.getSummary).toHaveBeenCalledWith({ year: 2026, month: 3 });
    const byClass = screen.getByRole("region", { name: "Collection by class" });
    const class5 = within(byClass).getByText("Class 5").closest("tr");
    expect(within(class5).getByText("76.7%")).toBeInTheDocument();
  });

  it("generates invoices for chosen classes with an extra fee", async () => {
    api.generateInvoices.mockResolvedValue({ success: true, data: { created: 2, already_invoiced: 1, without_fees: 0 } });
    renderWithQuery(<FeesOverviewPage />);
    await screen.findByText("৳4,500.00");

    fireEvent.click(screen.getByRole("button", { name: "Generate invoices" }));
    const drawer = await screen.findByRole("dialog", { name: "Generate invoices for March 2026" });
    fireEvent.click(await within(drawer).findByRole("checkbox", { name: "All classes" }));
    fireEvent.click(within(drawer).getByRole("checkbox", { name: "Class 6" }));
    fireEvent.click(within(drawer).getByRole("checkbox", { name: "Exam fee" }));
    fireEvent.change(within(drawer).getByLabelText("Exam fee Amount"), { target: { value: "250" } });
    expect(within(drawer).queryByRole("checkbox", { name: "Old bus fee" })).not.toBeInTheDocument();
    fireEvent.click(within(drawer).getByRole("button", { name: "Generate invoices" }));

    await waitFor(() =>
      expect(api.generateInvoices).toHaveBeenCalledWith({
        year: 2026,
        month: 3,
        class_names: ["Class 6"],
        extras: [{ head_id: 4, amount: "250" }],
      }),
    );
    expect(toasts.success).toHaveBeenCalledWith("Created 2, already invoiced 1, no fee set 0.");
  });

  it("bills all classes by default", async () => {
    api.generateInvoices.mockResolvedValue({ success: true, data: { created: 3, already_invoiced: 0, without_fees: 0 } });
    renderWithQuery(<FeesOverviewPage />);
    await screen.findByText("৳4,500.00");

    fireEvent.click(screen.getByRole("button", { name: "Generate invoices" }));
    const drawer = await screen.findByRole("dialog", { name: "Generate invoices for March 2026" });
    fireEvent.click(within(drawer).getByRole("button", { name: "Generate invoices" }));

    await waitFor(() => expect(api.generateInvoices).toHaveBeenCalledWith({ year: 2026, month: 3, extras: [] }));
  });

  it("applies late fines after confirming", async () => {
    api.applyLateFines.mockResolvedValue({ success: true, data: { fined: 2 } });
    renderWithQuery(<FeesOverviewPage />);
    await screen.findByText("৳4,500.00");

    fireEvent.click(screen.getByRole("button", { name: "Apply late fines" }));
    const dialog = screen.getByRole("dialog", { name: "Apply late fines for March 2026?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Apply late fines" }));

    await waitFor(() => expect(api.applyLateFines).toHaveBeenCalledWith({ year: 2026, month: 3 }));
    expect(toasts.success).toHaveBeenCalledWith("Late fine added to 2 invoices.");
  });

  it("shows the server's message when generating fails", async () => {
    api.generateInvoices.mockRejectedValue({ response: { data: { message: "Choose a branch first." } } });
    renderWithQuery(<FeesOverviewPage />);
    await screen.findByText("৳4,500.00");

    fireEvent.click(screen.getByRole("button", { name: "Generate invoices" }));
    const drawer = await screen.findByRole("dialog", { name: "Generate invoices for March 2026" });
    fireEvent.click(within(drawer).getByRole("button", { name: "Generate invoices" }));

    expect(await within(drawer).findByRole("alert")).toHaveTextContent("Choose a branch first.");
  });

  it("hides the actions from a super admin on all branches", async () => {
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null });
    renderWithQuery(<FeesOverviewPage />);
    await screen.findByText("৳4,500.00");

    expect(screen.getByRole("note")).toHaveTextContent("Choose a branch");
    expect(screen.queryByRole("button", { name: "Generate invoices" })).not.toBeInTheDocument();
  });
});
