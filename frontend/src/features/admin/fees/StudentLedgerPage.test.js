import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import StudentLedgerPage from "./StudentLedgerPage";

const api = vi.hoisted(() => ({
  getLedger: vi.fn(),
  voidPayment: vi.fn(),
  createDiscount: vi.fn(),
  deleteDiscount: vi.fn(),
  getInvoice: vi.fn(),
}));
vi.mock("@/services/fees.service", () => ({ feesService: api }));
vi.mock("@/lib/dates", () => ({ localDateString: () => "2026-03-15" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() }, ToastContainer: () => null }));

const ledger = {
  student: { id: 1, name: "Rahim Uddin", roll_number: "1", class_name: "Class 5", section: "Good" },
  totals: { total: 3000, paid: 1900, balance: 1100 },
  invoices: [
    { id: 11, year: 2026, month: 2, due_date: "2026-02-10", status: "paid", total: 1500, paid: 1500, balance: 0 },
    { id: 12, year: 2026, month: 3, due_date: "2026-03-10", status: "partial", total: 1500, paid: 400, balance: 1100 },
  ],
  payments: [
    { id: 21, invoice_id: 11, year: 2026, month: 2, receipt_no: "MC-2026-00001", amount: "1500.00", method: "cash", paid_on: "2026-02-05", voided_at: null },
    { id: 22, invoice_id: 12, year: 2026, month: 3, receipt_no: "MC-2026-00002", amount: "400.00", method: "bkash", paid_on: "2026-03-05", voided_at: null },
    { id: 23, invoice_id: 12, year: 2026, month: 3, receipt_no: "MC-2026-00003", amount: "100.00", method: "cash", paid_on: "2026-03-06", voided_at: "2026-03-06 10:00:00", void_reason: "Typed twice" },
  ],
  discounts: [{ id: 31, student_id: 1, kind: "percent", value: "50.00", applies_to: "tuition", reason: "Sibling", valid_from: null, valid_to: null }],
};

const rowWith = (text) => screen.getByText(text).closest("tr");

describe("Student fee ledger", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.getLedger.mockResolvedValue({ success: true, data: ledger });
    api.voidPayment.mockResolvedValue({ success: true });
    api.createDiscount.mockResolvedValue({ success: true });
    api.deleteDiscount.mockResolvedValue({ success: true });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1 });
  });

  it("shows the student, totals, invoices and payments", async () => {
    renderWithQuery(<StudentLedgerPage studentId="1" />);

    expect(await screen.findByRole("heading", { name: "Rahim Uddin" })).toBeInTheDocument();
    expect(api.getLedger).toHaveBeenCalledWith("1");
    expect(screen.getAllByText("৳1,100.00").length).toBeGreaterThan(0);
    const invoices = screen.getByRole("region", { name: "Invoices" });
    expect(within(within(invoices).getByText("March 2026").closest("tr")).getByText("Overdue")).toBeInTheDocument();
    expect(within(rowWith("MC-2026-00002")).getByRole("link", { name: "MC-2026-00002" })).toHaveAttribute("href", "/admin/fees/receipt/22");
  });

  it("marks voided payments and does not let them be voided again", async () => {
    renderWithQuery(<StudentLedgerPage studentId="1" />);
    await screen.findByText("MC-2026-00003");

    const voided = rowWith("MC-2026-00003");
    expect(within(voided).getByText("Voided")).toBeInTheDocument();
    expect(within(voided).queryByRole("button", { name: "Void" })).not.toBeInTheDocument();
  });

  it("voids a payment only with a reason", async () => {
    renderWithQuery(<StudentLedgerPage studentId="1" />);
    await screen.findByText("MC-2026-00002");

    fireEvent.click(within(rowWith("MC-2026-00002")).getByRole("button", { name: "Void" }));
    const dialog = screen.getByRole("dialog", { name: "Void this payment?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Void" }));
    expect(within(dialog).getByText("Give a reason")).toBeInTheDocument();
    expect(api.voidPayment).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText("Reason", { exact: false }), { target: { value: "Entered twice" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Void" }));

    await waitFor(() => expect(api.voidPayment).toHaveBeenCalledWith(22, "Entered twice"));
  });

  it("lists discounts and adds one", async () => {
    renderWithQuery(<StudentLedgerPage studentId="1" />);
    const discounts = await screen.findByRole("region", { name: "Discounts" });
    expect(within(discounts).getByText("Sibling")).toBeInTheDocument();
    expect(within(discounts).getByText("50%")).toBeInTheDocument();

    fireEvent.click(within(discounts).getByRole("button", { name: "Add discount" }));
    const drawer = screen.getByRole("dialog", { name: "Add discount" });
    fireEvent.change(within(drawer).getByLabelText("Type", { exact: false }), { target: { value: "fixed" } });
    fireEvent.change(within(drawer).getByLabelText("Value", { exact: false }), { target: { value: "200" } });
    fireEvent.change(within(drawer).getByLabelText("Applies to", { exact: false }), { target: { value: "all" } });
    fireEvent.change(within(drawer).getByLabelText("Reason", { exact: false }), { target: { value: "Merit" } });
    fireEvent.click(within(drawer).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(api.createDiscount).toHaveBeenCalledWith({
        student_id: 1, kind: "fixed", value: "200", applies_to: "all", reason: "Merit", valid_from: "", valid_to: "",
      }),
    );
  });

  it("removes a discount after confirming", async () => {
    renderWithQuery(<StudentLedgerPage studentId="1" />);
    const discounts = await screen.findByRole("region", { name: "Discounts" });

    fireEvent.click(within(discounts).getByRole("button", { name: "Remove" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Remove this discount?" })).getByRole("button", { name: "Remove" }));

    await waitFor(() => expect(api.deleteDiscount).toHaveBeenCalledWith(31));
  });
});
