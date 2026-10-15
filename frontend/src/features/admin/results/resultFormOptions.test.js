import { describe, expect, it } from "vitest";
import { optionsForClass } from "./resultFormOptions";

const exams = [
  { ExamID: 1, ClassID: 10, ClassName: "Class 5", Section: "Good" },
  { ExamID: 2, ClassID: 11, ClassName: "Class 5", Section: "General" },
  { ExamID: 3, ClassID: 12, ClassName: "Class 6", Section: "Good" },
];

describe("optionsForClass", () => {
  it("shows everything before a class is chosen", () => {
    expect(optionsForClass(exams, { className: "", classId: "" })).toEqual(exams);
  });

  it("narrows to the class name while the section is not chosen yet", () => {
    expect(optionsForClass(exams, { className: "class 5", classId: "" }).map((e) => e.ExamID)).toEqual([1, 2]);
  });

  it("shows only the chosen section's items once class and section are chosen", () => {
    expect(optionsForClass(exams, { className: "Class 5", classId: "11" }).map((e) => e.ExamID)).toEqual([2]);
  });
});
