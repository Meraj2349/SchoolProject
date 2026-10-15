import { describe, expect, it } from "vitest";
import { classLabel, classesOf, hasBangla, localize, sectionsOf } from "./quizText";

const question = {
  id: 1,
  prompt: "What type of mirror?",
  options: { B: "Convex", A: "Concave", C: "Plain", D: "Convergent" },
  promptBn: "কোন দর্পণ?",
  optionsBn: { A: "অবতল", B: "উত্তল", C: "সমতল", D: "অভিসারী" },
};

describe("localize", () => {
  it("gives the Bangla text and options in A–D order", () => {
    expect(localize(question, "bn")).toEqual({
      prompt: "কোন দর্পণ?",
      options: [
        { letter: "A", text: "অবতল" },
        { letter: "B", text: "উত্তল" },
        { letter: "C", text: "সমতল" },
        { letter: "D", text: "অভিসারী" },
      ],
    });
  });

  it("gives English when asked", () => {
    expect(localize(question, "en").options[1]).toEqual({ letter: "B", text: "Convex" });
  });

  it("falls back to English when there is no Bangla", () => {
    const englishOnly = { ...question, promptBn: null, optionsBn: null };

    expect(localize(englishOnly, "bn").prompt).toBe("What type of mirror?");
    expect(hasBangla(englishOnly)).toBe(false);
    expect(hasBangla(question)).toBe(true);
  });

  it("copes with a missing question", () => {
    expect(localize(undefined, "en")).toEqual({ prompt: "", options: [] });
  });
});

describe("classLabel", () => {
  it.each([
    ["8", "en", "Class 8"],
    ["10", "bn", "দশম শ্রেণি"],
    ["8", "bn", "অষ্টম শ্রেণি"],
    ["nursery", "en", "Nursery"],
    ["kg", "bn", "কেজি"],
    [null, "en", ""],
  ])("labels %j in %s as %j", (key, language, label) => {
    expect(classLabel(key, language)).toBe(label);
  });
});

describe("class and section lists", () => {
  const classes = [
    { ClassName: "Class 10", Section: "Good" },
    { ClassName: "Class 8", Section: "Good" },
    { ClassName: "Class 8", Section: "Better" },
    { ClassName: "Class 9", Section: "General" },
  ];

  it("lists class names in class order", () => {
    expect(classesOf(classes)).toEqual(["Class 8", "Class 9", "Class 10"]);
  });

  it("lists the sections of one class", () => {
    expect(sectionsOf(classes, "Class 8")).toEqual(["Better", "Good"]);
    expect(sectionsOf(classes, "")).toEqual([]);
  });
});
