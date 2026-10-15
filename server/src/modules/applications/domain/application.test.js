import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { studentOf, toNewApplication, toStatus } from "./application.js";

const FORM = {
  applicant_name: " Nusrat Jahan ",
  date_of_birth: "2016-03-03",
  gender: "female",
  applying_for_class: "Class 3",
  parent_name: "Jahan",
  parent_contact: "01700000000",
  branch_id: "2",
};

describe("admission application", () => {
  it("takes the form, with optional details left empty", () => {
    expect(toNewApplication(FORM)).toEqual({
      applicant_name: "Nusrat Jahan",
      date_of_birth: "2016-03-03",
      gender: "female",
      applying_for_class: "Class 3",
      previous_school: null,
      previous_class: null,
      parent_name: "Jahan",
      parent_contact: "01700000000",
      parent_email: null,
      address: null,
      additional_info: null,
      branch_id: 2,
    });
  });

  it("needs the required details", () => {
    expect(() => toNewApplication({ ...FORM, parent_contact: "" })).toThrow(new ValidationError("application_all_required"));
    expect(() => toNewApplication({ ...FORM, gender: "robot" })).toThrow(new ValidationError("application_all_required"));
  });

  it("needs the branch applied to", () => {
    expect(() => toNewApplication({ ...FORM, branch_id: "" })).toThrow(new ValidationError("application_branch_required"));
    expect(() => toNewApplication({ ...FORM, branch_id: "x" })).toThrow(new ValidationError("application_branch_required"));
  });

  it("knows the review statuses", () => {
    expect(toStatus("accepted")).toBe("accepted");
    expect(() => toStatus("maybe")).toThrow(new ValidationError("application_invalid_status"));
  });

  it("turns an accepted application into a student", () => {
    expect(studentOf({ ...FORM, applicant_name: "Nusrat Jahan Mim", address: null })).toEqual({
      FirstName: "Nusrat",
      LastName: "Jahan Mim",
      DateOfBirth: "2016-03-03",
      Gender: "Female",
      Class: "Class 3",
      Address: null,
      ParentContact: "01700000000",
    });
    expect(studentOf({ ...FORM, applicant_name: "Rahim", gender: "other" })).toMatchObject({ LastName: "-", Gender: "Male" });
  });
});
