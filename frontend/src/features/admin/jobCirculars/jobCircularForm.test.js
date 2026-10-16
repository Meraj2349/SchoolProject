import { describe, expect, it } from "vitest";
import { EMPTY_POST, emptyCircular, toCircularFormData, toFormValues, validateCircularForm } from "./jobCircularForm";

const EMPTY_CIRCULAR = emptyCircular();

const valid = {
  ...EMPTY_CIRCULAR,
  title_en: "Urgent recruitment",
  title_bn: "জরুরি নিয়োগ বিজ্ঞপ্তি",
  circular_date: "2026-10-01",
  posts: [{ ...EMPTY_POST, title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: "1", salary_min: "10000", salary_max: "20000" }],
};

describe("validateCircularForm", () => {
  it("accepts a complete circular", () => {
    expect(validateCircularForm(valid)).toEqual({});
  });

  it("names the broken fields, including each post's", () => {
    const errors = validateCircularForm({
      ...valid,
      title_bn: "",
      deadline: "2026-09-01",
      posts: [{ ...valid.posts[0], title_bn: "", vacancies: "0" }, { ...valid.posts[0], salary_min: "30000" }],
    });
    expect(errors).toEqual({ title_bn: "required", deadline: "deadlineBeforeDate", "posts.0.title_bn": "required", "posts.0.vacancies": "vacancies", "posts.1.salary_max": "salary" });
  });

  it("needs at least one post", () => {
    expect(validateCircularForm({ ...valid, posts: [] })).toEqual({ posts: "postsRequired" });
  });
});

describe("toCircularFormData", () => {
  it("sends the posts as JSON with numbers, flags as text, and the poster only when chosen", () => {
    const body = toCircularFormData({ ...valid, is_open: false }, null);
    expect(JSON.parse(body.get("posts"))).toEqual([
      { title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1, qualification_en: "", qualification_bn: "", salary_min: 10000, salary_max: 20000 },
    ]);
    expect(body.get("is_open")).toBe("false");
    expect(body.get("deadline")).toBe("");
    expect(body.has("poster")).toBe(false);

    const poster = new File(["%PDF"], "c.pdf", { type: "application/pdf" });
    expect(toCircularFormData(valid, poster).get("poster")).toBeInstanceOf(File);
  });

  it("sends an empty salary as empty", () => {
    const body = toCircularFormData({ ...valid, posts: [{ ...valid.posts[0], salary_min: "", salary_max: "" }] }, null);
    expect(JSON.parse(body.get("posts"))[0]).toMatchObject({ salary_min: null, salary_max: null });
  });
});

describe("toFormValues", () => {
  it("turns a saved circular back into form text", () => {
    const values = toFormValues({ id: 3, title_en: "A", title_bn: "B", circular_date: "2026-10-01", deadline: null, posts: [{ title_en: "X", title_bn: "Y", vacancies: 2, salary_min: null }], is_open: true, is_published: false });
    expect(values).toMatchObject({ title_en: "A", deadline: "", is_open: true, is_published: false });
    expect(values.posts[0]).toEqual({ ...EMPTY_POST, title_en: "X", title_bn: "Y", vacancies: "2" });
  });
});

describe("emptyCircular", () => {
  it("dates a new circular today in Bangladesh, worked out when the form opens", () => {
    expect(emptyCircular(new Date("2026-10-16T20:30:00Z")).circular_date).toBe("2026-10-17");
    expect(emptyCircular().posts).toEqual([EMPTY_POST]);
  });
});
