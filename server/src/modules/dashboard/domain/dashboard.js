// Pure rules for the admin dashboard's headline numbers.

const roundTo1 = (value) => Math.round(value * 10) / 10;

/** Today's attendance from counts per status. Late students count as attending. */
export function attendanceToday(countsByStatus) {
  const present = Number(countsByStatus.Present ?? 0);
  const late = Number(countsByStatus.Late ?? 0);
  const absent = Number(countsByStatus.Absent ?? 0);
  const recorded = present + late + absent;
  return { present, late, absent, recorded, rate: recorded ? roundTo1(((present + late) / recorded) * 100) : null };
}

/** Percent of this month's billed fees already collected; null when nothing was billed. */
export const collectionRate = ({ billed, collected }) =>
  Number(billed) > 0 ? roundTo1((Number(collected) / Number(billed)) * 100) : null;

/** { year, month } of a "YYYY-MM-DD" date. */
export const currentPeriod = (date) => ({ year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) });
