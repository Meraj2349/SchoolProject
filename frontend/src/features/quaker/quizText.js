// Pure helpers for the student quiz pages: question text in the chosen
// language, class labels, and class/section lists for the identity form.

import { PRE_PRIMARY, classKeyOf } from "@/lib/schoolClass";

export { classKeyOf, classLabel } from "@/lib/schoolClass";

const LETTERS = ["A", "B", "C", "D"];

export const hasBangla = (question) => Boolean(question?.promptBn && question?.optionsBn);

/** The question's prompt and A–D options in `language`, English if no Bangla. */
export function localize(question, language) {
  if (!question) return { prompt: "", options: [] };
  const bangla = language === "bn" && hasBangla(question);
  const options = (bangla ? question.optionsBn : question.options) ?? {};
  return {
    prompt: bangla ? question.promptBn : question.prompt,
    options: LETTERS.filter((letter) => options[letter] != null).map((letter) => ({ letter, text: String(options[letter]) })),
  };
}

// Play, Nursery, KG, then Class 1..12, then anything else by name.
const classOrder = (name) => {
  const key = classKeyOf(name);
  if (PRE_PRIMARY.includes(key)) return PRE_PRIMARY.indexOf(key);
  return key ? 10 + Number(key) : 100;
};

/** Distinct class names from { ClassName, Section } rows, in school order. */
export const classesOf = (rows) =>
  [...new Set(rows.map((row) => row.ClassName).filter(Boolean))].sort(
    (a, b) => classOrder(a) - classOrder(b) || a.localeCompare(b),
  );

/** Sections of one class, sorted. */
export const sectionsOf = (rows, className) =>
  className ? [...new Set(rows.filter((row) => row.ClassName === className).map((row) => row.Section))].sort() : [];
