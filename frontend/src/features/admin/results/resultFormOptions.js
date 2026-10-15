/**
 * Exams and subjects belong to one class row (class name + section). Once the
 * section is chosen (classId set), only that row's items are valid — matching
 * on the class name alone offered other sections' exams and subjects.
 */
export function optionsForClass(items, { className, classId }) {
  if (classId) return items.filter((item) => String(item.ClassID) === String(classId));
  if (className) {
    const wanted = className.toLowerCase();
    return items.filter((item) => item.ClassName?.toLowerCase() === wanted);
  }
  return items;
}
