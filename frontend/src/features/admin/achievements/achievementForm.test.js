import { describe, expect, it } from "vitest";
import { EMPTY_ACHIEVEMENT, toAchievementFormData, toFormValues, validateAchievementForm } from "./achievementForm";

const SPORTS = { ...EMPTY_ACHIEVEMENT, title_en: "Football", title_bn: "ফুটবল", category: "sports", year: "2025" };
const SSC = { ...SPORTS, category: "board_result", exam_name: "SSC", examinees: "120", passed: "118", gpa5: "42" };

describe("achievement form", () => {
  it("starts as a published, not featured achievement of this year", () => {
    expect(EMPTY_ACHIEVEMENT).toMatchObject({ is_published: true, is_featured: false, year: String(new Date().getFullYear()) });
  });

  it("accepts a complete achievement", () => {
    expect(validateAchievementForm(SPORTS)).toEqual({});
    expect(validateAchievementForm(SSC)).toEqual({});
  });

  it("needs both titles, a category and a valid year", () => {
    expect(validateAchievementForm({ ...SPORTS, title_en: " ", title_bn: "", category: "", year: "20x5" })).toEqual({
      title_en: "required",
      title_bn: "required",
      category: "required",
      year: "invalidYear",
    });
  });

  it("checks a board result's exam and numbers", () => {
    expect(validateAchievementForm({ ...SSC, exam_name: "" })).toEqual({ exam_name: "required" });
    expect(validateAchievementForm({ ...SSC, passed: "130" })).toEqual({ passed: "resultNumbers" });
    expect(validateAchievementForm({ ...SSC, gpa5: "119" })).toEqual({ gpa5: "resultNumbers" });
    expect(validateAchievementForm({ ...SSC, examinees: "0" })).toEqual({ examinees: "resultNumbers" });
  });

  it("ignores result numbers for other categories", () => {
    expect(validateAchievementForm({ ...SPORTS, examinees: "abc" })).toEqual({});
  });

  it("sends a form with the photo, and result numbers only for a board result", () => {
    const photo = new File(["x"], "a.png", { type: "image/png" });

    const ssc = Object.fromEntries(toAchievementFormData(SSC, photo));
    const sports = Object.fromEntries(toAchievementFormData({ ...SPORTS, examinees: "5", is_featured: true }, null));

    expect(ssc).toMatchObject({ title_en: "Football", category: "board_result", exam_name: "SSC", examinees: "120", is_published: "true", image: photo });
    expect(sports).toMatchObject({ is_featured: "true" });
    expect(sports).not.toHaveProperty("examinees");
    expect(sports).not.toHaveProperty("image");
  });

  it("fills the form from a saved achievement", () => {
    const values = toFormValues({ ...SSC, year: 2025, examinees: 120, passed: 118, gpa5: 42, is_featured: 1, is_published: 0, description_en: null });

    expect(values).toMatchObject({ year: "2025", examinees: "120", is_featured: true, is_published: false, description_en: "" });
  });
});
