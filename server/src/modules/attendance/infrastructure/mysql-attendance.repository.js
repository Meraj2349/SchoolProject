import db from "../../../../config/db.config.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

// MySQL adapter for the attendance repository port (see
// application/fakeAttendanceRepository.js). Attendance holds one row per
// student per day (uq_attendance_student_day).

const RECORD_COLUMNS = `a.AttendanceID, a.StudentID, a.ClassID, a.ClassDate, a.Status,
  s.FirstName, s.LastName, s.RollNumber, c.ClassName, c.Section`;

// The record's class, or the student's own when that class was deleted.
const RECORD_JOINS = `JOIN Students s ON s.StudentID = a.StudentID
  LEFT JOIN Classes c ON c.ClassID = COALESCE(a.ClassID, s.ClassID)`;

const MARKER_NAME = `CASE a.MarkedByType
    WHEN 'teacher' THEN CONCAT_WS(' ', t.FirstName, t.LastName)
    WHEN 'admin' THEN ad.Username
  END`;

// Filters of list(): column condition per filter.
const LIST_FILTERS = {
  id: "a.AttendanceID = ?",
  studentId: "a.StudentID = ?",
  classId: "a.ClassID = ?",
  date: "a.ClassDate = ?",
  className: "c.ClassName = ?",
  section: "c.Section = ?",
  roll: "s.RollNumber = ?",
};

/** " AND ..." conditions (and their values) for the filters that are given. */
function whereOf(filters) {
  const given = Object.entries(filters).filter(([, value]) => value != null);
  return {
    clause: given.map(([filter]) => ` AND ${LIST_FILTERS[filter]}`).join(""),
    params: given.map(([, value]) => value),
  };
}

const DEADLOCK = "ER_LOCK_DEADLOCK";
const SAVE_ATTEMPTS = 3;

async function withDeadlockRetry(run) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      if (error?.code !== DEADLOCK || attempt >= SAVE_ATTEMPTS) throw error;
    }
  }
}

export const mysqlAttendanceRepository = {
  async findClass(classId) {
    const [[row]] = await db.query(
      `SELECT ClassID AS id, ClassName AS name, Section AS section, branch_id AS branchId, TeacherID AS teacherId
         FROM Classes WHERE ClassID = ?`,
      [classId],
    );
    return row ?? null;
  },

  async findStudent(studentId, branchId) {
    const scope = branchFilter(branchId);
    const [[row]] = await db.query(
      `SELECT StudentID AS id, ClassID AS classId, branch_id AS branchId FROM Students WHERE StudentID = ? ${scope.clause}`,
      [studentId, ...scope.params],
    );
    return row ?? null;
  },

  /** The class's students (of the class's own branch) with their day, by roll number. */
  async roster(classId, date) {
    const [rows] = await db.query(
      `SELECT s.StudentID AS studentId, s.FirstName AS firstName, s.LastName AS lastName, s.RollNumber AS roll,
              a.AttendanceID AS attendanceId, a.Status AS status, a.MarkedByType AS markedByType,
              a.MarkedBy AS markedBy, ${MARKER_NAME} AS markedByName, a.MarkedAt AS markedAt
         FROM Students s
         JOIN Classes c ON c.ClassID = s.ClassID AND c.branch_id = s.branch_id
         LEFT JOIN Attendance a ON a.StudentID = s.StudentID AND a.ClassDate = ?
         LEFT JOIN Teachers t ON a.MarkedByType = 'teacher' AND t.TeacherID = a.MarkedBy
         LEFT JOIN Admin ad ON a.MarkedByType = 'admin' AND ad.AdminID = a.MarkedBy
        WHERE s.ClassID = ?
        ORDER BY CAST(s.RollNumber AS UNSIGNED), s.RollNumber, s.StudentID`,
      [date, classId],
    );
    return rows;
  },

  /**
   * Upserts the day in one statement. A stored day taken later than this save
   * (MarkedAt) is left as it is, so an admin's correction survives a phone
   * syncing an older save, and repeating a save changes nothing. MarkedAt is
   * assigned last: MySQL applies the assignments in order, so the conditions
   * before it still see the stored time.
   */
  async saveDay({ classId, branchId, date, entries, marker, takenAt }) {
    const rows = entries.map(({ studentId, status }) => [studentId, classId, date, status, branchId, marker.type, marker.id, takenAt]);
    const newer = "(Attendance.MarkedAt IS NULL OR incoming.MarkedAt >= Attendance.MarkedAt)";
    const take = (column) => `${column} = IF(${newer}, incoming.${column}, Attendance.${column})`;
    await withDeadlockRetry(() =>
      db.query(
        `INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id, MarkedByType, MarkedBy, MarkedAt)
         VALUES ? AS incoming
         ON DUPLICATE KEY UPDATE ${["ClassID", "Status", "branch_id", "MarkedByType", "MarkedBy", "MarkedAt"].map(take).join(", ")}`,
        [rows],
      ),
    );
  },

  async findRecord(id, branchId) {
    const scope = branchFilter(branchId);
    const [[row]] = await db.query(
      `SELECT AttendanceID AS id, StudentID AS studentId, ClassID AS classId, ClassDate AS date, Status AS status,
              branch_id AS branchId
         FROM Attendance WHERE AttendanceID = ? ${scope.clause}`,
      [id, ...scope.params],
    );
    return row ?? null;
  },

  async removeRecord(id) {
    await db.query("DELETE FROM Attendance WHERE AttendanceID = ?", [id]);
  },

  /** Records in the website's shape, newest day first. `firstName` matches part of the name. */
  async list({ branchId, from, to, firstName, ...filters }) {
    const scope = branchFilter(branchId, "a");
    const where = whereOf(filters);
    if (from != null) {
      where.clause += " AND a.ClassDate BETWEEN ? AND ?";
      where.params.push(from, to);
    }
    if (firstName != null) {
      where.clause += " AND s.FirstName LIKE ?";
      where.params.push(`%${firstName.replace(/[\\%_]/g, "\\$&")}%`);
    }
    const [rows] = await db.query(
      `SELECT ${RECORD_COLUMNS} FROM Attendance a ${RECORD_JOINS}
        WHERE 1=1 ${where.clause} ${scope.clause}
        ORDER BY a.ClassDate DESC, c.ClassName, c.Section, CAST(s.RollNumber AS UNSIGNED), s.FirstName`,
      [...where.params, ...scope.params],
    );
    return rows;
  },

  async countRecords(branchId) {
    const scope = branchFilter(branchId, "a");
    const [[row]] = await db.query(`SELECT COUNT(*) AS n FROM Attendance a WHERE 1=1 ${scope.clause}`, scope.params);
    return Number(row.n);
  },

  /** { Present: n, ... } for the records matching every given filter. */
  async statusCounts({ branchId, studentId, classId, date }) {
    const scope = branchFilter(branchId, "a");
    const where = whereOf({ studentId, classId, date });
    const [rows] = await db.query(
      `SELECT a.Status AS status, COUNT(*) AS n FROM Attendance a
        WHERE 1=1 ${where.clause} ${scope.clause}
        GROUP BY a.Status ORDER BY FIELD(a.Status, 'Present', 'Absent', 'Late', 'Leave')`,
      [...where.params, ...scope.params],
    );
    return Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
  },

  async findStudentInfo(studentId, branchId) {
    const scope = branchFilter(branchId, "s");
    const [[row]] = await db.query(
      `SELECT s.StudentID, s.FirstName, s.LastName, s.RollNumber, c.ClassName, c.Section
         FROM Students s LEFT JOIN Classes c ON c.ClassID = s.ClassID
        WHERE s.StudentID = ? ${scope.clause}`,
      [studentId, ...scope.params],
    );
    return row ?? null;
  },

  async exists({ branchId, studentId, date }) {
    const scope = branchFilter(branchId, "a");
    const [[row]] = await db.query(
      `SELECT EXISTS (SELECT 1 FROM Attendance a WHERE a.StudentID = ? AND a.ClassDate = ? ${scope.clause}) AS found`,
      [studentId, date, ...scope.params],
    );
    return Boolean(row.found);
  },

  /** Every student of the class and section, left-joined to their days in the range. */
  async gridRows({ branchId, className, section, from, to }) {
    const scope = branchFilter(branchId, "s");
    const [rows] = await db.query(
      `SELECT s.StudentID, s.FirstName, s.LastName, s.RollNumber, a.ClassDate, a.Status
         FROM Students s
         JOIN Classes c ON c.ClassID = s.ClassID
         LEFT JOIN Attendance a ON a.StudentID = s.StudentID AND a.ClassDate BETWEEN ? AND ?
        WHERE c.ClassName = ? AND c.Section = ? ${scope.clause}
        ORDER BY s.RollNumber, a.ClassDate`,
      [from, to, className, section, ...scope.params],
    );
    return rows;
  },
};
