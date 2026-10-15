import { describe, expect, it } from "vitest";
import { classKeyOf } from "./schoolClass";

describe("classKeyOf", () => {
  it.each([
    ["Class 8", "8"],
    ["8", "8"],
    ["10th", "10"],
    ["শ্রেণি ১০", "10"],
    ["KG", "kg"],
    ["Nursery", "nursery"],
  ])("maps %j to %j", (name, key) => {
    expect(classKeyOf(name)).toBe(key);
  });

  it.each([null, "", "Class 13", "Six"])("returns null for %j", (name) => {
    expect(classKeyOf(name)).toBeNull();
  });
});
