// One key per school class, whatever spelling a table or file uses:
// "Class 8", "8", "8th", "শ্রেণি ৮" → "8"; "Play", "Nursery", "KG" → lower case.
// Questions are stored by this key and students get their own class's key.

const PRE_PRIMARY = ["play", "nursery", "kg"];
const HIGHEST_CLASS = 12;
const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

const toAsciiDigits = (text) => text.replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)));

/** The class key for a class name, or null when it is not a class. */
export function classKey(name) {
  if (name == null) return null;
  const text = toAsciiDigits(String(name)).trim().toLowerCase();
  if (PRE_PRIMARY.includes(text)) return text;

  const match = text.match(/^(?:class|grade|শ্রেণি|শ্রেণী)?[\s_-]*(\d{1,2})(?:st|nd|rd|th)?$/);
  if (!match) return null;
  const number = Number(match[1]);
  return number >= 1 && number <= HIGHEST_CLASS ? String(number) : null;
}
