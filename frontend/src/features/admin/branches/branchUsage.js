// "120 students, 2 admins, 340 fee invoices": what still belongs to a branch,
// from the server's refusal to delete it. Zero counts are left out.
const ORDER = ["students", "teachers", "classes", "admins", "invoices", "payments"];

export function usageSummary(counts, t) {
  if (!counts) return "";
  return ORDER.filter((key) => counts[key] > 0)
    .map((key) => t(`usage.${key}`).replace("{count}", counts[key]))
    .join(", ");
}
