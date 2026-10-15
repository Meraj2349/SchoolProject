import { ValidationError } from "../../../shared/errors/index.js";

// An achievement shown on the website's honours board. A board result (SSC,
// HSC, ...) also records how many sat the exam, passed and got GPA-5.

export const ACHIEVEMENT_CATEGORIES = ["board_result", "academic", "sports", "cultural", "competition", "award"];
const FIRST_YEAR = 1950;
const EXAM_NAME_MAX = 30; // Achievements.exam_name VARCHAR(30)

const text = (value) => (typeof value === "string" ? value.trim() : "");
const optionalText = (value) => text(value) || null;
// Forms send booleans as strings.
const isTrue = (value) => value === true || value === "true";
const isFalse = (value) => value === false || value === "false";
const wholeNumber = (value) => (value === "" || value == null ? NaN : Number(value));

function year(value) {
  const parsed = wholeNumber(value);
  const latest = new Date().getFullYear() + 1;
  if (!Number.isInteger(parsed) || parsed < FIRST_YEAR || parsed > latest) {
    throw new ValidationError("achievement_year_invalid");
  }
  return parsed;
}

const NO_RESULT = { exam_name: null, examinees: null, passed: null, gpa5: null };

function boardResult(input) {
  const exam_name = text(input.exam_name);
  if (!exam_name || exam_name.length > EXAM_NAME_MAX) throw new ValidationError("achievement_exam_required");
  const [examinees, passed, gpa5] = [input.examinees, input.passed, input.gpa5].map(wholeNumber);
  const consistent =
    [examinees, passed, gpa5].every(Number.isInteger) && examinees > 0 && passed >= 0 && passed <= examinees && gpa5 >= 0 && gpa5 <= passed;
  if (!consistent) throw new ValidationError("achievement_result_numbers_invalid");
  return { exam_name, examinees, passed, gpa5 };
}

function achievementFields(input) {
  const title_en = text(input.title_en);
  const title_bn = text(input.title_bn);
  if (!title_en || !title_bn) throw new ValidationError("achievement_title_required");
  const category = text(input.category);
  if (!ACHIEVEMENT_CATEGORIES.includes(category)) throw new ValidationError("achievement_category_invalid");
  return {
    title_en,
    title_bn,
    description_en: optionalText(input.description_en),
    description_bn: optionalText(input.description_bn),
    category,
    year: year(input.year),
    is_featured: isTrue(input.is_featured),
    is_published: !isFalse(input.is_published),
    ...(category === "board_result" ? boardResult(input) : NO_RESULT),
  };
}

/** Content kind for src/modules/content. `image_url` is set only from an upload. */
export const achievement = {
  notFound: "achievement_not_found",
  toNew: (input) => ({ ...achievementFields(input), image_url: input.image_url ?? null }),
  toChanges: (input, existing) => ({ ...achievementFields(input), image_url: input.image_url ?? existing.image_url }),
  toVisibility: (input) => {
    if (typeof input.is_published !== "boolean") throw new ValidationError("achievement_invalid_publish");
    return { is_published: input.is_published };
  },
};
