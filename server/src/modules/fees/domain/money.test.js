import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { fromPoisha, parseAmount, sumTaka, toPoisha } from "./money.js";

describe("toPoisha / fromPoisha", () => {
  it("converts taka to whole poisha and back without float drift", () => {
    expect(toPoisha(0.1) + toPoisha(0.2)).toBe(30);
    expect(fromPoisha(toPoisha(0.1) + toPoisha(0.2))).toBe(0.3);
  });

  it("accepts the decimal strings the database returns", () => {
    expect(toPoisha("1250.50")).toBe(125050);
  });
});

describe("sumTaka", () => {
  it("adds amounts exactly", () => {
    expect(sumTaka([0.1, 0.2, "1000.70"])).toBe(1001);
  });

  it("is zero for an empty list", () => {
    expect(sumTaka([])).toBe(0);
  });
});

describe("parseAmount", () => {
  it("parses numbers and numeric strings", () => {
    expect(parseAmount("1500", "code")).toBe(1500);
    expect(parseAmount(99.5, "code")).toBe(99.5);
  });

  it("rejects missing, negative, non-numeric and over-precise amounts with the given code", () => {
    for (const bad of [undefined, null, "", "abc", -1, "10.555", Infinity]) {
      expect(() => parseAmount(bad, "fee_amount_invalid")).toThrow(
        expect.objectContaining({ code: "fee_amount_invalid" }),
      );
    }
    expect(() => parseAmount(-1, "x")).toThrow(ValidationError);
  });

  it("allows zero", () => {
    expect(parseAmount(0, "code")).toBe(0);
  });
});
