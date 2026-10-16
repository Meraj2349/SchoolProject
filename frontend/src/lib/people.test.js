import { describe, expect, it } from "vitest";
import { classesTaughtBy, exactStudentMatches, filterTeachers, fullName, initialsOf, photosBy } from "./people";

describe("people helpers", () => {
  it("makes initials and full names without crashing on missing parts", () => {
    expect(initialsOf({ FirstName: "Rahim", LastName: "Uddin" })).toBe("RU");
    expect(initialsOf({ FirstName: "Rahim", LastName: null })).toBe("R");
    expect(initialsOf({})).toBe("?");
    expect(fullName({ FirstName: "Rahim", LastName: undefined })).toBe("Rahim");
  });

  it("finds each person's photo from one list of images", () => {
    const photos = photosBy(
      [
        { ImageID: 1, TeacherID: 4, ImagePath: "/uploads/new.png" },
        { ImageID: 2, TeacherID: 4, ImagePath: "/uploads/old.png" },
        { ImageID: 3, StudentID: 9, ImagePath: "/uploads/s.png" },
      ],
      "TeacherID",
    );

    expect(photos.get(4)).toBe("/uploads/new.png");
    expect(photos.has(9)).toBe(false);
  });

  it("lists the classes a teacher is class teacher of", () => {
    const classes = [
      { ClassName: "Class 5", Section: "A", TeacherID: 4 },
      { ClassName: "Class 6", Section: "B", TeacherID: 7 },
    ];

    expect(classesTaughtBy(classes, 4)).toEqual([{ ClassName: "Class 5", Section: "A", TeacherID: 4 }]);
  });
});

describe("filterTeachers", () => {
  const teachers = [
    { TeacherID: 4, FirstName: "Karim", LastName: "Ahmed", Subject: "Math", Email: "k@school.test" },
    { TeacherID: 7, FirstName: "Nadia", LastName: "Akter", Subject: "English", Email: "n@school.test" },
    { TeacherID: 8, FirstName: "Rina", LastName: null, Subject: "Science", Email: null },
  ];
  const classes = [
    { ClassName: "Class 5", Section: "A", TeacherID: 4 },
    { ClassName: "Class 5", Section: "B", TeacherID: 7 },
  ];
  const ids = (list) => list.map((t) => t.TeacherID);

  it("searches all fields or one field", () => {
    expect(ids(filterTeachers(teachers, classes, { search: "eng" }))).toEqual([7]);
    expect(ids(filterTeachers(teachers, classes, { search: "a", field: "subject" }))).toEqual([4]);
    expect(ids(filterTeachers(teachers, classes, { search: "rina", field: "name" }))).toEqual([8]);
  });

  it("keeps the class teachers of the chosen class and section", () => {
    expect(ids(filterTeachers(teachers, classes, { className: "Class 5" }))).toEqual([4, 7]);
    expect(ids(filterTeachers(teachers, classes, { className: "Class 5", section: "B" }))).toEqual([7]);
    expect(ids(filterTeachers(teachers, classes, { className: "Class 9" }))).toEqual([]);
  });

  it("shows everyone when nothing is chosen", () => {
    expect(filterTeachers(teachers, classes, {})).toHaveLength(3);
  });
});

describe("exactStudentMatches", () => {
  const rahim = { FirstName: "Rahim", RollNumber: 7, ClassName: "Class 5", Section: "Good" };
  it("keeps only students matching every field, ignoring case and spaces", () => {
    const list = [rahim, { ...rahim, FirstName: "Rahima" }, { ...rahim, RollNumber: 17 }, { ...rahim, Section: "Better" }];
    expect(exactStudentMatches(list, { FirstName: " rahim", RollNumber: "7", ClassName: "class 5", Section: "GOOD" })).toEqual([rahim]);
  });
});
