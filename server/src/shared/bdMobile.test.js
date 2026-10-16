import { describe, expect, it } from "@jest/globals";
import { normalizeBdMobile } from "./bdMobile.js";

describe("normalizeBdMobile", () => {
  it.each([
    ["01711000001", "01711000001"],
    ["০১৭১১-০০০০০১", "01711000001"],
    ["+880 1711 000001", "01711000001"],
    ["8801711000001", "01711000001"],
  ])("reads %p as %p", (input, mobile) => expect(normalizeBdMobile(input)).toBe(mobile));

  it.each(["0171100000", "01211000001", "", null, 1711000001, "01711000001x"])("is null for %p", (input) =>
    expect(normalizeBdMobile(input)).toBeNull(),
  );
});
