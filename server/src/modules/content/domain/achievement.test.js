import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { achievement } from "./achievement.js";

const invalid = (code) => new ValidationError(code);
const SPORTS = { title_en: " Football champions ", title_bn: "ফুটবল চ্যাম্পিয়ন", category: "sports", year: "2025" };
const SSC = { ...SPORTS, title_en: "SSC 2025", category: "board_result", exam_name: "SSC", examinees: "120", passed: "118", gpa5: "42" };

describe("achievement", () => {
  it("takes the titles, category and year; published, not featured, by default", () => {
    expect(achievement.toNew(SPORTS)).toEqual({
      title_en: "Football champions",
      title_bn: "ফুটবল চ্যাম্পিয়ন",
      description_en: null,
      description_bn: null,
      category: "sports",
      year: 2025,
      is_featured: false,
      is_published: true,
      exam_name: null,
      examinees: null,
      passed: null,
      gpa5: null,
      image_url: null,
    });
  });

  it("reads featured and published from a form", () => {
    expect(achievement.toNew({ ...SPORTS, is_featured: "true", is_published: "false" })).toMatchObject({
      is_featured: true,
      is_published: false,
    });
  });

  it("needs both titles, a known category and a sensible year", () => {
    expect(() => achievement.toNew({ ...SPORTS, title_bn: " " })).toThrow(invalid("achievement_title_required"));
    expect(() => achievement.toNew({ ...SPORTS, category: "party" })).toThrow(invalid("achievement_category_invalid"));
    for (const year of ["", "1900", "2999", "20x5"]) {
      expect(() => achievement.toNew({ ...SPORTS, year })).toThrow(invalid("achievement_year_invalid"));
    }
  });

  it("keeps the numbers of a board result", () => {
    expect(achievement.toNew(SSC)).toMatchObject({ exam_name: "SSC", examinees: 120, passed: 118, gpa5: 42 });
  });

  it("needs the exam and consistent numbers for a board result", () => {
    expect(() => achievement.toNew({ ...SSC, exam_name: "" })).toThrow(invalid("achievement_exam_required"));
    for (const numbers of [{ examinees: "0" }, { passed: "121" }, { gpa5: "119" }, { passed: "-1" }, { gpa5: "x" }]) {
      expect(() => achievement.toNew({ ...SSC, ...numbers })).toThrow(invalid("achievement_result_numbers_invalid"));
    }
  });

  it("drops result numbers from other categories", () => {
    expect(achievement.toNew({ ...SPORTS, exam_name: "SSC", examinees: "5" })).toMatchObject({ exam_name: null, examinees: null });
  });

  it("takes the image only from the upload, keeping the current one on edit", () => {
    expect(achievement.toNew({ ...SPORTS, image_url: "/uploads/achievements/a.png" }).image_url).toBe("/uploads/achievements/a.png");
    expect(achievement.toChanges(SPORTS, { image_url: "/old.png" }).image_url).toBe("/old.png");
    expect(achievement.toChanges({ ...SPORTS, image_url: "/new.png" }, { image_url: "/old.png" }).image_url).toBe("/new.png");
  });

  it("keeps whether it is published and featured when an edit leaves them out", () => {
    const existing = { image_url: null, is_published: 0, is_featured: 1 };

    expect(achievement.toChanges(SPORTS, existing)).toMatchObject({ is_published: false, is_featured: true });
    expect(achievement.toChanges({ ...SPORTS, is_published: "true", is_featured: "false" }, existing)).toMatchObject({
      is_published: true,
      is_featured: false,
    });
  });

  it("publishes or unpublishes with a true/false value", () => {
    expect(achievement.toVisibility({ is_published: false })).toEqual({ is_published: false });
    expect(() => achievement.toVisibility({ is_published: "no" })).toThrow(invalid("achievement_invalid_publish"));
  });
});
