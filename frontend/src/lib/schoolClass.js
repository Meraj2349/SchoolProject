// School classes: one key per class, whatever spelling a table uses, and a
// label in English or Bangla. Mirrors classKey() in the server's quiz module.

export const PRE_PRIMARY = ["play", "nursery", "kg"];
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
