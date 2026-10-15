import { describe, expect, it } from "vitest";
import {
  EMPTY_STUDENT,
  feeStatusByStudent,
  filterStudents,
  sectionsFor,
  toFormValues,
  validateStudentForm,
} from "./studentForm";

const valid = {
  ...EMPTY_STUDENT,
  FirstName: "Rahim",
  LastName: "Uddin",
  RollNumber: "7",
  ClassName: "Class 5",
  Section: "Good",
  Gender: "Male",
  DateOfBirth: "2015-01-01",
};

const students = [
  { StudentID: 1, FirstName: "Rahim", LastName: "Uddin", RollNumber: "7", ClassName: "Class 5", Section: "Good", Gender: "Male" },
  { StudentID: 2, FirstName: "Karima", LastName: "Begum", RollNumber: "8", ClassName: "Class 5", Section: "General", Gender: "Female" },
  { StudentID: 3, FirstName: "Sabbir", LastName: "Hossain", RollNumber: "1", ClassName: "Class 6", Section: "Good", Gender: "Male" },
];

describe("validateStudentForm", () => {
  it("accepts a complete form", () => {
    expect(validateStudentForm(valid, { students: [] })).toEqual({});
  });

  it("requires the fields the server requires", () => {
    expect(Object.keys(validateStudentForm(EMPTY_STUDENT, { students: [] })).sort()).toEqual(
      ["ClassName", "DateOfBirth", "FirstName", "LastName", "RollNumber", "Section"].sort(),
    );
  });

  it("treats whitespace as empty", () => {
    expect(validateStudentForm({ ...valid, FirstName: "   " }, { students: [] })).toEqual({ FirstName: "required" });
  });

  it("only allows the genders the database accepts", () => {
    expect(validateStudentForm({ ...valid, Gender: "Other" }, { students: [] })).toEqual({ Gender: "invalid" });
  });

  it("rejects a roll number already used in the same class and section", () => {
    expect(validateStudentForm({ ...valid, RollNumber: " 7 " }, { students })).toEqual({ RollNumber: "rollTaken" });
  });

  it("allows the same roll number in another section", () => {
    expect(validateStudentForm({ ...valid, Section: "General", RollNumber: "7" }, { students })).toEqual({});
  });

  it("lets a student keep their own roll number when edited", () => {
    expect(validateStudentForm(valid, { students, editId: 1 })).toEqual({});
  });
});

describe("toFormValues", () => {
  it("fills the form from a student, with dates trimmed and blanks for missing values", () => {
    expect(
      toFormValues({ ...students[0], DateOfBirth: "2015-01-01T00:00:00.000Z", AdmissionDate: null, ParentContact: null }),
    ).toEqual({
      FirstName: "Rahim",
      LastName: "Uddin",
      RollNumber: "7",
      ClassName: "Class 5",
      Section: "Good",
      Gender: "Male",
      DateOfBirth: "2015-01-01",
      AdmissionDate: "",
      ParentContact: "",
      Address: "",
    });
  });
});

describe("sectionsFor", () => {
  const classes = [
    { ClassName: "Class 5", Section: "Good" },
    { ClassName: "Class 5", Section: "Better" },
    { ClassName: "Class 6", Section: "Good" },
  ];

  it("lists the sections of a class, sorted", () => {
    expect(sectionsFor(classes, "Class 5")).toEqual(["Better", "Good"]);
  });

  it("is empty before a class is chosen", () => {
    expect(sectionsFor(classes, "")).toEqual([]);
  });
});

describe("filterStudents", () => {
  it("filters by class, section and gender together", () => {
    expect(filterStudents(students, { className: "Class 5", section: "", gender: "Female" }).map((s) => s.StudentID)).toEqual([2]);
  });

  it("returns everyone without filters", () => {
    expect(filterStudents(students, { className: "", section: "", gender: "" })).toHaveLength(3);
  });
});

describe("feeStatusByStudent", () => {
  it("maps each student to this month's invoice status", () => {
    const invoices = [
      { student_id: 1, status: "paid", balance: 0 },
      { student_id: 2, status: "partial", balance: 300 },
    ];

    expect(feeStatusByStudent(invoices)).toEqual(new Map([[1, invoices[0]], [2, invoices[1]]]));
  });
});
