import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import PaymentDrawer from "./PaymentDrawer";

const api = vi.hoisted(() => ({ getInvoice: vi.fn(), recordPayment: vi.fn() }));
vi.mock("@/services/fees.service", () => ({ feesService: api }));
vi.mock("@/lib/dates", () => ({ localDateString: () => "2026-03-15" }));

const invoice = {
  id: 42,
  student_name: "Rahim Uddin",
  class_name: "Class 5",
  section: "Good",
  year: 2026,
  month: 3,
  due_date: "2026-03-10",
  items: [
    { id: 1, kind: "tuition", label: "Tuition", amount: "1500.00" },
    { id: 2, kind: "discount", label: "Discount: Sibling", amount: "-300.00" },
  ],
  payments: [],
  total: 1200,
  paid: 200,
  balance: 1000,
  late_fine_pending: 0,
};

const setup = () => {
  const onPaid = vi.fn();
  const onClose = vi.fn();
  renderWithQuery(<PaymentDrawer invoiceId={42} onPaid={onPaid} onClose={onClose} />);
  return { onPaid, onClose };
};

const amountInput = () => screen.getByLabelText("Amount", { exact: false });

describe("PaymentDrawer", () => {
  beforeEach(() => {
    api.getInvoice.mockReset().mockResolvedValue({ success: true, data: invoice });
    api.recordPayment.mockReset();
    useLanguageStore.getState().setLanguage("en");
  });

  it("shows what the invoice is for and what is still owed", async () => {
    setup();

    const dialog = await screen.findByRole("dialog", { name: "Collect payment" });
    await within(dialog).findByText("Discount: Sibling");
    expect(dialog).toHaveTextContent("Rahim Uddin");
    expect(dialog).toHaveTextContent("March 2026");
    expect(within(dialog).getByText("-৳300.00")).toBeInTheDocument();
    expect(within(dialog).getByText("৳1,000.00")).toBeInTheDocument();
  });

  it("suggests the full balance in cash today", async () => {
    setup();

    await waitFor(() => expect(amountInput()).toHaveValue("1000"));
    expect(screen.getByLabelText("Method", { exact: false })).toHaveValue("cash");
    expect(screen.getByLabelText("Date", { exact: false })).toHaveValue("2026-03-15");
  });

  it("does not send more than the balance", async () => {
    setup();
    await waitFor(() => expect(amountInput()).toHaveValue("1000"));

    fireEvent.change(amountInput(), { target: { value: "1200" } });
    fireEvent.click(screen.getByRole("button", { name: "Record payment" }));

    expect(screen.getByText("More than the balance due")).toBeInTheDocument();
    expect(api.recordPayment).not.toHaveBeenCalled();
  });

  it("adds the late fine the server will charge when paying after the due date", async () => {
    api.getInvoice.mockResolvedValue({ success: true, data: { ...invoice, late_fine_pending: 50 } });
    api.recordPayment.mockResolvedValue({ success: true, data: { payment: { id: 9 }, invoice } });
    const { onPaid } = setup();

    await waitFor(() => expect(amountInput()).toHaveValue("1050"));
    const fineLine = screen.getByText("Late fine (paid after the due date)").closest("tr");
    expect(fineLine).toHaveTextContent("৳50.00");
    expect(screen.getByText("Amount due").closest("tr")).toHaveTextContent("৳1,050.00");

    fireEvent.click(screen.getByRole("button", { name: "Record payment" }));
    await waitFor(() => expect(onPaid).toHaveBeenCalled());
    expect(api.recordPayment.mock.calls[0][1]).toMatchObject({ amount: "1050" });
  });

  it("drops the late fine when the payment is dated by the due date", async () => {
    api.getInvoice.mockResolvedValue({ success: true, data: { ...invoice, late_fine_pending: 50 } });
    setup();
    await waitFor(() => expect(amountInput()).toHaveValue("1050"));

    fireEvent.change(screen.getByLabelText("Date", { exact: false }), { target: { value: "2026-03-09" } });

    expect(screen.queryByText("Late fine (paid after the due date)")).not.toBeInTheDocument();
  });

  it("records a partial payment and hands back the receipt", async () => {
    const result = { payment: { id: 9, receipt_no: "MC-2026-00009" }, invoice: { ...invoice, status: "partial" } };
    api.recordPayment.mockResolvedValue({ success: true, data: result });
    const { onPaid } = setup();
    await waitFor(() => expect(amountInput()).toHaveValue("1000"));

    fireEvent.change(amountInput(), { target: { value: "400" } });
    fireEvent.change(screen.getByLabelText("Method", { exact: false }), { target: { value: "bkash" } });
    fireEvent.change(screen.getByLabelText("Note", { exact: false }), { target: { value: "Trx 8AB12" } });
    fireEvent.click(screen.getByRole("button", { name: "Record payment" }));

    await waitFor(() => expect(onPaid).toHaveBeenCalledWith(result));
    expect(api.recordPayment).toHaveBeenCalledWith(42, { amount: "400", method: "bkash", paid_on: "2026-03-15", note: "Trx 8AB12" });
  });

  it("shows the server's reason when the payment is refused", async () => {
    api.recordPayment.mockRejectedValue({ response: { data: { message: "The amount is more than the balance due." } } });
    setup();
    await waitFor(() => expect(amountInput()).toHaveValue("1000"));

    fireEvent.click(screen.getByRole("button", { name: "Record payment" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The amount is more than the balance due.");
  });
});
