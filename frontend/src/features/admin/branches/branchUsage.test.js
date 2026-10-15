import { describe, expect, it } from "vitest";
import { usageSummary } from "./branchUsage";

const t = (key) => ({ "usage.students": "{count} students", "usage.admins": "{count} admins", "usage.invoices": "{count} fee invoices" })[key];

describe("usageSummary", () => {
  it("lists what is left, skipping zeros", () => {
    expect(usageSummary({ students: 120, teachers: 0, admins: 2, invoices: 340 }, t)).toBe("120 students, 2 admins, 340 fee invoices");
  });

  it("is empty without counts", () => {
    expect(usageSummary(undefined, t)).toBe("");
  });
});
