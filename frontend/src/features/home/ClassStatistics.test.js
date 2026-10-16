import { describe, expect, it } from "vitest";
import { className } from "./ClassStatistics";

describe("class names on the home page", () => {
  it("names numbered classes in the reader's language", () => {
    expect(className("Class 10", "bn")).toBe("দশম শ্রেণি");
    expect(className("3", "bn")).toBe("তৃতীয় শ্রেণি");
    expect(className("Class 10", "en")).toBe("Class 10");
    expect(className("5", "en")).toBe("Class 5");
  });

  it("keeps other class names", () => {
    expect(className("KG", "bn")).toBe("Kg");
    expect(className("", "en")).toBe("Unknown");
  });
});
