import { describe, expect, it } from "@jest/globals";
import { letterGrade, scoreAnswers, summarize } from "./scoring.js";

const questions = [
  { id: 1, answer: "B" },
  { id: 2, answer: "C" },
];

describe("scoreAnswers", () => {
  it("marks each answer against the stored correct letter", () => {
    expect(
      scoreAnswers(
        [
          { questionId: 1, userAnswer: "b", timeSpentSeconds: 4 },
          { questionId: "2", userAnswer: "A" },
        ],
        questions,
      ),
    ).toEqual([
      { questionId: 1, userAnswer: "B", correctAnswer: "B", isCorrect: true, timeSpentSeconds: 4 },
      { questionId: 2, userAnswer: "A", correctAnswer: "C", isCorrect: false, timeSpentSeconds: null },
    ]);
  });

  it("ignores unknown questions and counts each question once", () => {
    const graded = scoreAnswers(
      [
        { questionId: 1, userAnswer: "B" },
        { questionId: 1, userAnswer: "B" },
        { questionId: 99, userAnswer: "" },
      ],
      questions,
    );

    expect(graded.map((g) => g.questionId)).toEqual([1]);
  });

  it("treats a blank answer as wrong", () => {
    expect(scoreAnswers([{ questionId: 1 }], questions)[0]).toMatchObject({ userAnswer: "", isCorrect: false });
  });

  it("keeps only a sensible time per question", () => {
    const [graded] = scoreAnswers([{ questionId: 1, userAnswer: "B", timeSpentSeconds: -5 }], questions);

    expect(graded.timeSpentSeconds).toBeNull();
  });
});

describe("summarize", () => {
  it("counts and rounds the percentage to two decimals", () => {
    expect(summarize([{ isCorrect: true }, { isCorrect: false }, { isCorrect: false }])).toEqual({
      total: 3,
      correct: 1,
      percentage: 33.33,
    });
  });
});

describe("letterGrade", () => {
  it.each([
    [100, "A"],
    [90, "A"],
    [89.99, "B"],
    [80, "B"],
    [70, "C"],
    [60, "D"],
    [59.99, "F"],
    [0, "F"],
  ])("%d%% is %s", (percentage, grade) => {
    expect(letterGrade(percentage)).toBe(grade);
  });
});
