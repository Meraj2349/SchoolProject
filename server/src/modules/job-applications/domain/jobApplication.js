import { ValidationError } from "../../../shared/errors/index.js";

// An application sent online to a job circular. It is filed under the
// circular's branch and keeps a copy of the post's names, so it reads the
// same if the circular is edited later.

export const STATUSES = ["new", "shortlisted", "rejected", "hired"];
const MAX = { full_name: 150, education: 255, email: 150, address: 1000, experience: 2000 };
const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value) => (typeof value === "string" ? value.trim() : "");
const fits = (field, value) => value.length <= MAX[field];

/** "01XXXXXXXXX" from what people type: Bangla digits, spaces, dashes, a +880 prefix. */
function mobile(value) {
  const digits = text(value)
    .replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d)))
    .replace(/[\s-]/g, "")
    .replace(/^\+?880/, "0");
  if (!/^01[3-9]\d{8}$/.test(digits)) throw new ValidationError("job_application_phone_invalid");
  return digits;
}

/** The row to save, from the public form and the circular it answers. */
export function toNewJobApplication(input, circular) {
  const full_name = text(input.full_name);
  const education = text(input.education);
  const address = text(input.address);
  if (!full_name || !education || !address || !fits("full_name", full_name) || !fits("education", education) || !fits("address", address)) {
    throw new ValidationError("job_application_required");
  }

  const raw = text(String(input.post_index ?? ""));
  const post_index = raw === "" ? NaN : Number(raw);
  const post = Number.isInteger(post_index) && post_index >= 0 ? circular.posts[post_index] : undefined;
  if (!post) throw new ValidationError("job_application_post_invalid");

  const email = text(input.email).toLowerCase() || null;
  if (email && (!EMAIL.test(email) || !fits("email", email))) throw new ValidationError("job_application_email_invalid");
  const experience = text(input.experience).slice(0, MAX.experience) || null;

  return {
    circular_id: circular.id,
    post_index,
    post_title_en: post.title_en,
    post_title_bn: post.title_bn,
    full_name,
    phone: mobile(input.phone),
    email,
    address,
    education,
    experience,
    branch_id: circular.branch_id ?? null,
  };
}

export function toStatus(value) {
  if (!STATUSES.includes(value)) throw new ValidationError("job_application_invalid_status");
  return value;
}
