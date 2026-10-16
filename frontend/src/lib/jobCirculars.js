// Framework-free helpers for job circulars, shared by the public pages and the admin.
import { formatNumber } from "./homePage";
import { fillTemplate } from "./template";

const amount = (value) => (value === null || value === undefined || value === "" ? null : Number(value));

/** "10,000 – 20,000 Tk", "From …", "Up to …" or "Negotiable", in the reader's language. */
export function salaryText(post, language, t) {
  const [min, max] = [amount(post.salary_min), amount(post.salary_max)];
  const n = (value) => formatNumber(value, language);
  if (min !== null && max !== null) return fillTemplate(t("salaryRange"), { min: n(min), max: n(max) });
  if (min !== null) return fillTemplate(t("salaryFrom"), { min: n(min) });
  if (max !== null) return fillTemplate(t("salaryUpTo"), { max: n(max) });
  return t("negotiable");
}

export const totalVacancies = (circular) => (circular.posts ?? []).reduce((sum, post) => sum + (Number(post.vacancies) || 0), 0);

/** Circulars taking applications now, and the rest (closed or past their last date). */
export const splitCirculars = (circulars = []) => ({
  open: circulars.filter((c) => c.accepting),
  past: circulars.filter((c) => !c.accepting),
});
