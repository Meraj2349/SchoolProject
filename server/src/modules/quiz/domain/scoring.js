// Scoring a finished quiz. `questions` are the real questions ({ id, answer })
// the student may be scored on; anything else in the answers is ignored.

const MAX_SECONDS_PER_QUESTION = 3600;

const secondsOrNull = (value) => {
  const seconds = Number(value);
  return Number.isInteger(seconds) && seconds >= 0 && seconds <= MAX_SECONDS_PER_QUESTION ? seconds : null;
};

/**
 * One graded answer per real question: unknown question IDs are dropped and
 * repeats of the same question are ignored, so neither can inflate a score.
 */
export function scoreAnswers(answers, questions) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const seen = new Set();
  const graded = [];
  for (const answer of answers) {
    const questionId = Number.parseInt(answer.questionId, 10);
    const question = byId.get(questionId);
    if (!question || seen.has(questionId)) continue;
    seen.add(questionId);
    const userAnswer = String(answer.userAnswer ?? "").toUpperCase().slice(0, 1);
    graded.push({
      questionId,
      userAnswer,
      correctAnswer: question.answer,
      isCorrect: userAnswer !== "" && userAnswer === question.answer,
      timeSpentSeconds: secondsOrNull(answer.timeSpentSeconds),
    });
  }
  return graded;
}

export function summarize(graded) {
  const total = graded.length;
  const correct = graded.filter((g) => g.isCorrect).length;
  const percentage = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;
  return { total, correct, percentage };
}

const GRADE_FLOORS = [
  [90, "A"],
  [80, "B"],
  [70, "C"],
  [60, "D"],
];

export const letterGrade = (percentage) => GRADE_FLOORS.find(([floor]) => percentage >= floor)?.[1] ?? "F";
