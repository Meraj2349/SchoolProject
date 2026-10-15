import db from "../../../../config/db.config.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

// MySQL adapter for the quiz repository port. Questions are shared by every
// branch; sessions belong to the student's branch.

const QUESTION_COLUMNS = `QuestionID, SourceKey, ClassKey, Subject, Prompt, OptionsJSON, PromptBn, OptionsBnJSON,
  CorrectAnswer, Active, UpdatedAt`;

const json = (value) => (typeof value === "string" ? JSON.parse(value) : value);

const toQuestion = (row) => ({
  id: row.QuestionID,
  sourceKey: row.SourceKey,
  classKey: row.ClassKey,
  subject: row.Subject,
  prompt: row.Prompt,
  options: json(row.OptionsJSON),
  promptBn: row.PromptBn,
  optionsBn: row.OptionsBnJSON ? json(row.OptionsBnJSON) : null,
  answer: row.CorrectAnswer,
  active: Boolean(row.Active),
  updatedAt: row.UpdatedAt,
});

// Question fields → columns, for INSERT and UPDATE.
const COLUMNS = {
  sourceKey: "SourceKey",
  classKey: "ClassKey",
  subject: "Subject",
  prompt: "Prompt",
  options: "OptionsJSON",
  promptBn: "PromptBn",
  optionsBn: "OptionsBnJSON",
  answer: "CorrectAnswer",
  active: "Active",
  createdBy: "CreatedBy",
  updatedBy: "UpdatedBy",
};
const JSON_FIELDS = new Set(["options", "optionsBn"]);
const columnValue = (field, value) => (JSON_FIELDS.has(field) && value != null ? JSON.stringify(value) : value);

// LIKE pattern for text typed by an admin: % and _ match themselves.
const containing = (text) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

const STATUS_CLAUSE = { active: "AND Active = TRUE", hidden: "AND Active = FALSE", all: "" };

export const mysqlQuizRepository = {
  // ── Question bank ──────────────────────────────────────────────────────
  async existingSourceKeys(keys) {
    if (keys.length === 0) return new Set();
    const [rows] = await db.query("SELECT SourceKey FROM QuizQuestions WHERE SourceKey IN (?)", [keys]);
    return new Set(rows.map((row) => row.SourceKey));
  },

  async createQuestion(question) {
    const fields = Object.keys(COLUMNS).filter((field) => question[field] !== undefined);
    const [result] = await db.query(
      `INSERT INTO QuizQuestions (${fields.map((f) => COLUMNS[f]).join(", ")}) VALUES (?)`,
      [fields.map((f) => columnValue(f, question[f]))],
    );
    return { id: result.insertId };
  },

  async findQuestion(id) {
    const [rows] = await db.query(`SELECT ${QUESTION_COLUMNS} FROM QuizQuestions WHERE QuestionID = ?`, [id]);
    return rows[0] ? toQuestion(rows[0]) : null;
  },

  async updateQuestion(id, changes) {
    const fields = Object.keys(COLUMNS).filter((field) => changes[field] !== undefined);
    if (fields.length === 0) return;
    await db.query(`UPDATE QuizQuestions SET ${fields.map((f) => `${COLUMNS[f]} = ?`).join(", ")} WHERE QuestionID = ?`, [
      ...fields.map((f) => columnValue(f, changes[f])),
      id,
    ]);
  },

  async listQuestions({ classKey, subject, search, status, offset, pageSize }) {
    const where = ["ClassKey = ?"];
    const params = [classKey];
    if (subject) {
      where.push("Subject = ?");
      params.push(subject);
    }
    if (search) {
      where.push("(Prompt LIKE ? OR PromptBn LIKE ?)");
      params.push(containing(search), containing(search));
    }
    const clause = `WHERE ${where.join(" AND ")} ${STATUS_CLAUSE[status] ?? STATUS_CLAUSE.active}`;
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM QuizQuestions ${clause}`, params);
    const [rows] = await db.query(
      `SELECT ${QUESTION_COLUMNS} FROM QuizQuestions ${clause} ORDER BY Subject, QuestionID LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    );
    return { items: rows.map(toQuestion), total: Number(total) };
  },

  async subjectCounts({ classKey, activeOnly }) {
    const [rows] = await db.query(
      `SELECT Subject AS subject, COUNT(*) AS count FROM QuizQuestions
        WHERE ClassKey = ? ${activeOnly ? "AND Active = TRUE" : ""}
        GROUP BY Subject ORDER BY Subject`,
      [classKey],
    );
    return rows.map((row) => ({ subject: row.subject, count: Number(row.count) }));
  },

  // ── Taking a quiz ──────────────────────────────────────────────────────
  async randomQuestions({ classKey, subject, limit }) {
    const [rows] = await db.query(
      `SELECT ${QUESTION_COLUMNS} FROM QuizQuestions
        WHERE ClassKey = ? AND Active = TRUE ${subject ? "AND Subject = ?" : ""}
        ORDER BY RAND() LIMIT ?`,
      subject ? [classKey, subject, limit] : [classKey, limit],
    );
    return rows.map(toQuestion);
  },

  async questionsByIds(ids) {
    if (ids.length === 0) return [];
    const [rows] = await db.query(`SELECT ${QUESTION_COLUMNS} FROM QuizQuestions WHERE QuestionID IN (?)`, [ids]);
    return rows.map(toQuestion);
  },

  /** Saves a finished quiz and its answers in one transaction; returns the session id. */
  async saveSession(session, graded) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        `INSERT INTO QuizSessions
           (StudentID, StudentName, ClassName, Section, Subject, Grade, TotalQuestions, CorrectAnswers,
            ScorePercentage, TimeTakenSeconds, branch_id, StartedAt, CompletedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.studentId,
          session.studentName,
          session.className,
          session.section,
          session.subject,
          session.classKey,
          session.totalQuestions,
          session.correctAnswers,
          session.scorePercentage,
          session.timeTakenSeconds,
          session.branchId,
          session.startedAt,
          session.completedAt,
        ],
      );
      await connection.query(
        `INSERT INTO QuizAttempts (SessionID, QuestionID, UserAnswer, CorrectAnswer, IsCorrect, TimeSpentSeconds) VALUES ?`,
        [graded.map((g) => [result.insertId, g.questionId, g.userAnswer || null, g.correctAnswer, g.isCorrect ? 1 : 0, g.timeSpentSeconds])],
      );
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async sessionsOfStudent(studentId) {
    const [rows] = await db.query(
      `SELECT SessionID, Subject, Grade AS ClassKey, TotalQuestions, CorrectAnswers, ScorePercentage,
              TimeTakenSeconds, StartedAt, CompletedAt
         FROM QuizSessions WHERE StudentID = ? ORDER BY CompletedAt DESC, SessionID DESC`,
      [studentId],
    );
    return rows.map((row) => ({ ...row, ScorePercentage: Number(row.ScorePercentage) }));
  },

  async progressOfStudent(studentId) {
    const [bySubject] = await db.query(
      `SELECT Subject AS subject, COUNT(*) AS sessions, AVG(ScorePercentage) AS avgScore,
              SUM(CorrectAnswers) AS totalCorrect, SUM(TotalQuestions) AS totalQuestions
         FROM QuizSessions WHERE StudentID = ? AND Subject IS NOT NULL
        GROUP BY Subject ORDER BY Subject`,
      [studentId],
    );
    const [[totals]] = await db.query(
      `SELECT COUNT(*) AS sessions, COALESCE(AVG(ScorePercentage), 0) AS avgScore,
              COALESCE(SUM(CorrectAnswers), 0) AS totalCorrect, COALESCE(SUM(TotalQuestions), 0) AS totalQuestions
         FROM QuizSessions WHERE StudentID = ?`,
      [studentId],
    );
    const numbers = (row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, k === "subject" ? v : Number(v)]));
    return { totals: numbers(totals), bySubject: bySubject.map(numbers) };
  },

  // ── Results for admins ─────────────────────────────────────────────────
  async listSessions({ branchId, classKey, subject, offset, pageSize }) {
    const { clause, params } = branchFilter(branchId, "qs");
    const where = [`1=1 ${clause}`];
    const values = [...params];
    if (classKey) {
      where.push("qs.Grade = ?");
      values.push(classKey);
    }
    if (subject) {
      where.push("qs.Subject = ?");
      values.push(subject);
    }
    const condition = `WHERE ${where.join(" AND ")}`;
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM QuizSessions qs ${condition}`, values);
    const [rows] = await db.query(
      `SELECT qs.SessionID, qs.StudentID, qs.StudentName, qs.ClassName, qs.Section, qs.Subject,
              qs.Grade AS ClassKey, qs.TotalQuestions, qs.CorrectAnswers, qs.ScorePercentage,
              qs.TimeTakenSeconds, qs.StartedAt, qs.CompletedAt, qs.branch_id, s.RollNumber AS StudentRoll
         FROM QuizSessions qs
         LEFT JOIN Students s ON s.StudentID = qs.StudentID
         ${condition}
        ORDER BY qs.CompletedAt DESC, qs.SessionID DESC
        LIMIT ? OFFSET ?`,
      [...values, pageSize, offset],
    );
    return { items: rows.map((row) => ({ ...row, ScorePercentage: Number(row.ScorePercentage) })), total: Number(total) };
  },

  async leaderboard({ branchId, classKey, limit }) {
    const { clause, params } = branchFilter(branchId, "qs");
    const values = [...params];
    let classClause = "";
    if (classKey) {
      classClause = "AND qs.Grade = ?";
      values.push(classKey);
    }
    const [rows] = await db.query(
      `SELECT qs.StudentID, qs.StudentName, qs.ClassName, qs.Section, s.RollNumber AS StudentRoll,
              COUNT(*) AS sessions, AVG(qs.ScorePercentage) AS avgScore, MAX(qs.ScorePercentage) AS bestScore
         FROM QuizSessions qs
         LEFT JOIN Students s ON s.StudentID = qs.StudentID
        WHERE qs.StudentID IS NOT NULL ${clause} ${classClause}
        GROUP BY qs.StudentID, qs.StudentName, qs.ClassName, qs.Section, s.RollNumber
        ORDER BY avgScore DESC, sessions DESC, qs.StudentName
        LIMIT ?`,
      [...values, limit],
    );
    return rows.map((row) => ({
      ...row,
      sessions: Number(row.sessions),
      avgScore: Number(row.avgScore),
      bestScore: Number(row.bestScore),
    }));
  },
};
