import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { toQuestion, toQuestionChanges } from "./question.js";

const valid = {
  classKey: "Class 10",
  subject: " Physics ",
  prompt: " What type of mirror is used as a rear view mirror? ",
  options: { A: "Concave", B: "Convex", C: "Plain", D: "Convergent" },
  promptBn: "গাড়ির রিয়ার ভিউ মিরর হিসাবে কোন ধরনের দর্পণ ব্যবহৃত হয়?",
  optionsBn: { A: "অবতল", B: "উত্তল", C: "সমতল", D: "অভিসারী" },
  answer: "b",
};

const codeOf = (fn) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return error.code;
  }
  throw new Error("expected a ValidationError");
};

describe("toQuestion", () => {
  it("cleans up a valid bilingual question", () => {
    expect(toQuestion(valid)).toEqual({
      classKey: "10",
      subject: "Physics",
      prompt: "What type of mirror is used as a rear view mirror?",
      options: { A: "Concave", B: "Convex", C: "Plain", D: "Convergent" },
      promptBn: "গাড়ির রিয়ার ভিউ মিরর হিসাবে কোন ধরনের দর্পণ ব্যবহৃত হয়?",
      optionsBn: { A: "অবতল", B: "উত্তল", C: "সমতল", D: "অভিসারী" },
      answer: "B",
    });
  });

  it("keeps LaTeX exactly as written", () => {
    const q = toQuestion({ ...valid, prompt: "\\frac{1}{\\sqrt{3}} + x", options: { ...valid.options, A: "\\sqrt{2}" } });

    expect(q.prompt).toBe("\\frac{1}{\\sqrt{3}} + x");
    expect(q.options.A).toBe("\\sqrt{2}");
  });

  it("treats Bangla as optional", () => {
    expect(toQuestion({ ...valid, promptBn: "", optionsBn: undefined })).toMatchObject({ promptBn: null, optionsBn: null });
  });

  it("needs all four Bangla options once a Bangla question is given", () => {
    expect(codeOf(() => toQuestion({ ...valid, optionsBn: { ...valid.optionsBn, D: " " } }))).toBe("quiz_bangla_incomplete");
  });

  it.each([
    [{ classKey: "Class 13" }, "quiz_class_invalid"],
    [{ subject: "" }, "quiz_subject_required"],
    [{ subject: "x".repeat(101) }, "quiz_subject_too_long"],
    [{ prompt: "  " }, "quiz_prompt_required"],
    [{ options: { A: "1", B: "2", C: "3" } }, "quiz_options_required"],
    [{ options: { A: "1", B: "", C: "3", D: "4" } }, "quiz_options_required"],
    [{ answer: "E" }, "quiz_answer_invalid"],
    [{ answer: "*" }, "quiz_answer_invalid"],
    [{ answer: "" }, "quiz_answer_invalid"],
    [{ prompt: "What is #ERROR!" }, "quiz_spreadsheet_error"],
    [{ options: { ...valid.options, D: "#ERROR!" } }, "quiz_spreadsheet_error"],
    [{ optionsBn: { ...valid.optionsBn, A: "#NAME?" } }, "quiz_spreadsheet_error"],
  ])("rejects %j with %s", (change, code) => {
    expect(codeOf(() => toQuestion({ ...valid, ...change }))).toBe(code);
  });
});

describe("toQuestionChanges", () => {
  const existing = toQuestion(valid);

  it("keeps what was not sent", () => {
    expect(toQuestionChanges({ answer: "c" }, existing)).toEqual({ ...existing, answer: "C" });
  });

  it("validates the merged question", () => {
    expect(codeOf(() => toQuestionChanges({ prompt: "" }, existing))).toBe("quiz_prompt_required");
  });

  it("can remove the Bangla text", () => {
    expect(toQuestionChanges({ promptBn: "", optionsBn: null }, existing)).toMatchObject({ promptBn: null, optionsBn: null });
  });
});
