import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { isAcceptingApplications, jobCircular, schoolToday } from "./jobCircular.js";

const invalid = (code) => new ValidationError(code);
const POST = { title_en: " Accountant ", title_bn: "অ্যাকাউন্টেন্ট", vacancies: "1", qualification_en: "Honours/Masters (Accounting)", qualification_bn: "স্নাতক সম্মান/স্নাতকোত্তর (অ্যাকাউন্টিং)", salary_min: "10000", salary_max: "20000" };
const CIRCULAR = { title_en: "Urgent recruitment", title_bn: "জরুরি নিয়োগ বিজ্ঞপ্তি", circular_date: "2025-06-28", posts: [POST] };

describe("jobCircular", () => {
  it("takes the titles, date and posts; open and published by default", () => {
    expect(jobCircular.toNew(CIRCULAR)).toEqual({
      title_en: "Urgent recruitment",
      title_bn: "জরুরি নিয়োগ বিজ্ঞপ্তি",
      circular_date: "2025-06-28",
      deadline: null,
      how_to_apply_en: null,
      how_to_apply_bn: null,
      posts: JSON.stringify([{ title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1, qualification_en: "Honours/Masters (Accounting)", qualification_bn: "স্নাতক সম্মান/স্নাতকোত্তর (অ্যাকাউন্টিং)", salary_min: 10000, salary_max: 20000 }]),
      is_open: true,
      is_published: true,
      image_url: null,
    });
  });

  it("reads posts sent as JSON text by a multipart form, and flags as strings", () => {
    const row = jobCircular.toNew({ ...CIRCULAR, posts: JSON.stringify([POST]), is_open: "false", is_published: "false" });
    expect(JSON.parse(row.posts)).toHaveLength(1);
    expect(row).toMatchObject({ is_open: false, is_published: false });
  });

  it("allows a post without salary or qualification text", () => {
    const row = jobCircular.toNew({ ...CIRCULAR, posts: [{ title_en: "Guard", title_bn: "প্রহরী", vacancies: 2 }] });
    expect(JSON.parse(row.posts)[0]).toEqual({ title_en: "Guard", title_bn: "প্রহরী", vacancies: 2, qualification_en: null, qualification_bn: null, salary_min: null, salary_max: null });
  });

  it.each([
    [{ ...CIRCULAR, title_bn: " " }, "job_circular_title_required"],
    [{ ...CIRCULAR, circular_date: "28-06-2025" }, "job_circular_date_invalid"],
    [{ ...CIRCULAR, circular_date: "2025-02-30" }, "job_circular_date_invalid"],
    [{ ...CIRCULAR, deadline: "2025-06-01" }, "job_circular_deadline_before_date"],
    [{ ...CIRCULAR, deadline: "soon" }, "job_circular_date_invalid"],
    [{ ...CIRCULAR, posts: [] }, "job_circular_posts_required"],
    [{ ...CIRCULAR, posts: "not json" }, "job_circular_posts_required"],
    [{ ...CIRCULAR, posts: Array(21).fill(POST) }, "job_circular_posts_required"],
    [{ ...CIRCULAR, posts: [{ ...POST, title_en: "" }] }, "job_circular_post_invalid"],
    [{ ...CIRCULAR, posts: [{ ...POST, vacancies: "0" }] }, "job_circular_post_invalid"],
    [{ ...CIRCULAR, posts: [{ ...POST, vacancies: "1.5" }] }, "job_circular_post_invalid"],
    [{ ...CIRCULAR, posts: [{ ...POST, salary_min: "30000" }] }, "job_circular_salary_invalid"],
    [{ ...CIRCULAR, posts: [{ ...POST, salary_max: "-5" }] }, "job_circular_salary_invalid"],
  ])("refuses %o with %s", (input, code) => {
    expect(() => jobCircular.toNew(input)).toThrow(invalid(code));
  });

  it("keeps the poster and flags an edit leaves out", () => {
    const existing = { image_url: "/uploads/job-circulars/a.pdf", is_open: 0, is_published: 1 };
    expect(jobCircular.toChanges(CIRCULAR, existing)).toMatchObject({ image_url: "/uploads/job-circulars/a.pdf", is_open: false, is_published: true });
    expect(jobCircular.toChanges({ ...CIRCULAR, image_url: "/uploads/job-circulars/b.png", is_open: "true" }, existing)).toMatchObject({ image_url: "/uploads/job-circulars/b.png", is_open: true });
  });

  it("toggles publishing with a real boolean only", () => {
    expect(jobCircular.toVisibility({ is_published: false })).toEqual({ is_published: false });
    expect(() => jobCircular.toVisibility({ is_published: "no" })).toThrow(invalid("job_circular_invalid_publish"));
  });

  it("shows visitors whether it takes applications, with posts as a list", () => {
    const row = { id: 1, posts: JSON.stringify([POST]), is_open: 1, is_published: 1, deadline: null };
    expect(jobCircular.present(row, "2026-10-16")).toMatchObject({ accepting: true, is_open: true, posts: [POST] });
  });
});

describe("isAcceptingApplications", () => {
  const open = { is_open: 1, is_published: 1, deadline: "2026-10-20" };
  it("is open while published, marked open and not past the last date", () => {
    expect(isAcceptingApplications(open, "2026-10-20")).toBe(true);
    expect(isAcceptingApplications({ ...open, deadline: null }, "2030-01-01")).toBe(true);
  });
  it.each([
    [{ ...open, deadline: "2026-10-19" }, "past the last date"],
    [{ ...open, is_open: 0 }, "closed"],
    [{ ...open, is_published: 0 }, "hidden"],
  ])("is closed when %o (%s)", (circular) => {
    expect(isAcceptingApplications(circular, "2026-10-20")).toBe(false);
  });
});

describe("schoolToday", () => {
  it("is the date in Bangladesh", () => {
    expect(schoolToday(new Date("2026-10-16T20:30:00Z"))).toBe("2026-10-17"); // 02:30 in Dhaka
  });
});
