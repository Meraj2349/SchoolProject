import { describe, expect, it } from "vitest";
import { formatDuration, letterGrade } from "./quizGrade";

describe("letterGrade", () => {
  it.each([
    [100, "A"],
    [90, "A"],
    [89.9, "B"],
    [70, "C"],
    [60, "D"],
    [59.9, "F"],
    ["80", "B"],
  ])("%s%% is %s", (percentage, grade) => {
    expect(letterGrade(percentage)).toBe(grade);
  });
});

describe("formatDuration", () => {
  it.each([
    [125, "2:05"],
    [0, "0:00"],
    [null, "0:00"],
    [3600, "60:00"],
  ])("%s seconds is %s", (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });
});
