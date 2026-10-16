// Framework-free helpers for the public attendance page.

const STATUSES = ["present", "absent", "late", "excused"];

/** "present", "absent", "late" or "excused"; null for anything else. */
export function statusKey(status) {
  const key = String(status ?? "").trim().toLowerCase();
  return STATUSES.includes(key) ? key : null;
}

/** Totals for the summary cards; the rate is a percentage rounded to one decimal. */
export function attendanceSummary(records = []) {
  const count = (key) => records.filter((r) => statusKey(r.Status) === key).length;
  const total = records.length;
  const present = count("present");
  return { total, present, absent: count("absent"), rate: total ? Math.round((present / total) * 1000) / 10 : 0 };
}
