import { describe, expect, it } from "vitest";
import { formatTaka } from "./money";

describe("formatTaka", () => {
  it("formats taka with lakh grouping and two decimals", () => {
    expect(formatTaka(123456.5, "en")).toBe("৳1,23,456.50");
  });

  it("uses Bangla digits in Bangla", () => {
    expect(formatTaka(123456.5, "bn")).toBe("৳১,২৩,৪৫৬.৫০");
  });

  it("accepts the decimal strings MySQL returns", () => {
    expect(formatTaka("1500.00", "en")).toBe("৳1,500.00");
  });

  it("shows negative amounts (discounts) with a minus sign", () => {
    expect(formatTaka(-250, "en")).toBe("-৳250.00");
  });

  it("shows a dash for missing values", () => {
    expect(formatTaka(null, "en")).toBe("—");
    expect(formatTaka("abc", "en")).toBe("—");
  });
});
