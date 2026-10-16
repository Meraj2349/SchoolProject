// Pure rules for the online job application form. The server checks the
// same rules; these give instant feedback before anything is uploaded.

export const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_TYPES = [
  { extension: /\.pdf$/i, types: ["application/pdf"] },
  { extension: /\.jpe?g$/i, types: ["image/jpeg"] },
  { extension: /\.png$/i, types: ["image/png"] },
];
const FIELDS = ["post_index", "full_name", "phone", "email", "education", "address", "experience"];
const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

export const EMPTY_APPLICATION = { post_index: "", full_name: "", phone: "", email: "", education: "", address: "", experience: "", website: "" };

const text = (value) => String(value ?? "").trim();
const mobileDigits = (value) =>
  text(value)
    .replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d)))
    .replace(/[\s-]/g, "")
    .replace(/^\+?880/, "0");

/** Field errors as { field: "required" | "phoneInvalid" | "emailInvalid" }; empty when valid. */
export function validateApplication(form) {
  const errors = {};
  for (const field of ["post_index", "full_name"]) if (!text(form[field])) errors[field] = "required";
  if (!/^01[3-9]\d{8}$/.test(mobileDigits(form.phone))) errors.phone = "phoneInvalid";
  if (text(form.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(form.email))) errors.email = "emailInvalid";
  for (const field of ["education", "address"]) if (!text(form[field])) errors[field] = "required";
  return errors;
}

/** "cvWrongType", "cvTooLarge" or null for a chosen file (or none). */
export function cvProblem(file) {
  if (!file) return null;
  if (!CV_TYPES.some(({ extension, types }) => extension.test(file.name) && types.includes(file.type))) return "cvWrongType";
  return file.size > MAX_CV_BYTES ? "cvTooLarge" : null;
}

/** The multipart body for POST /job-applications. `website` is the hidden field bots fill in. */
export function toApplicationFormData(form, circularId, cv) {
  const body = new FormData();
  body.append("circular_id", String(circularId));
  for (const field of FIELDS) body.append(field, text(form[field]));
  body.append("website", text(form.website));
  if (cv) body.append("cv", cv);
  return body;
}
