import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/store/languageStore";
import { renderWithQuery } from "@/test-utils";
import ReceiptPage from "./ReceiptPage";

const api = vi.hoisted(() => ({ getReceipt: vi.fn() }));
vi.mock("@/services/fees.service", () => ({ feesService: api }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));

const receipt = {
  payment: { id: 9, receipt_no: "MC-2026-00009", amount: "400.00", method: "bkash", paid_on: "2026-03-15", note: "Trx 8AB12", voided_at: null },
  invoice: {
    id: 12, student_name: "Rahim Uddin", roll_number: "1", class_name: "Class 5", section: "Good", year: 2026, month: 3,
    branch_name_en: "Main Campus", branch_name_bn: "প্রধান ক্যাম্পাস",
    items: [{ id: 1, kind: "tuition", label: "Tuition", amount: "1500.00" }, { id: 2, kind: "late_fine", label: "Late fine", amount: "50.00" }],
    payments: [], total: 1550, paid: 1150, balance: 400,
  },
};

describe("Receipt page", () => {
  beforeEach(() => {
    api.getReceipt.mockReset().mockResolvedValue({ success: true, data: receipt });
    useLanguageStore.getState().setLanguage("en");
  });

  it("shows everything a parent needs on the receipt", async () => {
    renderWithQuery(<ReceiptPage paymentId="9" />);

    expect(await screen.findByText("MC-2026-00009")).toBeInTheDocument();
    expect(api.getReceipt).toHaveBeenCalledWith("9");
    for (const text of ["Main Campus", "Rahim Uddin", "Class 5 Good", "March 2026", "bKash", "2026-03-15", "Late fine", "Trx 8AB12"]) {
      expect(screen.getByText(text, { exact: false })).toBeInTheDocument();
    }
    expect(screen.getByText("Amount paid").closest("tr")).toHaveTextContent("৳400.00");
    expect(screen.getByText("Balance due").closest("tr")).toHaveTextContent("৳400.00");
  });

  it("prints", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    renderWithQuery(<ReceiptPage paymentId="9" />);
    await screen.findByText("MC-2026-00009");

    fireEvent.click(screen.getByRole("button", { name: "Print" }));

    expect(print).toHaveBeenCalled();
  });

  it("is clearly marked when the payment was voided", async () => {
    api.getReceipt.mockResolvedValue({ success: true, data: { ...receipt, payment: { ...receipt.payment, voided_at: "2026-03-16 09:00:00", void_reason: "Typed twice" } } });
    renderWithQuery(<ReceiptPage paymentId="9" />);

    expect(await screen.findByText("VOIDED")).toBeInTheDocument();
    expect(screen.getByText("Typed twice", { exact: false })).toBeInTheDocument();
  });
});
