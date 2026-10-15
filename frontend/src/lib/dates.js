/**
 * Local calendar date as "YYYY-MM-DD".
 * Use this instead of date.toISOString().split("T")[0], which returns the UTC
 * date — in Bangladesh (UTC+6) that is still yesterday until 6 a.m.
 */
export function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
