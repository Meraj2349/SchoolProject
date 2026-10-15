// Framework-free helpers for achievements (honours board), shared by the
// admin page and the public home page.

export const ACHIEVEMENT_CATEGORIES = ["board_result", "academic", "sports", "cultural", "competition", "award"];

/** Pass percentage to one decimal place, or null when nobody sat the exam. */
export function passRate({ examinees, passed }) {
  const total = Number(examinees);
  const passes = Number(passed);
  if (examinees === "" || examinees == null || !(total > 0) || !Number.isFinite(passes)) return null;
  return Math.round((passes / total) * 1000) / 10;
}

/** "98.3% pass · 42 GPA-5" for a board result; "" for anything else. `t` gives the templates. */
export function resultSummary(achievement, t) {
  if (achievement.category !== "board_result") return "";
  const rate = passRate(achievement);
  return [
    rate != null && t("passRate").replace("{rate}", rate),
    achievement.gpa5 != null && t("gpa5").replace("{count}", achievement.gpa5),
  ]
    .filter(Boolean)
    .join(" · ");
}
