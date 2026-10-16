// School days are "YYYY-MM-DD" strings in the school's time zone (the DB pool
// returns DATE columns as such strings), so they compare correctly as plain
// strings and never shift with the server's time zone.

export const SCHOOL_TIME_ZONE = process.env.SCHOOL_TIME_ZONE || "Asia/Dhaka";

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The school day `now` falls on: the date flips at local midnight. */
export const schoolToday = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: SCHOOL_TIME_ZONE }).format(now);

/** True for a real calendar date written "YYYY-MM-DD". */
export function isDay(value) {
  const match = typeof value === "string" ? DAY.exec(value) : null;
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** The day `days` after (or before, when negative) `day`. */
export function addDays(day, days) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
