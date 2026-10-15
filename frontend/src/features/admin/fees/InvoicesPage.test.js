import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import InvoicesPage from "./InvoicesPage";

const api = vi.hoisted(() => ({ getInvoices: vi.fn(), getInvoice: vi.fn(), recordPayment: vi.fn() }));
vi.mock("@/services/fees.service", () => ({ feesService: api }));
vi.mock("@/lib/dates", () => ({ localDateString: () => "2026-03-15" }));
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const row = (id, name, status, balance, extra = {}) => ({
  id, student_id: id, student_name: name, roll_number: String(id), class_name: "Class 5", section: "Good",
  year: 2026, month: 3, due_date: "2026-03-10", status, total: 1500, paid: 1500 - balance, balance, ...extra,
});
const invoices = [row(1, "Rahim Uddin", "paid", 0), row(2, "Karima Begum", "partial", 700), row(3, "Tanvir Ahmed", "unpaid", 1500, { class_name: "Class 6" })];

const rowOf = (name) => screen.getByText(name).closest("tr");

describe("Invoices page", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    push.mockReset();
    api.getInvoices.mockResolvedValue({ success: true, data: invoices });
    useLanguageStore.getState().setLanguage("en");
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1 });
  });

  it("lists this month's invoices with amounts and status", async () => {
    renderWithQuery(<InvoicesPage />);

    await screen.findByText("Karima Begum");
    expect(api.getInvoices).toHaveBeenCalledWith({ year: 2026, month: 3 });
    expect(within(rowOf("Karima Begum")).getByText("৳700.00")).toBeInTheDocument();
    expect(within(rowOf("Karima Begum")).getByText("Overdue")).toBeInTheDocument();
    expect(within(rowOf("Rahim Uddin")).getByText("Paid")).toBeInTheDocument();
  });

  it("asks the server for another month and status", async () => {
    renderWithQuery(<InvoicesPage />);
    await screen.findByText("Karima Begum");

    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "unpaid" } });

    await waitFor(() => expect(api.getInvoices).toHaveBeenLastCalledWith({ year: 2026, month: 2, status: "unpaid" }));
  });

  it("filters by class", async () => {
    renderWithQuery(<InvoicesPage />);
    await screen.findByText("Karima Begum");

    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "Class 6" } });

    expect(screen.getByText("Tanvir Ahmed")).toBeInTheDocument();
    expect(screen.queryByText("Karima Begum")).not.toBeInTheDocument();
  });

  it("clears the class filter when moving to another month", async () => {
    renderWithQuery(<InvoicesPage />);
    await screen.findByText("Karima Begum");
    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "Class 6" } });

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));

    expect(screen.getByLabelText("Class")).toHaveValue("");
    expect(await screen.findByText("Karima Begum")).toBeInTheDocument();
  });

  it("only offers to collect on invoices that still owe money", async () => {
    renderWithQuery(<InvoicesPage />);
    await screen.findByText("Karima Begum");

    expect(within(rowOf("Rahim Uddin")).queryByRole("button", { name: "Collect" })).not.toBeInTheDocument();
    expect(within(rowOf("Karima Begum")).getByRole("button", { name: "Collect" })).toBeInTheDocument();
  });

  it("takes a payment and offers to print the receipt", async () => {
    const detail = { ...invoices[1], items: [{ id: 1, kind: "tuition", label: "Tuition", amount: "1500.00" }], payments: [] };
    api.getInvoice.mockResolvedValue({ success: true, data: detail });
    api.recordPayment.mockResolvedValue({ success: true, data: { payment: { id: 9, receipt_no: "MC-2026-00009" }, invoice: detail } });
    renderWithQuery(<InvoicesPage />);
    await screen.findByText("Karima Begum");

    fireEvent.click(within(rowOf("Karima Begum")).getByRole("button", { name: "Collect" }));
    const drawer = await screen.findByRole("dialog", { name: "Collect payment" });
    await waitFor(() => expect(within(drawer).getByLabelText("Amount", { exact: false })).toHaveValue("700"));
    fireEvent.click(within(drawer).getByRole("button", { name: "Record payment" }));

    const done = await screen.findByRole("dialog", { name: "Payment recorded — receipt MC-2026-00009" });
    fireEvent.click(within(done).getByRole("button", { name: "Print receipt" }));
    expect(push).toHaveBeenCalledWith("/admin/fees/receipt/9");
  });

  it("lets a super admin on all branches look but not collect", async () => {
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: null });
    renderWithQuery(<InvoicesPage />);
    await screen.findByText("Karima Begum");

    expect(screen.getByRole("note")).toHaveTextContent("Choose a branch");
    expect(screen.queryByRole("button", { name: "Collect" })).not.toBeInTheDocument();
  });
});
