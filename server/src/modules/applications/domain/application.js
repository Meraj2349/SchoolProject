import { ValidationError } from "../../../shared/errors/index.js";

// An online admission application. It is filed under the branch (campus) the
// family applies to; accepting it enrols the child there.

export const STATUSES = ["pending", "reviewed", "accepted", "rejected"];
const GENDERS = ["male", "female", "other"];
const REQUIRED = ["applicant_name", "date_of_birth", "gender", "applying_for_class", "parent_name", "parent_contact"];
const OPTIONAL = ["previous_school", "previous_class", "parent_email", "address", "additional_info"];

const text = (value) => (typeof value === "string" ? value.trim() : "");

/** The application to save, from the public form. */
export function toNewApplication(input) {
  const application = {};
  for (const field of REQUIRED) application[field] = text(input[field]);
  if (REQUIRED.some((field) => !application[field]) || !GENDERS.includes(application.gender)) {
    throw new ValidationError("application_all_required");
  }
  for (const field of OPTIONAL) application[field] = text(input[field]) || null;

  const branchId = Number(input.branch_id);
  if (input.branch_id == null || input.branch_id === "" || !Number.isInteger(branchId) || branchId <= 0) {
    throw new ValidationError("application_branch_required");
  }
  // Same field order as the form, branch last.
  return {
    applicant_name: application.applicant_name,
    date_of_birth: application.date_of_birth,
    gender: application.gender,
    applying_for_class: application.applying_for_class,
    previous_school: application.previous_school,
    previous_class: application.previous_class,
    parent_name: application.parent_name,
    parent_contact: application.parent_contact,
    parent_email: application.parent_email,
    address: application.address,
    additional_info: application.additional_info,
    branch_id: branchId,
  };
}

export function toStatus(value) {
  if (!STATUSES.includes(value)) throw new ValidationError("application_invalid_status");
  return value;
}

/** The student an accepted application becomes (class section and roll are set on enrolment). */
export function studentOf(application) {
  const [first, ...rest] = application.applicant_name.trim().split(/\s+/);
  return {
    FirstName: first,
    LastName: rest.join(" ") || "-",
    DateOfBirth: application.date_of_birth,
    Gender: application.gender === "female" ? "Female" : "Male", // Students.Gender is Male/Female
    Class: application.applying_for_class,
    Address: application.address || null,
    ParentContact: application.parent_contact,
  };
}
