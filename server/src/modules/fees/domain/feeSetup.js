import { ValidationError } from "../../../shared/errors/index.js";
import { isDate } from "./dates.js";
import { parseAmount } from "./money.js";

// Validation and normalisation of what an admin configures: settings, class
// tuition, extra fee heads and per-student discounts.

export const DEFAULT_FEE_SETTINGS = Object.freeze({ due_day: 10, late_fine: 0, receipt_prefix: "RCT" });

export const DISCOUNT_KINDS = ["percent", "fixed"];
export const DISCOUNT_SCOPES = ["tuition", "all"];

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
const MAX_DUE_DAY = 28; // exists in every month
const RECEIPT_PREFIX_PATTERN = /^[A-Z0-9]{1,10}$/;

const text = (value) => (value == null ? "" : String(value).trim());
const orNull = (value) => text(value) || null;
const parseBoolean = (value) => value === true || value === "true" || value === 1 || value === "1";

function parseInteger(value, { min, max }, errorCode) {
  const n = Number(value);
  if (text(value) === "" || !Number.isInteger(n) || n < min || n > max) {
    throw new ValidationError(errorCode);
  }
  return n;
}

function parseOptionalDate(value) {
  if (!text(value)) return null;
  if (!isDate(text(value))) throw new ValidationError("fee_date_invalid");
  return text(value);
}

export const parseYear = (value, errorCode = "fee_year_invalid") =>
  parseInteger(value, { min: MIN_YEAR, max: MAX_YEAR }, errorCode);

export const parseMonth = (value) => parseInteger(value, { min: 1, max: 12 }, "fee_period_invalid");

export const parseId = (value, errorCode) =>
  parseInteger(value, { min: 1, max: Number.MAX_SAFE_INTEGER }, errorCode);

export function toFeeSettings(input, current) {
  const merged = { ...current, ...input };
  const prefix = text(merged.receipt_prefix).toUpperCase();
  if (!RECEIPT_PREFIX_PATTERN.test(prefix)) throw new ValidationError("fee_receipt_prefix_invalid");
  return {
    due_day: parseInteger(merged.due_day, { min: 1, max: MAX_DUE_DAY }, "fee_due_day_invalid"),
    late_fine: parseAmount(merged.late_fine, "fee_amount_invalid"),
    receipt_prefix: prefix,
  };
}

export function toFeeStructure(input) {
  const className = text(input.class_name);
  if (!className) throw new ValidationError("fee_class_required");
  return {
    class_name: className,
    academic_year: parseYear(input.academic_year),
    monthly_tuition: parseAmount(input.monthly_tuition, "fee_amount_invalid"),
  };
}

export function toFeeHead(input) {
  const head = { name_en: orNull(input.name_en), name_bn: orNull(input.name_bn) };
  if (!head.name_en && !head.name_bn) throw new ValidationError("fee_head_name_required");
  return {
    ...head,
    default_amount: parseAmount(input.default_amount, "fee_amount_invalid"),
    active: input.active === undefined ? true : parseBoolean(input.active),
  };
}

function parseDiscountValue(kind, value) {
  const amount = parseAmount(value, "fee_discount_value_invalid");
  if (amount === 0 || (kind === "percent" && amount > 100)) {
    throw new ValidationError("fee_discount_value_invalid");
  }
  return amount;
}

export function toStudentDiscount(input) {
  if (input.student_id == null || text(input.student_id) === "") {
    throw new ValidationError("fee_student_required");
  }
  const kind = text(input.kind);
  const appliesTo = text(input.applies_to) || "tuition";
  if (!DISCOUNT_KINDS.includes(kind) || !DISCOUNT_SCOPES.includes(appliesTo)) {
    throw new ValidationError("fee_discount_kind_invalid");
  }
  const validFrom = parseOptionalDate(input.valid_from);
  const validTo = parseOptionalDate(input.valid_to);
  if (validFrom && validTo && validTo < validFrom) throw new ValidationError("fee_date_range_invalid");

  return {
    student_id: parseId(input.student_id, "fee_student_required"),
    kind,
    value: parseDiscountValue(kind, input.value),
    applies_to: appliesTo,
    reason: orNull(input.reason),
    valid_from: validFrom,
    valid_to: validTo,
  };
}

export function toBillingPeriod(input) {
  return {
    year: parseYear(input.year, "fee_period_invalid"),
    month: parseMonth(input.month),
  };
}
