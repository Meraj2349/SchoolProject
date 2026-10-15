import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { toBranchUpdate, toNewBranch } from "./branch.entity.js";

describe("toNewBranch", () => {
  it("requires at least one name", () => {
    expect(() => toNewBranch({})).toThrow(ValidationError);
    expect(() => toNewBranch({ name_bn: "", name_en: "" })).toThrow(
      expect.objectContaining({ code: "branch_name_required" }),
    );
  });

  it("accepts a branch with only an English or only a Bangla name", () => {
    expect(toNewBranch({ name_en: "Main" }).name_en).toBe("Main");
    expect(toNewBranch({ name_bn: "প্রধান" }).name_bn).toBe("প্রধান");
  });

  it("fills missing optional fields with null and is_proposed with false", () => {
    expect(toNewBranch({ name_en: "Main" })).toEqual({
      name_bn: null,
      name_en: "Main",
      description_bn: null,
      description_en: null,
      latitude: null,
      longitude: null,
      address_bn: null,
      address_en: null,
      is_proposed: false,
      established_date: null,
    });
  });

  it("parses form-data strings into numbers and booleans", () => {
    const branch = toNewBranch({
      name_en: "Main",
      latitude: "23.81",
      longitude: "90.41",
      is_proposed: "true",
    });

    expect(branch.latitude).toBe(23.81);
    expect(branch.longitude).toBe(90.41);
    expect(branch.is_proposed).toBe(true);
  });

  it("treats empty coordinate strings from the form as missing, not NaN", () => {
    const branch = toNewBranch({ name_en: "Main", latitude: "", longitude: "" });

    expect(branch.latitude).toBeNull();
    expect(branch.longitude).toBeNull();
  });

  it("ignores fields that are not part of a branch", () => {
    expect(toNewBranch({ name_en: "Main", id: 9, role: "x" })).not.toHaveProperty("role");
  });
});

describe("toBranchUpdate", () => {
  it("keeps only the fields that were sent", () => {
    expect(toBranchUpdate({ name_en: "New", address_bn: undefined })).toEqual({
      name_en: "New",
    });
  });

  it("returns an empty object when nothing was sent", () => {
    expect(toBranchUpdate({})).toEqual({});
  });

  it("parses form-data strings into numbers and booleans", () => {
    expect(
      toBranchUpdate({ latitude: "1.5", longitude: "2", is_proposed: "false" }),
    ).toEqual({ latitude: 1.5, longitude: 2, is_proposed: false });
  });

  it("ignores fields that are not part of a branch", () => {
    expect(toBranchUpdate({ image_url: "x", id: 3 })).toEqual({});
  });
});
