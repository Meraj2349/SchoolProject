import { describe, expect, it } from "vitest";
import { branchName } from "./branches";

describe("branchName", () => {
  it("names a branch in the reader's language", () => {
    const branch = { id: 1, nameBn: "প্রধান শাখা", nameEn: "Main Campus" };

    expect(branchName(branch, "bn")).toBe("প্রধান শাখা");
    expect(branchName(branch, "en")).toBe("Main Campus");
  });

  it("falls back to the other language when one name is missing", () => {
    expect(branchName({ id: 1, nameBn: "", nameEn: "Main Campus" }, "bn")).toBe("Main Campus");
    expect(branchName({ id: 1, nameBn: "প্রধান শাখা", nameEn: null }, "en")).toBe("প্রধান শাখা");
  });

  it("reads the branches list's snake_case names too", () => {
    expect(branchName({ id: 2, name_bn: "উত্তর শাখা", name_en: "North" }, "bn")).toBe("উত্তর শাখা");
  });

  it("is empty without a branch", () => {
    expect(branchName(null, "en")).toBe("");
  });
});
