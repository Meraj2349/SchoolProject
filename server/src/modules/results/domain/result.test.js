import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { toMarks, toNewResult, toSearchFilters } from "./result.js";

const codeOf = (fn) => {
  try {
    fn();
  } catch (error) {
    if (error instanceof ValidationError) return error.code;
    throw error;
  }
  return null;
};

const entry = (overrides = {}) => ({ StudentID: 3, ExamID: "7", SubjectID: 11, ClassID: 51, MarksObtained: "77", TotalMarks: 100, ...overrides });

describe("toNewResult", () => {
  it("reads the result entry form", () => {
    expect(toNewResult(entry())).toEqual({ studentId: 3, examId: 7, subjectId: 11, classId: 51, marks: 77 });
  });

  it.each([
    ["no student", { StudentID: undefined }],
    ["no exam", { ExamID: "" }],
    ["a subject that is not an id", { SubjectID: "math" }],
    ["no class", { ClassID: 0 }],
    ["no marks", { MarksObtained: "" }],
  ])("refuses %s", (_label, overrides) => {
    expect(codeOf(() => toNewResult(entry(overrides)))).toBe("result_required_fields");
  });
});

describe("toMarks", () => {
  it.each([[0], [100], ["45"]])("accepts %p", (value) => {
    expect(toMarks(value)).toBe(Number(value));
  });

  it.each([[-1], [101], [77.5], ["abc"], [null], [undefined]])("refuses %p", (value) => {
    expect(codeOf(() => toMarks(value))).toBe("result_marks_invalid");
  });
});

describe("toSearchFilters", () => {
  it("keeps the filters the result pages send, trimmed", () => {
    expect(toSearchFilters({ firstName: " Rahim ", rollNumber: "1", className: "Class 5", section: "Good", examName: "Annual", other: "x" })).toEqual({
      name: "Rahim",
      rollNumber: "1",
      className: "Class 5",
      section: "Good",
      examName: "Annual",
    });
  });

  it("reads the admin panel's studentName and drops empty filters", () => {
    expect(toSearchFilters({ studentName: "Karim", rollNumber: "", section: undefined })).toEqual({ name: "Karim" });
  });
});
