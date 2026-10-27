import { ValidationError } from "../../../shared/errors/index.js";

// A result is one student's marks in one subject of one exam.

const MAX_MARKS = 100; // results are out of 100 (the result pages show "/ 100")

const toId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/** Whole marks from 0 to 100. */
export function toMarks(value) {
  const marks = value === "" || value == null ? NaN : Number(value);
  if (!Number.isInteger(marks) || marks < 0 || marks > MAX_MARKS) throw new ValidationError("result_marks_invalid");
  return marks;
}

/** A new result from the entry form (the form's TotalMarks is always 100 and is not kept). */
export function toNewResult(input) {
  const ids = {
    studentId: toId(input?.StudentID),
    examId: toId(input?.ExamID),
    subjectId: toId(input?.SubjectID),
    classId: toId(input?.ClassID),
  };
  const marksMissing = input?.MarksObtained === "" || input?.MarksObtained == null;
  if (Object.values(ids).includes(null) || marksMissing) throw new ValidationError("result_required_fields");
  return { ...ids, marks: toMarks(input.MarksObtained) };
}

// Query parameter → filter. The public page sends firstName, the admin panel studentName.
const SEARCH_FIELDS = [
  ["name", ["firstName", "studentName"]],
  ["rollNumber", ["rollNumber"]],
  ["className", ["className"]],
  ["section", ["section"]],
  ["examName", ["examName"]],
];

/** The result search's filters, trimmed, without the empty ones. */
export function toSearchFilters(query = {}) {
  const filters = {};
  for (const [filter, params] of SEARCH_FIELDS) {
    const value = params.map((param) => query[param]).find((v) => typeof v === "string" && v.trim());
    if (value) filters[filter] = value.trim();
  }
  return filters;
}
