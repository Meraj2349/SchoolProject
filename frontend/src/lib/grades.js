// Letter grades for the public results page.

const GRADES = [
  { min: 90, grade: "A+", tone: "excellent" },
  { min: 80, grade: "A", tone: "excellent" },
  { min: 70, grade: "B+", tone: "good" },
  { min: 60, grade: "B", tone: "good" },
  { min: 50, grade: "C+", tone: "fair" },
  { min: 40, grade: "C", tone: "fair" },
  { min: 35, grade: "D", tone: "poor" },
  { min: 0, grade: "F", tone: "poor" },
];

/** The grade for marks out of total (100 by default); "–" when the marks are missing. */
export function gradeFor(marks, total = 100) {
  const obtained = Number(marks);
  const outOf = Number(total) || 100;
  if (marks == null || marks === "" || Number.isNaN(obtained)) return { grade: "–", tone: "none" };
  const percent = (obtained / outOf) * 100;
  const { grade, tone } = GRADES.find((g) => percent >= g.min) ?? GRADES.at(-1);
  return { grade, tone };
}
