import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "../../../shared/errors/index.js";
import { personOf, toImageChanges, toNewImage } from "./galleryImage.js";

const invalid = (code) => new ValidationError(code);

describe("gallery image", () => {
  it("takes a type and optional description and links", () => {
    expect(toNewImage({ imageType: "event", description: "Sports day", associatedId: "4" })).toEqual({
      ImageType: "event",
      Description: "Sports day",
      StudentID: null,
      TeacherID: null,
      AssociatedID: 4,
    });
  });

  it("needs a known type", () => {
    expect(() => toNewImage({})).toThrow(invalid("image_type_required"));
    expect(() => toNewImage({ imageType: "selfie" })).toThrow(invalid("image_type_invalid"));
  });

  it("needs the student or teacher a portrait shows", () => {
    expect(() => toNewImage({ imageType: "student" })).toThrow(invalid("student_id_required"));
    expect(() => toNewImage({ imageType: "teacher", teacherId: "x" })).toThrow(invalid("teacher_id_required"));
    expect(toNewImage({ imageType: "student", studentId: "12" }).StudentID).toBe(12);
  });

  it("changes only what was sent, and checks the result", () => {
    const existing = { ImageType: "school", Description: "Old", StudentID: null, TeacherID: null, AssociatedID: null };

    expect(toImageChanges({ description: "New" }, existing)).toEqual({ Description: "New" });
    expect(toImageChanges({ description: "" }, existing)).toEqual({ Description: null });
    expect(() => toImageChanges({ imageType: "teacher" }, existing)).toThrow(invalid("teacher_id_required"));
  });

  it("names the person a portrait shows", () => {
    expect(personOf({ ImageType: "student", StudentID: 3 })).toEqual({ kind: "student", id: 3 });
    expect(personOf({ ImageType: "teacher", TeacherID: 5 })).toEqual({ kind: "teacher", id: 5 });
    expect(personOf({ ImageType: "event", StudentID: 3 })).toBeNull();
  });
});
