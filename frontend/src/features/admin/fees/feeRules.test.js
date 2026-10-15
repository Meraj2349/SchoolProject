import { describe, expect, it } from "vitest";
import {
  PAYMENT_METHODS,
  amountDue,
  collectionRate,
  discountText,
  monthName,
  paymentDefaults,
  periodLabel,
  shiftPeriod,
  statusBadge,
  validatePayment,
  yearOptions,
} from "./feeRules";

describe("months and periods", () => {
  it("names months in English and Bangla", () => {
    expect(monthName(1, "en")).toBe("January");
    expect(monthName(12, "bn")).toBe("ডিসেম্বর");
  });

  it("labels a billing period", () => {
    expect(periodLabel({ year: 2026, month: 3 }, "en")).toBe("March 2026");
  });

  it("moves between months across year ends", () => {
    expect(shiftPeriod({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftPeriod({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("offers a few years around the current one", () => {
    expect(yearOptions(2026)).toEqual([2024, 2025, 2026, 2027]);
  });
});

describe("statusBadge", () => {
  it("maps invoice statuses to badge tones and labels", () => {
    expect(statusBadge("paid")).toEqual({ tone: "success", key: "statusPaid" });
    expect(statusBadge("partial")).toEqual({ tone: "warning", key: "statusPartial" });
    expect(statusBadge("unpaid")).toEqual({ tone: "danger", key: "statusUnpaid" });
  });

  it("marks an unpaid invoice past its due date as overdue", () => {
    expect(statusBadge("unpaid", { dueDate: "2026-03-10", today: "2026-03-11" })).toEqual({ tone: "danger", key: "statusOverdue" });
    expect(statusBadge("paid", { dueDate: "2026-03-10", today: "2026-03-11" }).key).toBe("statusPaid");
  });
});

describe("amountDue", () => {
  const invoice = { balance: 1000, due_date: "2026-03-10", late_fine_pending: 50 };

  it("is the balance when paid by the due date", () => {
    expect(amountDue(invoice, "2026-03-10")).toBe(1000);
  });

  it("adds the late fine the server will charge when paid after the due date", () => {
    expect(amountDue(invoice, "2026-03-11")).toBe(1050);
  });

  it("does not add a fine that was already charged or when nothing is owed", () => {
    expect(amountDue({ ...invoice, late_fine_pending: 0 }, "2026-03-20")).toBe(1000);
    expect(amountDue({ ...invoice, balance: 0 }, "2026-03-20")).toBe(0);
  });
});

describe("paymentDefaults", () => {
  it("suggests paying the full balance in cash today", () => {
    expect(paymentDefaults({ balance: 1500, due_date: "2026-03-20", late_fine_pending: 50 }, "2026-03-15")).toEqual({
      amount: "1500",
      method: "cash",
      paid_on: "2026-03-15",
      note: "",
    });
  });

  it("includes the late fine when today is past the due date", () => {
    expect(paymentDefaults({ balance: 1500, due_date: "2026-03-10", late_fine_pending: 50 }, "2026-03-15").amount).toBe("1550");
  });
});

describe("validatePayment", () => {
  const ok = { amount: "500", method: "cash", paid_on: "2026-03-15", note: "" };
  const context = { invoice: { balance: 1500, due_date: "2026-03-31", late_fine_pending: 50 }, today: "2026-03-15" };

  it("accepts a partial payment", () => {
    expect(validatePayment(ok, context)).toEqual({});
  });

  it("accepts paying exactly the balance", () => {
    expect(validatePayment({ ...ok, amount: "1500.00" }, context)).toEqual({});
  });

  it.each([["0"], ["-5"], ["abc"], ["10.555"], [""]])("rejects the amount %j", (amount) => {
    expect(validatePayment({ ...ok, amount }, context)).toEqual({ amount: "amountInvalid" });
  });

  it("rejects more than the balance", () => {
    expect(validatePayment({ ...ok, amount: "1500.01" }, context)).toEqual({ amount: "amountTooHigh" });
  });

  it("allows the late fine on top when the payment date is after the due date", () => {
    const late = { ...context, invoice: { ...context.invoice, due_date: "2026-03-10" } };

    expect(validatePayment({ ...ok, amount: "1550" }, late)).toEqual({});
    expect(validatePayment({ ...ok, amount: "1550.01" }, late)).toEqual({ amount: "amountTooHigh" });
  });

  it("rejects a future date and an unknown method", () => {
    expect(validatePayment({ ...ok, paid_on: "2026-03-16", method: "card" }, context)).toEqual({
      paid_on: "dateFuture",
      method: "required",
    });
  });

  it("knows the methods the server accepts", () => {
    expect(PAYMENT_METHODS).toEqual(["cash", "bkash", "nagad", "bank", "other"]);
  });
});

describe("discountText", () => {
  it("describes percent and fixed discounts", () => {
    expect(discountText({ kind: "percent", value: "50.00", applies_to: "tuition" })).toEqual({ amount: "50%", scope: "tuition" });
    expect(discountText({ kind: "fixed", value: "300.00", applies_to: "all" })).toEqual({ amount: 300, scope: "all" });
  });
});

describe("collectionRate", () => {
  it("is the collected share of the billed amount, one decimal", () => {
    expect(collectionRate({ billed: 3000, collected: 2300 })).toBe(76.7);
  });

  it("is null when nothing was billed", () => {
    expect(collectionRate({ billed: 0, collected: 0 })).toBeNull();
  });
});
