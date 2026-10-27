import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { EXAM_TYPES, toExamChanges, toNewExam } from "./exam.js";

const TODAY = "2026-10-27";
const form = (overrides = {}) => ({
  ExamType: "Monthly",
  ExamName: " October test ",
  ClassName: "Class 5",
  SectionName: "Good",
  ExamDate: "2026-11-02",
  ...overrides,
});

const codeOf = (fn) => {
  try {
    fn();
  } catch (error) {
    if (error instanceof ValidationError) return error.code;
    throw error;
  }
  return null;
};

describe("toNewExam", () => {
  it("reads the admin form", () => {
    expect(toNewExam(form(), { today: TODAY })).toEqual({
      type: "Monthly",
      name: "October test",
      className: "Class 5",
      section: "Good",
      date: "2026-11-02",
    });
  });

  it("also reads camelCase fields", () => {
    const camel = { examType: "Final", examName: "Final 2026", className: "Class 10", sectionName: "Better", examDate: "2026-12-01" };
    expect(toNewExam(camel, { today: TODAY })).toMatchObject({ type: "Final", name: "Final 2026", className: "Class 10", section: "Better" });
  });

  it("allows today", () => {
    expect(toNewExam(form({ ExamDate: TODAY }), { today: TODAY }).date).toBe(TODAY);
  });

  it.each([
    ["no type", { ExamType: "" }, "exam_required_fields"],
    ["a blank name", { ExamName: "   " }, "exam_required_fields"],
    ["no class", { ClassName: undefined }, "exam_required_fields"],
    ["no section", { SectionName: "" }, "exam_required_fields"],
    ["no date", { ExamDate: "" }, "exam_required_fields"],
    ["an unknown type", { ExamType: "Weekly" }, "exam_invalid_type"],
    ["a name over 50 characters", { ExamName: "x".repeat(51) }, "exam_name_too_long"],
    ["a date that is not a date", { ExamDate: "next week" }, "exam_date_invalid"],
    ["an impossible date", { ExamDate: "2026-02-30" }, "exam_date_invalid"],
    ["a past date", { ExamDate: "2026-10-26" }, "exam_date_past"],
  ])("refuses %s", (_label, overrides, code) => {
    expect(codeOf(() => toNewExam(form(overrides), { today: TODAY }))).toBe(code);
  });

  it("knows the five exam types", () => {
    expect(EXAM_TYPES).toEqual(["Monthly", "Quarterly", "Half-Yearly", "Annual", "Final"]);
  });
});

describe("toExamChanges", () => {
  it("reads every field of the edit form, and allows a past date (a correction)", () => {
    expect(toExamChanges(form({ ExamDate: "2025-11-20" }))).toEqual({
      type: "Monthly",
      name: "October test",
      className: "Class 5",
      section: "Good",
      date: "2025-11-20",
    });
  });

  it("changes only what is sent", () => {
    expect(toExamChanges({ ExamName: "Renamed" })).toEqual({ name: "Renamed" });
  });

  it("moves the exam only with both class and section", () => {
    expect(codeOf(() => toExamChanges({ ClassName: "Class 6" }))).toBe("exam_required_fields");
  });

  it.each([
    ["nothing", {}, "exam_nothing_to_change"],
    ["a blank name", { ExamName: " " }, "exam_required_fields"],
    ["an unknown type", { ExamType: "Weekly" }, "exam_invalid_type"],
    ["a bad date", { ExamDate: "2025-13-01" }, "exam_date_invalid"],
  ])("refuses %s", (_label, input, code) => {
    expect(codeOf(() => toExamChanges(input))).toBe(code);
  });
});
