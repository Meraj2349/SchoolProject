import { describe, expect, it } from "@jest/globals";
import { formatReceiptNo, lateFineDue, toPayment, toVoid, validatePaymentAmount } from "./payment.js";

const code = (c) => expect.objectContaining({ code: c });

describe("lateFineDue", () => {
  const unpaidAfterDue = {
    dueDate: "2026-03-10",
    onDate: "2026-03-11",
    balance: 500,
    hasLateFine: false,
    lateFine: 50,
  };

  it("charges the late fine when money is still owed after the due date", () => {
    expect(lateFineDue(unpaidAfterDue)).toBe(50);
  });

  it("charges nothing on or before the due date", () => {
    expect(lateFineDue({ ...unpaidAfterDue, onDate: "2026-03-10" })).toBe(0);
  });

  it("charges nothing when the invoice is settled, already fined, or no fine is set", () => {
    expect(lateFineDue({ ...unpaidAfterDue, balance: 0 })).toBe(0);
    expect(lateFineDue({ ...unpaidAfterDue, hasLateFine: true })).toBe(0);
    expect(lateFineDue({ ...unpaidAfterDue, lateFine: 0 })).toBe(0);
  });
});

describe("toPayment", () => {
  const today = "2026-03-15";

  it("returns a normalised payment and defaults the date to today", () => {
    expect(toPayment({ amount: "500", method: "bkash", note: " ref 123 " }, today)).toEqual({
      amount: 500,
      method: "bkash",
      paid_on: today,
      note: "ref 123",
    });
  });

  it("rejects an unknown method", () => {
    expect(() => toPayment({ amount: 1, method: "card" }, today)).toThrow(code("fee_payment_method_invalid"));
  });

  it("rejects a zero amount", () => {
    expect(() => toPayment({ amount: 0, method: "cash" }, today)).toThrow(code("fee_payment_amount_invalid"));
  });

  it("rejects an invalid or future payment date", () => {
    expect(() => toPayment({ amount: 1, method: "cash", paid_on: "2026-02-30" }, today)).toThrow(
      code("fee_date_invalid"),
    );
    expect(() => toPayment({ amount: 1, method: "cash", paid_on: "2026-03-16" }, today)).toThrow(
      code("fee_payment_date_future"),
    );
  });
});

describe("validatePaymentAmount", () => {
  it("allows a partial or exact payment", () => {
    expect(() => validatePaymentAmount({ amount: 100, balance: 300 })).not.toThrow();
    expect(() => validatePaymentAmount({ amount: 300, balance: 300 })).not.toThrow();
  });

  it("rejects paying more than the balance", () => {
    expect(() => validatePaymentAmount({ amount: 300.01, balance: 300 })).toThrow(
      code("fee_payment_exceeds_balance"),
    );
  });
});

describe("toVoid", () => {
  it("requires a reason", () => {
    expect(toVoid({ reason: " Wrong student " })).toEqual({ reason: "Wrong student" });
    expect(() => toVoid({ reason: "  " })).toThrow(code("fee_void_reason_required"));
  });
});

describe("formatReceiptNo", () => {
  it("combines prefix, year and a zero-padded sequence", () => {
    expect(formatReceiptNo({ prefix: "RCT", year: 2026, seq: 42 })).toBe("RCT-2026-00042");
  });
});
