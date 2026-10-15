import { firstDayOf, formatDate, lastDayOf } from "./dates.js";
import { fromPoisha, toPoisha } from "./money.js";

// Pure rules for a student's monthly invoice. Items are stored with the
// invoice (label + amount) so later changes to tuition, fee heads or discounts
// never rewrite an invoice that was already issued.

export const INVOICE_STATUSES = ["unpaid", "partial", "paid"];

const PERCENT = 100;

export const dueDateOf = (period, dueDay) => formatDate(period.year, period.month, dueDay);

export function discountAppliesIn(discount, period) {
  const startsInTime = !discount.valid_from || discount.valid_from <= lastDayOf(period);
  const notEnded = !discount.valid_to || discount.valid_to >= firstDayOf(period);
  return startsInTime && notEnded;
}

function discountPoisha(discount, basePoisha) {
  if (discount.kind === "fixed") return toPoisha(discount.value);
  return Math.round((basePoisha * Number(discount.value)) / PERCENT);
}

const discountLabel = (discount) => (discount.reason ? `Discount: ${discount.reason}` : "Discount");

function discountItems(discounts, { tuitionPoisha, allPoisha }) {
  let remaining = allPoisha;
  let remainingTuition = tuitionPoisha;
  const items = [];
  for (const discount of discounts) {
    const isTuitionOnly = discount.applies_to !== "all";
    const base = isTuitionOnly ? tuitionPoisha : allPoisha;
    const cap = Math.min(remaining, isTuitionOnly ? remainingTuition : remaining);
    const amount = Math.min(discountPoisha(discount, base), cap);
    if (amount <= 0) continue;
    remaining -= amount;
    remainingTuition = Math.max(0, remainingTuition - amount);
    items.push({ kind: "discount", label: discountLabel(discount), amount: fromPoisha(-amount) });
  }
  return items;
}

/**
 * @param {object} args
 * @param {number} args.tuition       monthly tuition in taka
 * @param {{label, amount}[]} args.extras  extra fee heads billed this month
 * @param {object[]} args.discounts   discounts already known to apply this month
 */
export function buildInvoiceItems({ tuition, extras, discounts }) {
  const charges = [
    ...(toPoisha(tuition) > 0 ? [{ kind: "tuition", label: "Tuition", amount: Number(tuition) }] : []),
    ...extras.map(({ label, amount }) => ({ kind: "extra", label, amount: Number(amount) })),
  ];
  const tuitionPoisha = toPoisha(tuition);
  const allPoisha = charges.reduce((sum, item) => sum + toPoisha(item.amount), 0);
  return [...charges, ...discountItems(discounts, { tuitionPoisha, allPoisha })];
}

export function invoiceTotals(items, payments) {
  const total = items.reduce((sum, item) => sum + toPoisha(item.amount), 0);
  const paid = payments
    .filter((payment) => !payment.voided_at)
    .reduce((sum, payment) => sum + toPoisha(payment.amount), 0);
  return { total: fromPoisha(total), paid: fromPoisha(paid), balance: fromPoisha(total - paid) };
}

export function invoiceStatus({ total, paid }) {
  if (toPoisha(paid) >= toPoisha(total)) return "paid";
  return toPoisha(paid) > 0 ? "partial" : "unpaid";
}
