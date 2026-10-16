import { ValidationError } from "../../../shared/errors/index.js";

// A job circular (নিয়োগ বিজ্ঞপ্তি): one or more posts, the date it was
// issued, an optional last date to apply and an optional poster (image or
// PDF, kept in image_url). Visitors may apply online while it is open.

const MAX_POSTS = 20;
const MAX_TITLE = 255; // the columns (and the copy in JobApplications) are VARCHAR(255)
const MAX_HOW_TO_APPLY = 5000;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const text = (value) => (typeof value === "string" ? value.trim() : "");
const optionalText = (value) => text(value) || null;
const isFalse = (value) => value === false || value === "false";
const blank = (value) => value === undefined || value === null || value === "";

/** The text, or a ValidationError when it is longer than `max` characters. */
function capped(value, max) {
  if (value && [...value].length > max) throw new ValidationError("job_circular_too_long");
  return value;
}

/** "YYYY-MM-DD" when it is a real calendar date, else a ValidationError. */
function day(value) {
  const raw = text(value);
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (!DAY.test(raw) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== raw) {
    throw new ValidationError("job_circular_date_invalid");
  }
  return raw;
}

const optionalDay = (value) => (blank(value) ? null : day(value));

/** Taka amount: a whole number ≥ 0, or null when left empty. */
function salary(value) {
  if (blank(value)) return null;
  const amount = Number(value);
  if (!Number.isInteger(amount) || amount < 0) throw new ValidationError("job_circular_salary_invalid");
  return amount;
}

function post(input = {}) {
  const title_en = capped(text(input.title_en), MAX_TITLE);
  const title_bn = capped(text(input.title_bn), MAX_TITLE);
  const vacancies = Number(input.vacancies);
  if (!title_en || !title_bn || !Number.isInteger(vacancies) || vacancies < 1) throw new ValidationError("job_circular_post_invalid");
  const salary_min = salary(input.salary_min);
  const salary_max = salary(input.salary_max);
  if (salary_min !== null && salary_max !== null && salary_min > salary_max) throw new ValidationError("job_circular_salary_invalid");
  return {
    title_en,
    title_bn,
    vacancies,
    qualification_en: capped(optionalText(input.qualification_en), MAX_TITLE),
    qualification_bn: capped(optionalText(input.qualification_bn), MAX_TITLE),
    salary_min,
    salary_max,
  };
}

/** Posts arrive as a list (JSON body) or as JSON text (multipart form). */
function posts(value) {
  let list = value;
  if (typeof value === "string") {
    try {
      list = JSON.parse(value);
    } catch {
      list = null;
    }
  }
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_POSTS) throw new ValidationError("job_circular_posts_required");
  return list.map(post);
}

function circularFields(input) {
  const title_en = capped(text(input.title_en), MAX_TITLE);
  const title_bn = capped(text(input.title_bn), MAX_TITLE);
  if (!title_en || !title_bn) throw new ValidationError("job_circular_title_required");
  const circular_date = day(input.circular_date);
  const deadline = optionalDay(input.deadline);
  if (deadline && deadline < circular_date) throw new ValidationError("job_circular_deadline_before_date");
  return {
    title_en,
    title_bn,
    circular_date,
    deadline,
    how_to_apply_en: capped(optionalText(input.how_to_apply_en), MAX_HOW_TO_APPLY),
    how_to_apply_bn: capped(optionalText(input.how_to_apply_bn), MAX_HOW_TO_APPLY),
    // Stored in a JSON column; mysql2 would expand a plain array into a list.
    posts: JSON.stringify(posts(input.posts)),
    is_open: !isFalse(input.is_open),
    is_published: !isFalse(input.is_published),
  };
}

/** Today's date in Bangladesh, "YYYY-MM-DD" (a circular's last date is a Bangladeshi day). */
export const schoolToday = (now = new Date()) => now.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });

/** Whether visitors may apply online: published, marked open and not past its last date. */
export const isAcceptingApplications = (circular, today = schoolToday()) =>
  Boolean(circular.is_published) && Boolean(circular.is_open) && (!circular.deadline || today <= String(circular.deadline).slice(0, 10));

const postsOf = (row) => (typeof row.posts === "string" ? JSON.parse(row.posts) : (row.posts ?? []));

/** Content kind for src/modules/content. `image_url` (the poster) is set only from an upload. */
export const jobCircular = {
  notFound: "job_circular_not_found",
  toNew: (input) => ({ ...circularFields(input), image_url: input.image_url ?? null }),
  // Flags and the poster left out of an edit keep their current value.
  toChanges: (input, existing) => ({
    ...circularFields(input),
    ...(input.is_open === undefined && { is_open: Boolean(existing.is_open) }),
    ...(input.is_published === undefined && { is_published: Boolean(existing.is_published) }),
    image_url: input.image_url ?? existing.image_url,
  }),
  toVisibility: (input) => {
    if (typeof input.is_published !== "boolean") throw new ValidationError("job_circular_invalid_publish");
    return { is_published: input.is_published };
  },
  /** The row as the API shows it: posts as a list, flags as booleans, and whether it takes applications. */
  present: (row, today = schoolToday()) => ({
    ...row,
    posts: postsOf(row),
    is_open: Boolean(row.is_open),
    is_published: Boolean(row.is_published),
    accepting: isAcceptingApplications(row, today),
  }),
};
