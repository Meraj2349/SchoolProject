// Framework-free helpers for the public students and teachers pages.

const text = (value) => (typeof value === "string" ? value.trim() : "");

export const fullName = (person = {}) => [text(person.FirstName), text(person.LastName)].filter(Boolean).join(" ");

/** "RU" for Rahim Uddin; "?" when there is no name. */
export function initialsOf(person = {}) {
  const initials = [person.FirstName, person.LastName].map((part) => text(part).charAt(0)).join("");
  return initials ? initials.toUpperCase() : "?";
}

/** Map from person id to their newest photo, from one list of images (key: "TeacherID" or "StudentID"). */
export function photosBy(images = [], key) {
  const photos = new Map();
  for (const image of images) {
    const id = image[key];
    if (id != null && image.ImagePath && !photos.has(id)) photos.set(id, image.ImagePath);
  }
  return photos;
}

/** The classes this teacher is class teacher of. */
export const classesTaughtBy = (classes = [], teacherId) => classes.filter((c) => c.TeacherID === teacherId);

const SEARCH_FIELDS = {
  name: (t) => [fullName(t)],
  subject: (t) => [t.Subject],
  email: (t) => [t.Email],
};
const allFields = (t) => Object.values(SEARCH_FIELDS).flatMap((fields) => fields(t));

/**
 * Teachers matching the search (in every field, or one of name/subject/email)
 * and, when a class is chosen, the class teachers of that class (and section).
 */
export function filterTeachers(teachers = [], classes = [], { search = "", field = "all", className = "", section = "" } = {}) {
  const query = text(search).toLowerCase();
  const fieldsOf = SEARCH_FIELDS[field] ?? allFields;
  const classTeachers = new Set(
    classes.filter((c) => c.ClassName === className && (!section || c.Section === section)).map((c) => c.TeacherID),
  );
  return teachers.filter(
    (teacher) =>
      (!query || fieldsOf(teacher).some((value) => text(value).toLowerCase().includes(query))) &&
      (!className || classTeachers.has(teacher.TeacherID)),
  );
}
