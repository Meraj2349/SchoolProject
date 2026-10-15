// Letter grade for a quiz score, the same scale the server uses.
const GRADE_FLOORS = [
  [90, "A"],
  [80, "B"],
  [70, "C"],
  [60, "D"],
];

export const letterGrade = (percentage) => GRADE_FLOORS.find(([floor]) => Number(percentage) >= floor)?.[1] ?? "F";

/** "2:05" for 125 seconds. */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
