import db from "../../../../config/db.config.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

// MySQL adapter for the result repository port. A result belongs to its
// student's branch: new results copy it into Results.branch_id, and reads scope
// by the student (as before, so rows written before
// branch_ownership_migration.sql still match).

// The rows the public result page and the admin Results page show.
const SEARCH = `
  SELECT r.ResultID, r.MarksObtained, 100 AS TotalMarks,
         CONCAT(s.FirstName, ' ', s.LastName) AS StudentName, s.FirstName, s.LastName, s.RollNumber,
         e.ExamName, e.ExamType, e.ExamDate, sub.SubjectName, c.ClassName, c.Section
  FROM Results r
  LEFT JOIN Students s ON s.StudentID = r.StudentID
  LEFT JOIN Exams e ON e.ExamID = r.ExamID
  LEFT JOIN Subjects sub ON sub.SubjectID = r.SubjectID
  LEFT JOIN Classes c ON c.ClassID = r.ClassID`;

// Filter → SQL. Class, section and roll match exactly: "Class 1" must not
// find Class 10, nor roll 1 find roll 10 (other students' results).
const FILTERS = {
  name: (value) => ["(s.FirstName LIKE ? OR s.LastName LIKE ? OR CONCAT(s.FirstName, ' ', s.LastName) LIKE ?)", Array(3).fill(`%${value}%`)],
  rollNumber: (value) => ["s.RollNumber = ?", [value]],
  className: (value) => ["c.ClassName = ?", [value]],
  section: (value) => ["c.Section = ?", [value]],
  examName: (value) => ["e.ExamName LIKE ?", [`%${value}%`]],
};

const exists = async (sql, params) => {
  const [rows] = await db.query(sql, params);
  return rows.length > 0;
};

export const mysqlResultRepository = {
  async search({ branchId, filters }) {
    const { clause, params } = branchFilter(branchId, "s");
    const conditions = Object.entries(filters).map(([filter, value]) => FILTERS[filter](value));
    const where = conditions.map(([condition]) => ` AND ${condition}`).join("");
    const [rows] = await db.query(
      `${SEARCH} WHERE 1=1 ${clause}${where} ORDER BY e.ExamDate DESC, c.ClassName, s.RollNumber, sub.SubjectName`,
      [...params, ...conditions.flatMap(([, values]) => values)],
    );
    return rows;
  },

  studentInClass: ({ studentId, classId, branchId }) =>
    exists("SELECT 1 FROM Students WHERE StudentID = ? AND ClassID = ? AND branch_id = ?", [studentId, classId, branchId]),

  examForClass: ({ examId, classId }) => exists("SELECT 1 FROM Exams WHERE ExamID = ? AND ClassID = ?", [examId, classId]),

  subjectForClass: ({ subjectId, classId }) =>
    exists("SELECT 1 FROM Subjects WHERE SubjectID = ? AND ClassID = ?", [subjectId, classId]),

  exists: ({ studentId, examId, subjectId }) =>
    exists("SELECT 1 FROM Results WHERE StudentID = ? AND ExamID = ? AND SubjectID = ?", [studentId, examId, subjectId]),

  async create({ studentId, examId, subjectId, classId, marks }) {
    const [result] = await db.query(
      `INSERT INTO Results (StudentID, ExamID, SubjectID, ClassID, MarksObtained, branch_id)
       SELECT ?, ?, ?, ?, ?, branch_id FROM Students WHERE StudentID = ?`,
      [studentId, examId, subjectId, classId, marks, studentId],
    );
    return result.insertId;
  },

  async findById(id, { branchId }) {
    const { clause, params } = branchFilter(branchId, "s");
    const [[found]] = await db.query(
      `SELECT r.ResultID AS id, s.branch_id AS branchId
       FROM Results r LEFT JOIN Students s ON s.StudentID = r.StudentID
       WHERE r.ResultID = ? ${clause}`,
      [id, ...params],
    );
    return found ?? null;
  },

  updateMarks: (id, marks) => db.query("UPDATE Results SET MarksObtained = ? WHERE ResultID = ?", [marks, id]),

  remove: (id) => db.query("DELETE FROM Results WHERE ResultID = ?", [id]),
};
