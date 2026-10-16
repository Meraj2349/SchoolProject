import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { STATUSES, toNewJobApplication, toStatus } from "./jobApplication.js";

const invalid = (code) => new ValidationError(code);
const CIRCULAR = {
  id: 3,
  branch_id: 1,
  posts: [
    { title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1 },
    { title_en: "Assistant Teacher", title_bn: "সহকারি শিক্ষক", vacancies: 2 },
  ],
};
const FORM = { post_index: "1", full_name: "  Nusrat Jahan ", phone: "+880 1712-345678", education: "MA (Bangla)", address: "Natiapara, Delduar" };

describe("toNewJobApplication", () => {
  it("files the application under the circular's branch, with the post's names copied", () => {
    expect(toNewJobApplication(FORM, CIRCULAR)).toEqual({
      circular_id: 3,
      post_index: 1,
      post_title_en: "Assistant Teacher",
      post_title_bn: "সহকারি শিক্ষক",
      full_name: "Nusrat Jahan",
      phone: "01712345678",
      email: null,
      address: "Natiapara, Delduar",
      education: "MA (Bangla)",
      experience: null,
      branch_id: 1,
    });
  });

  it("keeps an email and experience when given", () => {
    expect(toNewJobApplication({ ...FORM, email: " NJ@Example.com ", experience: "3 years" }, CIRCULAR)).toMatchObject({ email: "nj@example.com", experience: "3 years" });
  });

  it("reads Bangla digits in the mobile number", () => {
    expect(toNewJobApplication({ ...FORM, phone: "০১৭১২৩৪৫৬৭৮" }, CIRCULAR).phone).toBe("01712345678");
  });

  it.each([
    [{ ...FORM, full_name: " " }, "job_application_required"],
    [{ ...FORM, education: "" }, "job_application_required"],
    [{ ...FORM, address: undefined }, "job_application_required"],
    [{ ...FORM, phone: "12345" }, "job_application_phone_invalid"],
    [{ ...FORM, phone: "02712345678" }, "job_application_phone_invalid"],
    [{ ...FORM, email: "not-an-email" }, "job_application_email_invalid"],
    [{ ...FORM, post_index: "2" }, "job_application_post_invalid"],
    [{ ...FORM, post_index: "-1" }, "job_application_post_invalid"],
    [{ ...FORM, post_index: "" }, "job_application_post_invalid"],
    [{ ...FORM, full_name: "x".repeat(151) }, "job_application_too_long"],
    [{ ...FORM, address: "x".repeat(1001) }, "job_application_too_long"],
    [{ ...FORM, experience: "x".repeat(2001) }, "job_application_too_long"],
  ])("refuses %o with %s", (input, code) => {
    expect(() => toNewJobApplication(input, CIRCULAR)).toThrow(invalid(code));
  });
});

describe("toStatus", () => {
  it("accepts the four statuses only", () => {
    expect(STATUSES).toEqual(["new", "shortlisted", "rejected", "hired"]);
    expect(toStatus("hired")).toBe("hired");
    expect(() => toStatus("accepted")).toThrow(invalid("job_application_invalid_status"));
  });
});
