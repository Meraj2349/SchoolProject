import { describe, expect, it } from "@jest/globals";
import {
  DEFAULT_FEE_SETTINGS,
  toBillingPeriod,
  toFeeHead,
  toFeeSettings,
  toFeeStructure,
  toStudentDiscount,
} from "./feeSetup.js";

const code = (c) => expect.objectContaining({ code: c });

describe("toFeeSettings", () => {
  it("fills unsent fields from the current settings", () => {
    expect(toFeeSettings({ late_fine: "50" }, DEFAULT_FEE_SETTINGS)).toEqual({
      due_day: 10,
      late_fine: 50,
      receipt_prefix: "RCT",
    });
  });

  it("accepts a due day from 1 to 28 so every month has it", () => {
    expect(toFeeSettings({ due_day: "28" }, DEFAULT_FEE_SETTINGS).due_day).toBe(28);
    expect(() => toFeeSettings({ due_day: 29 }, DEFAULT_FEE_SETTINGS)).toThrow(code("fee_due_day_invalid"));
    expect(() => toFeeSettings({ due_day: 0 }, DEFAULT_FEE_SETTINGS)).toThrow(code("fee_due_day_invalid"));
  });

  it("rejects a negative late fine", () => {
    expect(() => toFeeSettings({ late_fine: -5 }, DEFAULT_FEE_SETTINGS)).toThrow(code("fee_amount_invalid"));
  });

  it("upper-cases the receipt prefix and allows only letters and digits", () => {
    expect(toFeeSettings({ receipt_prefix: "mn1" }, DEFAULT_FEE_SETTINGS).receipt_prefix).toBe("MN1");
    expect(() => toFeeSettings({ receipt_prefix: "a-b" }, DEFAULT_FEE_SETTINGS)).toThrow(
      code("fee_receipt_prefix_invalid"),
    );
  });
});

describe("toFeeStructure", () => {
  it("returns a class's monthly tuition for a year", () => {
    expect(
      toFeeStructure({ class_name: " Class 5 ", academic_year: "2026", monthly_tuition: "1200" }),
    ).toEqual({ class_name: "Class 5", academic_year: 2026, monthly_tuition: 1200 });
  });

  it("requires a class name and a sensible year", () => {
    expect(() => toFeeStructure({ academic_year: 2026, monthly_tuition: 1 })).toThrow(
      code("fee_class_required"),
    );
    expect(() =>
      toFeeStructure({ class_name: "Class 5", academic_year: 1990, monthly_tuition: 1 }),
    ).toThrow(code("fee_year_invalid"));
  });

  it("rejects an invalid tuition amount", () => {
    expect(() =>
      toFeeStructure({ class_name: "Class 5", academic_year: 2026, monthly_tuition: "x" }),
    ).toThrow(code("fee_amount_invalid"));
  });
});

describe("toFeeHead", () => {
  it("needs at least one name and defaults to active", () => {
    expect(toFeeHead({ name_en: "Exam fee", default_amount: "300" })).toEqual({
      name_en: "Exam fee",
      name_bn: null,
      default_amount: 300,
      active: true,
    });
    expect(() => toFeeHead({ default_amount: 1 })).toThrow(code("fee_head_name_required"));
  });

  it("parses the active flag sent by a form", () => {
    expect(toFeeHead({ name_bn: "পরীক্ষা", default_amount: 0, active: "false" }).active).toBe(false);
  });
});

describe("toStudentDiscount", () => {
  const base = { student_id: "7", kind: "percent", value: "50", reason: "Scholarship" };

  it("returns a normalised discount that applies to tuition by default", () => {
    expect(toStudentDiscount(base)).toEqual({
      student_id: 7,
      kind: "percent",
      value: 50,
      applies_to: "tuition",
      reason: "Scholarship",
      valid_from: null,
      valid_to: null,
    });
  });

  it("requires a student", () => {
    expect(() => toStudentDiscount({ ...base, student_id: undefined })).toThrow(
      code("fee_student_required"),
    );
  });

  it("allows only percent or fixed discounts on tuition or all fees", () => {
    expect(() => toStudentDiscount({ ...base, kind: "bogus" })).toThrow(code("fee_discount_kind_invalid"));
    expect(() => toStudentDiscount({ ...base, applies_to: "bogus" })).toThrow(
      code("fee_discount_kind_invalid"),
    );
  });

  it("rejects a zero discount and a percentage above 100", () => {
    expect(() => toStudentDiscount({ ...base, value: 0 })).toThrow(code("fee_discount_value_invalid"));
    expect(() => toStudentDiscount({ ...base, value: 101 })).toThrow(code("fee_discount_value_invalid"));
    expect(toStudentDiscount({ ...base, kind: "fixed", value: 500 }).value).toBe(500);
  });

  it("validates the dates and their order", () => {
    expect(() => toStudentDiscount({ ...base, valid_from: "2026-13-01" })).toThrow(code("fee_date_invalid"));
    expect(() =>
      toStudentDiscount({ ...base, valid_from: "2026-05-01", valid_to: "2026-04-30" }),
    ).toThrow(code("fee_date_range_invalid"));
    expect(toStudentDiscount({ ...base, valid_from: "2026-01-01", valid_to: "" }).valid_to).toBeNull();
  });
});

describe("toBillingPeriod", () => {
  it("parses a year and month", () => {
    expect(toBillingPeriod({ year: "2026", month: "3" })).toEqual({ year: 2026, month: 3 });
  });

  it("rejects an invalid month or year", () => {
    expect(() => toBillingPeriod({ year: 2026, month: 13 })).toThrow(code("fee_period_invalid"));
    expect(() => toBillingPeriod({ year: "x", month: 1 })).toThrow(code("fee_period_invalid"));
  });
});
