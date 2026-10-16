// Framework-free helpers for the public attendance page.
import { attendanceTotals } from "@/lib/attendance";

const STATUSES = ["present", "absent", "late", "leave"];

/** "present", "absent", "late" or "leave"; null for anything else. */
export function statusKey(status) {
  const key = String(status ?? "").trim().toLowerCase();
  return STATUSES.includes(key) ? key : null;
}

const asStatus = (key) => key && key[0].toUpperCase() + key.slice(1);

/**
 * Totals for the summary cards. The rate is the percent of expected days the
 * student came (late counts as came, leave was not expected), to one decimal.
 */
export function attendanceSummary(records = []) {
  const { present, absent, rate } = attendanceTotals(records.map((r) => asStatus(statusKey(r.Status))), { decimals: 1 });
  return { total: records.length, present, absent, rate: rate ?? 0 };
}
