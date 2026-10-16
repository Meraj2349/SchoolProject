import { describe, expect, it } from "vitest";
import { salaryText, splitCirculars, totalVacancies } from "./jobCirculars";

const t = (key) => ({ salaryRange: "{min} – {max} Tk", salaryFrom: "From {min} Tk", salaryUpTo: "Up to {max} Tk", negotiable: "Negotiable" })[key];
const tBn = (key) => ({ salaryRange: "{min} – {max} টাকা", salaryFrom: "{min} টাকা থেকে", salaryUpTo: "সর্বোচ্চ {max} টাকা", negotiable: "আলোচনা সাপেক্ষে" })[key];

describe("salaryText", () => {
  it("shows the range, one end, or negotiable, in the reader's digits", () => {
    expect(salaryText({ salary_min: 10000, salary_max: 20000 }, "en", t)).toBe("10,000 – 20,000 Tk");
    expect(salaryText({ salary_min: 10000, salary_max: 20000 }, "bn", tBn)).toBe("১০,০০০ – ২০,০০০ টাকা");
    expect(salaryText({ salary_min: 8000, salary_max: null }, "en", t)).toBe("From 8,000 Tk");
    expect(salaryText({ salary_max: 15000 }, "en", t)).toBe("Up to 15,000 Tk");
    expect(salaryText({}, "bn", tBn)).toBe("আলোচনা সাপেক্ষে");
  });
});

describe("totalVacancies", () => {
  it("adds up the posts", () => {
    expect(totalVacancies({ posts: [{ vacancies: 1 }, { vacancies: 3 }] })).toBe(4);
    expect(totalVacancies({})).toBe(0);
  });
});

describe("splitCirculars", () => {
  it("puts circulars taking applications first and the rest under past", () => {
    const list = [{ id: 1, accepting: false }, { id: 2, accepting: true }, { id: 3, accepting: false }];
    expect(splitCirculars(list)).toEqual({ open: [{ id: 2, accepting: true }], past: [{ id: 1, accepting: false }, { id: 3, accepting: false }] });
  });
});
