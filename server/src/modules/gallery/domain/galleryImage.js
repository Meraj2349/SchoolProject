import { ValidationError } from "../../../shared/errors/index.js";

// A gallery image. A student or teacher portrait is linked to that person;
// other types (school, event, notice) may carry an AssociatedID.

export const IMAGE_TYPES = ["student", "teacher", "school", "event", "notice"];

const idOrNull = (value) => {
  const id = Number(value);
  return value !== null && value !== "" && Number.isInteger(id) && id > 0 ? id : null;
};
const descriptionOf = (value) => (value == null || value === "" ? null : String(value));

function imageType(value) {
  if (!value) throw new ValidationError("image_type_required");
  if (!IMAGE_TYPES.includes(value)) throw new ValidationError("image_type_invalid");
  return value;
}

function checkPerson(image) {
  if (image.ImageType === "student" && !image.StudentID) throw new ValidationError("student_id_required");
  if (image.ImageType === "teacher" && !image.TeacherID) throw new ValidationError("teacher_id_required");
}

/** A new image's fields from request input. */
export function toNewImage(input) {
  const image = {
    ImageType: imageType(input.imageType),
    Description: descriptionOf(input.description),
    StudentID: idOrNull(input.studentId),
    TeacherID: idOrNull(input.teacherId),
    AssociatedID: idOrNull(input.associatedId),
  };
  checkPerson(image);
  return image;
}

const CHANGES = [
  ["description", "Description", descriptionOf],
  ["imageType", "ImageType", imageType],
  ["studentId", "StudentID", idOrNull],
  ["teacherId", "TeacherID", idOrNull],
  ["associatedId", "AssociatedID", idOrNull],
];

/** The fields that were sent, checked against the image they change. */
export function toImageChanges(input, existing) {
  const changes = {};
  for (const [field, column, parse] of CHANGES) {
    if (input[field] !== undefined) changes[column] = parse(input[field]);
  }
  checkPerson({ ...existing, ...changes });
  return changes;
}

/** The student or teacher a portrait shows, or null. */
export function personOf(image) {
  if (image.ImageType === "student") return { kind: "student", id: image.StudentID };
  if (image.ImageType === "teacher") return { kind: "teacher", id: image.TeacherID };
  return null;
}
