import { describe, expect, it } from "vitest";
import { emptyQuestion, toFormValues, toQuestionPayload, validateQuestionForm } from "./questionForm";

const filled = {
  ...emptyQuestion("8"),
  subject: "Math",
  prompt: "What is \\frac{1}{2} of 10?",
  A: "2",
  B: "5",
  C: "10",
  D: "20",
  answer: "B",
};

describe("validateQuestionForm", () => {
  it("accepts a complete English question", () => {
    expect(validateQuestionForm(filled)).toEqual({});
  });

  it("says what is missing", () => {
    expect(validateQuestionForm(emptyQuestion(""))).toEqual({
      classKey: "required",
      subject: "required",
      prompt: "required",
      A: "required",
      B: "required",
      C: "required",
      D: "required",
    });
  });

  it("needs all four Bangla options once a Bangla question is written", () => {
    expect(validateQuestionForm({ ...filled, promptBn: "১০ এর অর্ধেক?", bnA: "২" })).toEqual({
      bnB: "required",
      bnC: "required",
      bnD: "required",
    });
  });

  it("needs the Bangla question when Bangla options are written", () => {
    expect(validateQuestionForm({ ...filled, bnA: "২" })).toEqual({ promptBn: "required" });
  });

  it("limits the subject to 100 characters", () => {
    expect(validateQuestionForm({ ...filled, subject: "x".repeat(101) })).toEqual({ subject: "tooLong" });
  });
});

describe("toQuestionPayload", () => {
  it("builds the API body, trimming text but keeping LaTeX", () => {
    expect(toQuestionPayload({ ...filled, subject: " Math ", prompt: " \\sqrt{2} " })).toEqual({
      classKey: "8",
      subject: "Math",
      prompt: "\\sqrt{2}",
      options: { A: "2", B: "5", C: "10", D: "20" },
      promptBn: null,
      optionsBn: null,
      answer: "B",
    });
  });

  it("includes the Bangla text when given", () => {
    const payload = toQuestionPayload({ ...filled, promptBn: "অর্ধেক?", bnA: "২", bnB: "৫", bnC: "১০", bnD: "২০" });

    expect(payload).toMatchObject({ promptBn: "অর্ধেক?", optionsBn: { A: "২", B: "৫", C: "১০", D: "২০" } });
  });
});

describe("toFormValues", () => {
  it("fills the form from a question and back again", () => {
    const question = {
      id: 3,
      classKey: "10",
      subject: "Physics",
      prompt: "Mirror?",
      options: { A: "Concave", B: "Convex", C: "Plain", D: "Convergent" },
      promptBn: "দর্পণ?",
      optionsBn: { A: "অবতল", B: "উত্তল", C: "সমতল", D: "অভিসারী" },
      answer: "B",
    };

    expect(toQuestionPayload(toFormValues(question))).toEqual({
      classKey: "10",
      subject: "Physics",
      prompt: "Mirror?",
      options: question.options,
      promptBn: "দর্পণ?",
      optionsBn: question.optionsBn,
      answer: "B",
    });
  });
});
