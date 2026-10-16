const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

/**
 * A Bangladeshi mobile number as "01XXXXXXXXX", from what people type: Bangla
 * digits, spaces, dashes, a +880 or 880 prefix. Null when it is not one.
 */
export function normalizeBdMobile(value) {
  if (typeof value !== "string") return null;
  const digits = value
    .trim()
    .replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d)))
    .replace(/[\s-]/g, "")
    .replace(/^\+?880/, "0");
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}
