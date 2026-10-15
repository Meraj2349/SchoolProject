import { describe, expect, it } from "@jest/globals";
import {
  buildInvoiceItems,
  discountAppliesIn,
  dueDateOf,
  invoiceStatus,
  invoiceTotals,
} from "./invoice.js";

const march = { year: 2026, month: 3 };
const discount = (overrides) => ({
  kind: "percent",
  value: 50,
  applies_to: "tuition",
  reason: "Scholarship",
  valid_from: null,
  valid_to: null,
  ...overrides,
});

describe("buildInvoiceItems", () => {
  it("bills tuition and each extra fee", () => {
    expect(
      buildInvoiceItems({ tuition: 1200, extras: [{ label: "Exam fee", amount: 300 }], discounts: [] }),
    ).toEqual([
      { kind: "tuition", label: "Tuition", amount: 1200 },
      { kind: "extra", label: "Exam fee", amount: 300 },
    ]);
  });

  it("leaves out a zero tuition", () => {
    expect(buildInvoiceItems({ tuition: 0, extras: [], discounts: [] })).toEqual([]);
  });

  it("applies a percentage discount to tuition only by default, as a negative item", () => {
    const items = buildInvoiceItems({
      tuition: 1000,
      extras: [{ label: "Exam fee", amount: 300 }],
      discounts: [discount()],
    });

    expect(items).toContainEqual({ kind: "discount", label: "Discount: Scholarship", amount: -500 });
  });

  it("applies a discount on all fees to tuition plus extras", () => {
    const items = buildInvoiceItems({
      tuition: 1000,
      extras: [{ label: "Exam fee", amount: 300 }],
      discounts: [discount({ applies_to: "all", value: 10 })],
    });

    expect(items.at(-1).amount).toBe(-130);
  });

  it("rounds a percentage discount to the poisha", () => {
    const items = buildInvoiceItems({ tuition: 333.33, extras: [], discounts: [discount({ value: 33 })] });

    expect(items.at(-1).amount).toBe(-110);
  });

  it("never discounts more than what is billed, so a full waiver makes the invoice zero", () => {
    const items = buildInvoiceItems({
      tuition: 1000,
      extras: [],
      discounts: [discount({ kind: "fixed", value: 800 }), discount({ kind: "fixed", value: 800, reason: null })],
    });

    expect(items.map((i) => i.amount)).toEqual([1000, -800, -200]);
    expect(items.at(-1).label).toBe("Discount");
  });

  it("skips a discount that has nothing left to discount", () => {
    const items = buildInvoiceItems({
      tuition: 1000,
      extras: [],
      discounts: [discount({ value: 100 }), discount({ kind: "fixed", value: 50 })],
    });

    expect(items).toHaveLength(2);
  });
});

describe("discountAppliesIn", () => {
  it("applies an open-ended discount to every month", () => {
    expect(discountAppliesIn(discount(), march)).toBe(true);
  });

  it("applies when the discount overlaps any part of the month", () => {
    expect(discountAppliesIn(discount({ valid_from: "2026-03-31" }), march)).toBe(true);
    expect(discountAppliesIn(discount({ valid_to: "2026-03-01" }), march)).toBe(true);
  });

  it("does not apply before it starts or after it ends", () => {
    expect(discountAppliesIn(discount({ valid_from: "2026-04-01" }), march)).toBe(false);
    expect(discountAppliesIn(discount({ valid_to: "2026-02-28" }), march)).toBe(false);
  });
});

describe("invoiceTotals", () => {
  const items = [{ amount: 1000 }, { amount: 300 }, { amount: -500 }];

  it("sums items and payments and gives the balance", () => {
    expect(invoiceTotals(items, [{ amount: 300 }, { amount: "100.50" }])).toEqual({
      total: 800,
      paid: 400.5,
      balance: 399.5,
    });
  });

  it("ignores voided payments", () => {
    expect(invoiceTotals(items, [{ amount: 800, voided_at: "2026-03-05 10:00:00" }]).balance).toBe(800);
  });
});

describe("invoiceStatus", () => {
  it("is unpaid, partial or paid depending on what was paid", () => {
    expect(invoiceStatus({ total: 800, paid: 0 })).toBe("unpaid");
    expect(invoiceStatus({ total: 800, paid: 300 })).toBe("partial");
    expect(invoiceStatus({ total: 800, paid: 800 })).toBe("paid");
  });

  it("treats a fully waived (zero) invoice as paid", () => {
    expect(invoiceStatus({ total: 0, paid: 0 })).toBe("paid");
  });
});

describe("dueDateOf", () => {
  it("is the due day of the billed month", () => {
    expect(dueDateOf(march, 10)).toBe("2026-03-10");
  });
});
