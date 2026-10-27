import { ValidationError } from "../../../shared/errors/index.js";
import { isDay } from "../../../shared/schoolDate.js";

// An exam is scheduled for one class (a class name and section) of a branch.

/** The Exams.ExamType ENUM. */
export const EXAM_TYPES = ["Monthly", "Quarterly", "Half-Yearly", "Annual", "Final"];

const NAME_MAX_LENGTH = 50; // Exams.ExamName VARCHAR(50)

const text = (value) => (value == null ? "" : String(value).trim());

// The Exams page sends PascalCase; older callers camelCase.
const pick = (input, pascal, camel) => input?.[pascal] ?? input?.[camel];

function readForm(input) {
  return {
    type: pick(input, "ExamType", "examType"),
    name: pick(input, "ExamName", "examName"),
    className: pick(input, "ClassName", "className"),
    section: pick(input, "SectionName", "sectionName"),
    date: pick(input, "ExamDate", "examDate"),
  };
}

function checkType(type) {
  if (!EXAM_TYPES.includes(type)) throw new ValidationError("exam_invalid_type");
}

function checkName(name) {
  if (!name) throw new ValidationError("exam_required_fields");
  if (name.length > NAME_MAX_LENGTH) throw new ValidationError("exam_name_too_long");
}

function checkDate(date) {
  if (!isDay(date)) throw new ValidationError("exam_date_invalid");
}

/**
 * A new exam from the admin form. It is scheduled ahead: a new exam may be
 * today or later, never in the past (`today` is the school day).
 */
export function toNewExam(input, { today }) {
  const form = Object.fromEntries(Object.entries(readForm(input)).map(([key, value]) => [key, text(value)]));
  if (Object.values(form).some((value) => !value)) throw new ValidationError("exam_required_fields");
  checkType(form.type);
  checkName(form.name);
  checkDate(form.date);
  if (form.date < today) throw new ValidationError("exam_date_past");
  return form;
}

/**
 * The changes to an existing exam: only the fields sent. Any real date is
 * allowed, so a held exam can still be corrected. A class move needs both the
 * class name and the section.
 */
export function toExamChanges(input) {
  const sent = Object.fromEntries(
    Object.entries(readForm(input))
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, text(value)]),
  );
  if (Object.keys(sent).length === 0) throw new ValidationError("exam_nothing_to_change");
  if ("type" in sent) checkType(sent.type);
  if ("name" in sent) checkName(sent.name);
  if ("date" in sent) checkDate(sent.date);
  const movesClass = "className" in sent || "section" in sent;
  if (movesClass && !(sent.className && sent.section)) throw new ValidationError("exam_required_fields");
  return sent;
}
