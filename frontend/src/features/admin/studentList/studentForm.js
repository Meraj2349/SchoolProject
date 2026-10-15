// Pure rules for the Students admin page: form values, validation, filters.

/** Genders the Students table accepts (ENUM('Male','Female')). */
export const GENDERS = ["Male", "Female"];

export const EMPTY_STUDENT = {
  FirstName: "",
  LastName: "",
  RollNumber: "",
  ClassName: "",
  Section: "",
  Gender: "Male",
  DateOfBirth: "",
  AdmissionDate: "",
  ParentContact: "",
  Address: "",
};

const REQUIRED = ["FirstName", "LastName", "RollNumber", "ClassName", "Section", "DateOfBirth"];

const text = (value) => String(value ?? "").trim();
const dateOnly = (value) => (value ? String(value).slice(0, 10) : "");

/**
 * Field errors as { field: "required" | "invalid" | "rollTaken" }; empty when valid.
 * A roll number must be unique within its class and section.
 */
export function validateStudentForm(form, { students, editId = null }) {
  const errors = {};
  for (const field of REQUIRED) {
    if (!text(form[field])) errors[field] = "required";
  }
  if (!GENDERS.includes(form.Gender)) errors.Gender = "invalid";

  const roll = text(form.RollNumber);
  const rollTaken = students.some(
    (s) =>
      s.StudentID !== editId &&
      text(s.RollNumber) === roll &&
      s.ClassName === form.ClassName &&
      s.Section === form.Section,
  );
  if (roll && !errors.RollNumber && rollTaken) errors.RollNumber = "rollTaken";
  return errors;
}

/** Form values for editing an existing student. */
export function toFormValues(student) {
  return Object.fromEntries(
    Object.keys(EMPTY_STUDENT).map((field) => {
      const value = student[field];
      if (field === "DateOfBirth" || field === "AdmissionDate") return [field, dateOnly(value)];
      return [field, value == null ? "" : String(value)];
    }),
  );
}

/** Sections that exist for a class name, sorted. */
export const sectionsFor = (classes, className) =>
  className ? [...new Set(classes.filter((c) => c.ClassName === className).map((c) => c.Section))].sort() : [];

/** Students matching the class / section / gender dropdowns (blank = any). */
export const filterStudents = (students, { className, section, gender }) =>
  students.filter(
    (s) =>
      (!className || s.ClassName === className) &&
      (!section || s.Section === section) &&
      (!gender || s.Gender === gender),
  );

/** student_id → this month's invoice, for the fee status column. */
export const feeStatusByStudent = (invoices) => new Map(invoices.map((invoice) => [invoice.student_id, invoice]));
