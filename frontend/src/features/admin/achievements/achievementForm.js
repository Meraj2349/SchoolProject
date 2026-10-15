// Pure rules for the Achievements admin page: form values, validation and
// the request body. The server checks the same rules; these give instant
// feedback.

const FIRST_YEAR = 1950;
const RESULT_FIELDS = ["exam_name", "examinees", "passed", "gpa5"];
const TEXT_FIELDS = ["title_en", "title_bn", "description_en", "description_bn", "category", "year"];

export const EMPTY_ACHIEVEMENT = {
  title_en: "",
  title_bn: "",
  description_en: "",
  description_bn: "",
  category: "",
  year: String(new Date().getFullYear()),
  exam_name: "",
  examinees: "",
  passed: "",
  gpa5: "",
  is_featured: false,
  is_published: true,
};

const text = (value) => String(value ?? "").trim();
const whole = (value) => (text(value) === "" ? NaN : Number(value));
const isBoardResult = (form) => form.category === "board_result";

// The first broken rule among examinees > 0, passed ≤ examinees, GPA-5 ≤ passed.
function resultNumbersError(form) {
  const [examinees, passed, gpa5] = [form.examinees, form.passed, form.gpa5].map(whole);
  if (!Number.isInteger(examinees) || examinees <= 0) return { examinees: "resultNumbers" };
  if (!Number.isInteger(passed) || passed < 0 || passed > examinees) return { passed: "resultNumbers" };
  if (!Number.isInteger(gpa5) || gpa5 < 0 || gpa5 > passed) return { gpa5: "resultNumbers" };
  return {};
}

/** Field errors as { field: "required" | "invalidYear" | "resultNumbers" }; empty when valid. */
export function validateAchievementForm(form) {
  const errors = {};
  for (const field of ["title_en", "title_bn", "category"]) {
    if (!text(form[field])) errors[field] = "required";
  }
  const year = whole(form.year);
  if (!Number.isInteger(year) || year < FIRST_YEAR || year > new Date().getFullYear() + 1) errors.year = "invalidYear";
  if (!isBoardResult(form)) return errors;
  if (!text(form.exam_name)) return { ...errors, exam_name: "required" };
  return { ...errors, ...resultNumbersError(form) };
}

/** The multipart body: result numbers only for a board result, the photo only when one was chosen. */
export function toAchievementFormData(form, photo) {
  const body = new FormData();
  for (const field of TEXT_FIELDS) body.append(field, text(form[field]));
  if (isBoardResult(form)) for (const field of RESULT_FIELDS) body.append(field, text(form[field]));
  body.append("is_featured", String(Boolean(form.is_featured)));
  body.append("is_published", String(Boolean(form.is_published)));
  if (photo) body.append("image", photo);
  return body;
}

/** Form values for editing a saved achievement. */
export function toFormValues(achievement) {
  const values = { ...EMPTY_ACHIEVEMENT };
  for (const field of [...TEXT_FIELDS, ...RESULT_FIELDS]) values[field] = achievement[field] == null ? "" : String(achievement[field]);
  return { ...values, is_featured: Boolean(achievement.is_featured), is_published: Boolean(achievement.is_published) };
}
