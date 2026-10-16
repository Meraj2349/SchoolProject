import { describe, expect, it } from "vitest";
import { gradeFor } from "./grades";

describe("gradeFor", () => {
  it("grades by percentage of the total", () => {
    expect(gradeFor(95)).toEqual({ grade: "A+", tone: "excellent" });
    expect(gradeFor(40, 50)).toEqual({ grade: "A", tone: "excellent" });
    expect(gradeFor("72", "100")).toEqual({ grade: "B+", tone: "good" });
    expect(gradeFor(35)).toEqual({ grade: "D", tone: "poor" });
    expect(gradeFor(10)).toEqual({ grade: "F", tone: "poor" });
  });

  it("treats a missing total as 100 and missing marks as no grade", () => {
    expect(gradeFor(55, null).grade).toBe("C+");
    expect(gradeFor(null)).toEqual({ grade: "–", tone: "none" });
    expect(gradeFor("abc").grade).toBe("–");
  });
});
