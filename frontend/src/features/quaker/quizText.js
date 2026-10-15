// Pure helpers for the student quiz pages: question text in the chosen
// language, class labels, and class/section lists for the identity form.

const LETTERS = ["A", "B", "C", "D"];
const PRE_PRIMARY = ["play", "nursery", "kg"];
const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

const BANGLA_ORDINALS = ["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম", "একাদশ", "দ্বাদশ"];
const PRE_PRIMARY_LABELS = {
  en: { play: "Play", nursery: "Nursery", kg: "KG" },
  bn: { play: "প্লে", nursery: "নার্সারি", kg: "কেজি" },
};

/** Same rule as the server: "Class 8", "8th", "৮" → "8"; "KG" → "kg"; else null. */
export function classKeyOf(name) {
  if (name == null) return null;
  const text = String(name)
    .replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)))
    .trim()
    .toLowerCase();
  if (PRE_PRIMARY.includes(text)) return text;
  const match = text.match(/^(?:class|grade|শ্রেণি|শ্রেণী)?[\s_-]*(\d{1,2})(?:st|nd|rd|th)?$/);
  const number = match ? Number(match[1]) : 0;
  return number >= 1 && number <= 12 ? String(number) : null;
}

export function classLabel(key, language) {
  if (!key) return "";
  if (PRE_PRIMARY.includes(key)) return PRE_PRIMARY_LABELS[language === "bn" ? "bn" : "en"][key];
  return language === "bn" ? `${BANGLA_ORDINALS[Number(key) - 1] ?? key} শ্রেণি` : `Class ${key}`;
}

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
