import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_CATEGORIES, passRate, resultSummary } from "./achievements";

describe("achievement helpers", () => {
  it("knows the categories in display order", () => {
    expect(ACHIEVEMENT_CATEGORIES).toEqual(["board_result", "academic", "sports", "cultural", "competition", "award"]);
  });

  it("works out the pass rate to one decimal place", () => {
    expect(passRate({ examinees: 120, passed: 118 })).toBe(98.3);
    expect(passRate({ examinees: "50", passed: "50" })).toBe(100);
  });

  it("has no pass rate without examinees", () => {
    expect(passRate({ examinees: 0, passed: 0 })).toBeNull();
    expect(passRate({ examinees: null, passed: null })).toBeNull();
    expect(passRate({ examinees: "", passed: "3" })).toBeNull();
  });

  it("summarises a board result, or nothing for other achievements", () => {
    const t = (key) => ({ passRate: "{rate}% pass", gpa5: "{count} GPA-5" })[key];

    expect(resultSummary({ category: "board_result", examinees: 120, passed: 118, gpa5: 42 }, t)).toBe("98.3% pass · 42 GPA-5");
    expect(resultSummary({ category: "sports" }, t)).toBe("");
  });

  it("writes the numbers the reader's way", () => {
    const t = (key) => ({ passRate: "{rate}% পাস", gpa5: "জিপিএ-৫: {count}" })[key];
    const bangla = (n) => new Intl.NumberFormat("bn-BD").format(n);

    expect(resultSummary({ category: "board_result", examinees: 120, passed: 118, gpa5: 42 }, t, bangla)).toBe("৯৮.৩% পাস · জিপিএ-৫: ৪২");
  });
});
