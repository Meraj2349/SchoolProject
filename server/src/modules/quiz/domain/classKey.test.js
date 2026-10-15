import { describe, expect, it } from "@jest/globals";
import { classKey } from "./classKey.js";

describe("classKey", () => {
  it.each([
    ["Class 8", "8"],
    ["class 8", "8"],
    ["8", "8"],
    ["8th", "8"],
    ["10th", "10"],
    ["Class-10", "10"],
    ["class_1", "1"],
    ["1st", "1"],
    ["2nd", "2"],
    ["3rd", "3"],
    [" Class  5 ", "5"],
    ["Grade 7", "7"],
    ["৮", "8"],
    ["শ্রেণি ১০", "10"],
    [8, "8"],
    ["Play", "play"],
    ["Nursery", "nursery"],
    ["KG", "kg"],
  ])("maps %j to %j", (name, key) => {
    expect(classKey(name)).toBe(key);
  });

  it.each([null, undefined, "", "Class", "Class 13", "0", "Six", "8a"])("returns null for %j", (name) => {
    expect(classKey(name)).toBeNull();
  });
});
