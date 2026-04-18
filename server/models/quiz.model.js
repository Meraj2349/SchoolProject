import db from "../config/db.config.js";

// Distinct subjects + grades + difficulties (for dropdown choices)
export const getQuizMeta = async () => {
  const [subjects] = await db.query(
    `SELECT DISTINCT Subject FROM QuizQuestions WHERE Subject IS NOT NULL ORDER BY Subject`,
  );
  const [grades] = await db.query(
    `SELECT DISTINCT Grade FROM QuizQuestions WHERE Grade IS NOT NULL ORDER BY Grade`,
  );
  const [difficulties] = await db.query(
    `SELECT DISTINCT Difficulty FROM QuizQuestions WHERE Difficulty IS NOT NULL ORDER BY FIELD(Difficulty,'easy','medium','hard')`,
  );
  return {
    subjects: subjects.map((r) => r.Subject),
    grades: grades.map((r) => r.Grade),
    difficulties: difficulties.map((r) => r.Difficulty),
  };
};

// Pick N random questions filtered by subject/grade/difficulty
export const pickRandomQuestions = async ({ subject, grade, difficulty, limit = 10 }) => {
  const where = [];
  const params = [];
  if (subject && subject !== "all") {
    where.push("Subject = ?");
    params.push(subject);
  }
  if (grade && grade !== "all") {
    where.push("Grade = ?");
    params.push(grade);
  }
  if (difficulty && difficulty !== "all") {
    where.push("Difficulty = ?");
    params.push(difficulty);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await db.query(
    `SELECT QuestionID, Prompt, OptionsJSON, CorrectAnswer, Subject, Grade, Difficulty
       FROM QuizQuestions ${clause}
       ORDER BY RAND()
       LIMIT ?`,
    [...params, parseInt(limit, 10)],
  );
  return rows.map((r) => ({
    id: r.QuestionID,
    question: r.Prompt,
    options:
      typeof r.OptionsJSON === "string"
        ? JSON.parse(r.OptionsJSON)
        : r.OptionsJSON,
    correct_answer: r.CorrectAnswer,
    subject: r.Subject,
    grade: r.Grade,
    difficulty: r.Difficulty,
  }));
};

export const getQuestionsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT QuestionID, Prompt, OptionsJSON, CorrectAnswer, Subject, Grade, Difficulty
       FROM QuizQuestions WHERE QuestionID IN (${placeholders})`,
    ids,
  );
  return rows.map((r) => ({
    id: r.QuestionID,
    question: r.Prompt,
    options:
      typeof r.OptionsJSON === "string"
        ? JSON.parse(r.OptionsJSON)
        : r.OptionsJSON,
    correct_answer: r.CorrectAnswer,
    subject: r.Subject,
    grade: r.Grade,
    difficulty: r.Difficulty,
  }));
};

// Create a session row — populated after all answers are submitted.
export const createQuizSession = async ({
  studentId,
  studentName,
  className,
  section,
  subject,
  grade,
  totalQuestions,
  correctAnswers,
  scorePercentage,
  timeTakenSeconds,
  branchId,
  completedAt,
}) => {
  const [result] = await db.query(
    `INSERT INTO QuizSessions
       (StudentID, StudentName, ClassName, Section, Subject, Grade,
        TotalQuestions, CorrectAnswers, ScorePercentage, TimeTakenSeconds,
        branch_id, CompletedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      studentId,
      studentName,
      className,
      section,
      subject,
      grade,
      totalQuestions,
      correctAnswers,
      scorePercentage,
      timeTakenSeconds,
      branchId,
      completedAt,
    ],
  );
  return result.insertId;
};

export const bulkInsertAttempts = async (sessionId, attempts) => {
  if (!attempts || attempts.length === 0) return;
  const values = attempts.map((a) => [
    sessionId,
    a.questionId,
    a.userAnswer || null,
    a.correctAnswer,
    a.isCorrect ? 1 : 0,
    a.timeSpentSeconds ?? null,
  ]);
  await db.query(
    `INSERT INTO QuizAttempts
       (SessionID, QuestionID, UserAnswer, CorrectAnswer, IsCorrect, TimeSpentSeconds)
     VALUES ?`,
    [values],
  );
};

// Sessions for one student — used in the student portal progress page.
export const getSessionsByStudentId = async (studentId) => {
  const [rows] = await db.query(
    `SELECT SessionID, Subject, Grade, TotalQuestions, CorrectAnswers,
            ScorePercentage, TimeTakenSeconds, StartedAt, CompletedAt
       FROM QuizSessions
       WHERE StudentID = ?
       ORDER BY StartedAt DESC`,
    [studentId],
  );
  return rows;
};

// Aggregate progress for a student (subject-wise averages).
export const getStudentProgressByStudentId = async (studentId) => {
  const [subjectAvg] = await db.query(
    `SELECT Subject, COUNT(*) AS sessions, AVG(ScorePercentage) AS avgScore,
            SUM(CorrectAnswers) AS totalCorrect, SUM(TotalQuestions) AS totalQuestions
       FROM QuizSessions
       WHERE StudentID = ? AND Subject IS NOT NULL
       GROUP BY Subject`,
    [studentId],
  );
  const [totals] = await db.query(
    `SELECT COUNT(*) AS sessions,
            COALESCE(AVG(ScorePercentage), 0) AS avgScore,
            COALESCE(SUM(CorrectAnswers), 0) AS totalCorrect,
            COALESCE(SUM(TotalQuestions), 0) AS totalQuestions
       FROM QuizSessions
       WHERE StudentID = ?`,
    [studentId],
  );
  return {
    totals: totals[0],
    bySubject: subjectAvg.map((r) => ({
      subject: r.Subject,
      sessions: r.sessions,
      avgScore: Number(r.avgScore),
      totalCorrect: Number(r.totalCorrect),
      totalQuestions: Number(r.totalQuestions),
    })),
  };
};

// Admin view — all sessions, branch-scoped.
export const getAllSessions = async (
  branchId = null,
  { limit = 200, offset = 0 } = {},
) => {
  const where = [];
  const params = [];
  if (branchId != null) {
    where.push("qs.branch_id = ?");
    params.push(branchId);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await db.query(
    `SELECT qs.SessionID, qs.StudentID, qs.StudentName, qs.ClassName, qs.Section,
            qs.Subject, qs.Grade, qs.TotalQuestions, qs.CorrectAnswers,
            qs.ScorePercentage, qs.TimeTakenSeconds, qs.StartedAt, qs.CompletedAt,
            qs.branch_id,
            s.RollNumber AS StudentRoll
       FROM QuizSessions qs
       LEFT JOIN Students s ON s.StudentID = qs.StudentID
       ${clause}
       ORDER BY qs.StartedAt DESC
       LIMIT ? OFFSET ?`,
    [...params, parseInt(limit, 10), parseInt(offset, 10)],
  );
  return rows;
};

export const getLeaderboard = async (branchId = null, limit = 20) => {
  const where = ["qs.StudentID IS NOT NULL"];
  const params = [];
  if (branchId != null) {
    where.push("qs.branch_id = ?");
    params.push(branchId);
  }
  const clause = `WHERE ${where.join(" AND ")}`;
  const [rows] = await db.query(
    `SELECT qs.StudentID, qs.StudentName,
            s.RollNumber AS StudentRoll,
            COUNT(*) AS sessions,
            AVG(qs.ScorePercentage) AS avgScore,
            MAX(qs.ScorePercentage) AS bestScore
       FROM QuizSessions qs
       LEFT JOIN Students s ON s.StudentID = qs.StudentID
       ${clause}
       GROUP BY qs.StudentID, qs.StudentName, s.RollNumber
       HAVING sessions >= 1
       ORDER BY avgScore DESC
       LIMIT ?`,
    [...params, parseInt(limit, 10)],
  );
  return rows;
};
