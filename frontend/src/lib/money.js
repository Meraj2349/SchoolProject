const LOCALES = { en: "en-IN", bn: "bn-BD" }; // both group by lakh: 1,23,456
const formatters = {};

const formatterFor = (language) => {
  const locale = LOCALES[language] ?? LOCALES.en;
  formatters[locale] ??= new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return formatters[locale];
};

/** "৳1,23,456.50" (or Bangla digits). Accepts numbers or the decimal strings the API returns. */
export function formatTaka(amount, language = "en") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  const formatted = `৳${formatterFor(language).format(Math.abs(value))}`;
  return value < 0 ? `-${formatted}` : formatted;
}
