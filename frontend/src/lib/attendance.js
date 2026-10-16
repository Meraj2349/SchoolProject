// Daily attendance statuses, as the server stores them.

export const ATTENDANCE_STATUSES = ["Present", "Absent", "Late", "Leave"];

const CODES = {
  en: { Present: "P", Absent: "A", Late: "L", Leave: "Lv" },
  bn: { Present: "উ", Absent: "অ", Late: "দে", Leave: "ছু" },
};

/** One- or two-letter code for a grid cell; "–" when not marked. */
export const statusCode = (status, language = "en") => (CODES[language] ?? CODES.en)[status] ?? "–";

/**
 * Totals for a list of statuses (null = not marked). The rate is the percent
 * of expected students who came: late students came, students on leave were
 * not expected; rounded to `decimals`. Null when nobody was expected.
 */
export function attendanceTotals(statuses, { decimals = 0 } = {}) {
  const count = (status) => statuses.filter((s) => s === status).length;
  const [present, absent, late, leave] = ATTENDANCE_STATUSES.map(count);
  const expected = present + late + absent;
  return {
    present,
    absent,
    late,
    leave,
    marked: present + absent + late + leave,
    rate: expected ? Math.round(((present + late) / expected) * 100 * 10 ** decimals) / 10 ** decimals : null,
  };
}

/** "09:15": when a day was taken, on the school's clock (Asia/Dhaka). */
export function formatSchoolTime(value, language = "en") {
  if (!value) return "";
  return new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

/** The days that count: weekdays, plus any weekend day on which attendance was taken. */
export const schoolDaysOf = (days, students, isWeekend) =>
  days.filter((day) => !isWeekend(day) || students.some((s) => s.attendance?.[day]));
