import { ValidationError } from "../../../shared/errors/index.js";
import { isDate } from "./dates.js";
import { parseAmount, toPoisha } from "./money.js";

export const PAYMENT_METHODS = ["cash", "bkash", "nagad", "bank", "other"];

const RECEIPT_SEQ_DIGITS = 5;

const text = (value) => (value == null ? "" : String(value).trim());

// The late fine is charged once per invoice, only when money is still owed
// after the due date.
export function lateFineDue({ dueDate, onDate, balance, hasLateFine, lateFine }) {
  const isLate = onDate > dueDate;
  const isOwed = toPoisha(balance) > 0;
  return isLate && isOwed && !hasLateFine ? Number(lateFine) : 0;
}

export function toPayment(input, today) {
  const amount = parseAmount(input.amount, "fee_payment_amount_invalid");
  if (amount === 0) throw new ValidationError("fee_payment_amount_invalid");
  const method = text(input.method);
  if (!PAYMENT_METHODS.includes(method)) throw new ValidationError("fee_payment_method_invalid");
  const paidOn = text(input.paid_on) || today;
  if (!isDate(paidOn)) throw new ValidationError("fee_date_invalid");
  if (paidOn > today) throw new ValidationError("fee_payment_date_future");
  return { amount, method, paid_on: paidOn, note: text(input.note) || null };
}

export function validatePaymentAmount({ amount, balance }) {
  if (toPoisha(amount) > toPoisha(balance)) throw new ValidationError("fee_payment_exceeds_balance");
}

export function toVoid(input) {
  const reason = text(input.reason);
  if (!reason) throw new ValidationError("fee_void_reason_required");
  return { reason };
}

export const formatReceiptNo = ({ prefix, year, seq }) =>
  `${prefix}-${year}-${String(seq).padStart(RECEIPT_SEQ_DIGITS, "0")}`;
