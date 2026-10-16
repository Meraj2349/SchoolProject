import { describe, expect, it } from "vitest";
import { EMPTY_APPLICATION, MAX_CV_BYTES, cvProblem, toApplicationFormData, validateApplication } from "./applyForm";

const valid = { ...EMPTY_APPLICATION, post_index: "0", full_name: "Nusrat Jahan", phone: "০১৭১২-৩৪৫৬৭৮", education: "MA", address: "Natiapara" };

describe("validateApplication", () => {
  it("accepts a complete form, with Bangla digits in the mobile number", () => {
    expect(validateApplication(valid)).toEqual({});
  });

  it("marks what is missing or wrong", () => {
    expect(validateApplication({ ...EMPTY_APPLICATION, phone: "12345", email: "nope" })).toEqual({
      post_index: "required",
      full_name: "required",
      phone: "phoneInvalid",
      email: "emailInvalid",
      education: "required",
      address: "required",
    });
  });
});

describe("cvProblem", () => {
  it("allows a PDF, JPG or PNG up to 5 MB, and no file", () => {
    expect(cvProblem(null)).toBeNull();
    expect(cvProblem({ name: "cv.PDF", type: "application/pdf", size: 1000 })).toBeNull();
    expect(cvProblem({ name: "cv.png", type: "image/png", size: MAX_CV_BYTES })).toBeNull();
  });

  it("names the problem otherwise", () => {
    expect(cvProblem({ name: "cv.docx", type: "application/msword", size: 1000 })).toBe("cvWrongType");
    expect(cvProblem({ name: "cv.pdf", type: "application/pdf", size: MAX_CV_BYTES + 1 })).toBe("cvTooLarge");
  });
});

describe("toApplicationFormData", () => {
  it("sends the trimmed fields, the circular, the hidden field and the CV when chosen", () => {
    const cv = new File(["%PDF"], "cv.pdf", { type: "application/pdf" });
    const body = toApplicationFormData({ ...valid, full_name: "  Nusrat Jahan " }, 3, cv);

    expect(body.get("circular_id")).toBe("3");
    expect(body.get("full_name")).toBe("Nusrat Jahan");
    expect(body.get("website")).toBe("");
    expect(body.get("cv")).toBeInstanceOf(File);
    expect(toApplicationFormData(valid, 3, null).has("cv")).toBe(false);
  });
});
