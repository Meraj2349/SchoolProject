// Pure rules for the fee pages: periods, status badges and payment checks.
// The server validates everything again; these give instant, translated feedback.

/** Payment methods the server accepts. */
export const PAYMENT_METHODS = ["cash", "bkash", "nagad", "bank", "other"];

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
};

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const toPoisha = (taka) => Math.round(Number(taka) * 100);

export const monthName = (month, language = "en") => (MONTHS[language] ?? MONTHS.en)[month - 1];

export const periodLabel = ({ year, month }, language = "en") => `${monthName(month, language)} ${year}`;

/** The period `delta` months away, wrapping across years. */
export function shiftPeriod({ year, month }, delta) {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Years to offer in a year picker: two back, one ahead. */
export const yearOptions = (currentYear) => [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

const STATUS_BADGES = {
  paid: { tone: "success", key: "statusPaid" },
  partial: { tone: "warning", key: "statusPartial" },
  unpaid: { tone: "danger", key: "statusUnpaid" },
};

/** Badge for an invoice status; unpaid or partly paid after the due date shows as overdue. */
export function statusBadge(status, { dueDate, today } = {}) {
  if (status !== "paid" && dueDate && today && today > dueDate) return { tone: "danger", key: "statusOverdue" };
  return STATUS_BADGES[status] ?? STATUS_BADGES.unpaid;
}

export const paymentDefaults = (invoice, today) => ({
  amount: String(invoice.balance),
  method: "cash",
  paid_on: today,
  note: "",
});

/** Field errors for the payment form; empty when it can be sent. */
export function validatePayment(form, { balance, today }) {
  const errors = {};
  const amount = String(form.amount ?? "").trim();
  if (!AMOUNT_PATTERN.test(amount) || toPoisha(amount) === 0) errors.amount = "amountInvalid";
  else if (toPoisha(amount) > toPoisha(balance)) errors.amount = "amountTooHigh";
  if (!form.paid_on) errors.paid_on = "required";
  else if (form.paid_on > today) errors.paid_on = "dateFuture";
  if (!PAYMENT_METHODS.includes(form.method)) errors.method = "required";
  return errors;
}

/** { amount, scope } for showing a discount: "50%" or a taka amount; scope tuition | all. */
export const discountText = (discount) => ({
  amount: discount.kind === "percent" ? `${Number(discount.value)}%` : Number(discount.value),
  scope: discount.applies_to,
});

/** Percent of the billed amount collected, one decimal; null when nothing was billed. */
export const collectionRate = ({ billed, collected }) =>
  Number(billed) > 0 ? Math.round((Number(collected) / Number(billed)) * 1000) / 10 : null;
