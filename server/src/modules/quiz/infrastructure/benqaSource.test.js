import { describe, expect, it } from "@jest/globals";
import { benqaFileInfo, benqaQuestions } from "./benqaSource.js";

const HEADER = "English Question,Bengali Question,A,B,C,D,A Bn,B Bn,C Bn,D Bn,Correct Answer";

describe("benqaFileInfo", () => {
  it.each([
    ["10th-Physics.csv", { classKey: "10", subject: "Physics", name: "10th-Physics" }],
    ["10th-Math-II.csv", { classKey: "10", subject: "Math-II", name: "10th-Math-II" }],
    ["8th-Science.csv", { classKey: "8", subject: "Science", name: "8th-Science" }],
    ["12th-Biology-I.csv", { classKey: "12", subject: "Biology-I", name: "12th-Biology-I" }],
  ])("reads the class and subject from %s", (file, info) => {
    expect(benqaFileInfo(file)).toEqual(info);
  });

  it("ignores other files", () => {
    expect(benqaFileInfo("README.md")).toBeNull();
    expect(benqaFileInfo("notes.csv")).toBeNull();
  });
});

describe("benqaQuestions", () => {
  it("turns each row into a question input with a stable source key", () => {
    const csv = `${HEADER}\nWhat type of mirror?,কোন দর্পণ?,Concave,Convex,Plain,Convergent,অবতল,উত্তল,সমতল,অভিসারী,b\n"\\frac{1}{2}, half?",অর্ধেক?,1,2,3,4,১,২,৩,৪,a\n`;

    expect(benqaQuestions("10th-Physics.csv", csv)).toEqual([
      {
        sourceKey: "benqa:10th-Physics:1",
        classKey: "10",
        subject: "Physics",
        prompt: "What type of mirror?",
        options: { A: "Concave", B: "Convex", C: "Plain", D: "Convergent" },
        promptBn: "কোন দর্পণ?",
        optionsBn: { A: "অবতল", B: "উত্তল", C: "সমতল", D: "অভিসারী" },
        answer: "b",
      },
      expect.objectContaining({ sourceKey: "benqa:10th-Physics:2", prompt: "\\frac{1}{2}, half?", answer: "a" }),
    ]);
  });
});
