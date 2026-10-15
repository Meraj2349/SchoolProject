import { describe, expect, it } from "vitest";
import { fillTemplate } from "./template";

describe("fillTemplate", () => {
  it("replaces named placeholders", () => {
    expect(fillTemplate("{count} of {total} present", { count: 9, total: 10 })).toBe("9 of 10 present");
  });

  it("leaves unknown placeholders as they are", () => {
    expect(fillTemplate("{a} {b}", { a: 1 })).toBe("1 {b}");
  });
});
