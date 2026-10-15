import { describe, expect, it } from "vitest";
import { usageSummary } from "./branchUsage";

const t = (key) =>
  ({
    "usage.students": "{count} students",
    "usage.admins": "{count} admins",
    "usage.invoices": "{count} fee invoices",
    "usage.applications": "{count} applications",
    "usage.websiteItems": "{count} website items",
  })[key];

describe("usageSummary", () => {
  it("lists what is left, skipping zeros", () => {
    expect(usageSummary({ students: 120, teachers: 0, admins: 2, invoices: 340 }, t)).toBe("120 students, 2 admins, 340 fee invoices");
  });

  it("includes applications and the branch's website content", () => {
    expect(usageSummary({ students: 0, applications: 3, websiteItems: 5 }, t)).toBe("3 applications, 5 website items");
  });

  it("is empty without counts", () => {
    expect(usageSummary(undefined, t)).toBe("");
  });
});
