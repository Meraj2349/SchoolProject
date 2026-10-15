// Dates are "YYYY-MM-DD" strings (the DB pool uses dateStrings), so they
// compare correctly as plain strings and never shift with the time zone.
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n) => String(n).padStart(2, "0");

export function isDate(value) {
  const match = DATE_PATTERN.exec(value ?? "");
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export const formatDate = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

export const firstDayOf = ({ year, month }) => formatDate(year, month, 1);

export const lastDayOf = ({ year, month }) =>
  formatDate(year, month, new Date(Date.UTC(year, month, 0)).getUTCDate());
