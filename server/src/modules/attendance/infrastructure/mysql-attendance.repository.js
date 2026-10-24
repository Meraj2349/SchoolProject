import db, { valuesRows } from "../../../shared/db/index.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

// MySQL adapter for the attendance repository port (see
// application/fakeAttendanceRepository.js). Attendance holds one row per
// student per day (uq_attendance_student_day).

const RECORD_COLUMNS = `a."AttendanceID", a."StudentID", a."ClassID", a."ClassDate", a."Status",
  s."FirstName", s."LastName", s."RollNumber", c."ClassName", c."Section"`;

// The record's class, or the student's own when that class was deleted.
const RECORD_JOINS = `JOIN "Students" s ON s."StudentID" = a."StudentID"
  LEFT JOIN "Classes" c ON c."ClassID" = COALESCE(a."ClassID", s."ClassID")`;

const MARKER_NAME = `CASE a."MarkedByType"
    WHEN 'teacher' THEN CONCAT_WS(' ', t."FirstName", t."LastName")
    WHEN 'admin' THEN ad."Username"
  END`;

// A class's branch (b) and class teacher (ct), for CLASS_JOINS.
const BRANCH_COLUMNS = `b.name_bn AS "branchNameBn", b.name_en AS "branchNameEn"`;
const CLASS_TEACHER_COLUMNS = `ct."TeacherID" AS "classTeacherId", CONCAT_WS(' ', ct."FirstName", ct."LastName") AS "classTeacherName",
  (ct."AppEnabled" AND ct."AppPhone" IS NOT NULL AND ct."AppPasswordHash" IS NOT NULL) AS "classTeacherAppAccess"`;
const CLASS_TEACHER_JOIN = `LEFT JOIN "Teachers" ct ON ct."TeacherID" = c."TeacherID"`;
const CLASS_JOINS = `LEFT JOIN "Branches" b ON b.id = c.branch_id ${CLASS_TEACHER_JOIN}`;

// Classes in the school's order of class names (ClassNames.sort_order), then section.
const CLASS_NAMES_JOIN = `LEFT JOIN "ClassNames" cn ON cn.name = c."ClassName"`;
const BY_CLASS_ORDER = `cn.sort_order IS NULL, cn.sort_order, c."ClassName", c."Section", c."ClassID"`;

const branchOf = (row) => ({ id: row.branchId, nameBn: row.branchNameBn, nameEn: row.branchNameEn });

const classTeacherOf = (row) =>
  row.classTeacherId == null
    ? null
    : { id: row.classTeacherId, name: row.classTeacherName, appAccess: Boolean(Number(row.classTeacherAppAccess)) };

// Filters of list(): column condition per filter.
const LIST_FILTERS = {
  id: `a."AttendanceID" = ?`,
  studentId: `a."StudentID" = ?`,
  classId: `a."ClassID" = ?`,
  date: `a."ClassDate" = ?`,
  className: `c."ClassName" = ?`,
  section: `c."Section" = ?`,
  roll: `s."RollNumber" = ?`,
};

/** " AND ..." conditions (and their values) for the filters that are given. */
function whereOf(filters) {
  const given = Object.entries(filters).filter(([, value]) => value != null);
  return {
    clause: given.map(([filter]) => ` AND ${LIST_FILTERS[filter]}`).join(""),
    params: given.map(([, value]) => value),
  };
}

const SAVE_ATTEMPTS = 3;

async function withDeadlockRetry(run) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      if (!db.isDeadlock(error) || attempt >= SAVE_ATTEMPTS) throw error;
    }
  }
}

export const mysqlAttendanceRepository = {
  async findClass(classId) {
    const row = await db.one(
      `SELECT c."ClassID" AS id, c."ClassName" AS name, c."Section" AS section, c.branch_id AS "branchId", c."TeacherID" AS "teacherId",
              ${BRANCH_COLUMNS}, ${CLASS_TEACHER_COLUMNS}
         FROM "Classes" c ${CLASS_JOINS}
        WHERE c."ClassID" = ?`,
      [classId],
    );
    if (!row) return null;
    const { id, name, section, branchId, teacherId } = row;
    return { id, name, section, branchId, teacherId, branch: branchOf(row), classTeacher: classTeacherOf(row) };
  },

  /** { id, nameBn, nameEn } of the branch, or of every branch (null), by id. */
  async branchesIn(branchId) {
    const [clause, params] = branchId == null ? ["", []] : ["WHERE id = ?", [branchId]];
    const { rows } = await db.query(`SELECT id, name_bn AS "nameBn", name_en AS "nameEn" FROM "Branches" ${clause} ORDER BY id`, params);
    return rows;
  },

  /** The branch's classes (null: every branch's), with their class teacher and number of students. */
  async classesIn(branchId) {
    const scope = branchFilter(branchId, "c");
    const { rows } = await db.query(
      `SELECT c."ClassID" AS id, c."ClassName" AS name, c."Section" AS section, c.branch_id AS "branchId", ${CLASS_TEACHER_COLUMNS},
              (SELECT COUNT(*) FROM "Students" s WHERE s."ClassID" = c."ClassID" AND s.branch_id = c.branch_id) AS students
         FROM "Classes" c ${CLASS_TEACHER_JOIN} ${CLASS_NAMES_JOIN}
        WHERE 1=1 ${scope.clause}
        ORDER BY c.branch_id, ${BY_CLASS_ORDER}`,
      scope.params,
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      section: row.section,
      branchId: row.branchId,
      students: Number(row.students),
      classTeacher: classTeacherOf(row),
    }));
  },

  /**
   * The day of each class (of its own branch's students, as on the roster)
   * that has any status on `date`: its counts and the latest mark.
   */
  async classDays({ branchId, date }) {
    const scope = branchFilter(branchId, "c");
    const { rows } = await db.query(
      `WITH day AS (
         SELECT s."ClassID" AS "classId", a."Status" AS status, a."MarkedByType" AS "markedByType",
                ${MARKER_NAME} AS "markedByName", a."MarkedAt" AS "markedAt",
                ROW_NUMBER() OVER (PARTITION BY s."ClassID" ORDER BY a."MarkedAt" DESC, a."AttendanceID" DESC) AS nth
           FROM "Attendance" a
           JOIN "Students" s ON s."StudentID" = a."StudentID"
           JOIN "Classes" c ON c."ClassID" = s."ClassID" AND c.branch_id = s.branch_id
           LEFT JOIN "Teachers" t ON a."MarkedByType" = 'teacher' AND t."TeacherID" = a."MarkedBy"
           LEFT JOIN "Admin" ad ON a."MarkedByType" = 'admin' AND ad."AdminID" = a."MarkedBy"
          WHERE a."ClassDate" = ? ${scope.clause}
       )
       SELECT classId,
              SUM(status = 'Present') AS "presentCount", SUM(status = 'Absent') AS "absentCount",
              SUM(status = 'Late') AS "lateCount", SUM(status = 'Leave') AS "leaveCount",
              MAX(CASE WHEN nth = 1 THEN markedByType END) AS "takenByType",
              MAX(CASE WHEN nth = 1 THEN markedByName END) AS "takenByName",
              MAX(CASE WHEN nth = 1 THEN markedAt END) AS "takenAt"
         FROM day GROUP BY classId`,
      [date, ...scope.params],
    );
    return rows.map((row) => ({
      classId: row.classId,
      present: Number(row.presentCount),
      absent: Number(row.absentCount),
      late: Number(row.lateCount),
      leave: Number(row.leaveCount),
      takenBy: row.takenAt == null ? null : { type: row.takenByType, name: row.takenByName, at: row.takenAt },
    }));
  },

  async findStudent(studentId, branchId) {
    const scope = branchFilter(branchId);
    const row = await db.one(
      `SELECT "StudentID" AS id, "ClassID" AS "classId", branch_id AS "branchId" FROM "Students" WHERE "StudentID" = ? ${scope.clause}`,
      [studentId, ...scope.params],
    );
    return row ?? null;
  },

  /** The class's students (of the class's own branch) with their day, by roll number. */
  async roster(classId, date) {
    const { rows } = await db.query(
      `SELECT s."StudentID" AS "studentId", s."FirstName" AS "firstName", s."LastName" AS "lastName", s."RollNumber" AS roll,
              a."AttendanceID" AS "attendanceId", a."Status" AS status, a."MarkedByType" AS "markedByType",
              a."MarkedBy" AS "markedBy", ${MARKER_NAME} AS "markedByName", a."MarkedAt" AS "markedAt"
         FROM "Students" s
         JOIN "Classes" c ON c."ClassID" = s."ClassID" AND c.branch_id = s.branch_id
         LEFT JOIN "Attendance" a ON a."StudentID" = s."StudentID" AND a."ClassDate" = ?
         LEFT JOIN "Teachers" t ON a."MarkedByType" = 'teacher' AND t."TeacherID" = a."MarkedBy"
         LEFT JOIN "Admin" ad ON a."MarkedByType" = 'admin' AND ad."AdminID" = a."MarkedBy"
        WHERE s."ClassID" = ?
        ORDER BY CAST(s."RollNumber" AS UNSIGNED), s."RollNumber", s."StudentID"`,
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
    const incoming = valuesRows(
      entries.map(({ studentId, status }) => [studentId, classId, date, status, branchId, marker.type, marker.id, takenAt]),
    );
    const newer = `("Attendance"."MarkedAt" IS NULL OR incoming."MarkedAt" >= "Attendance"."MarkedAt")`;
    const take = (column) => `${column} = IF(${newer}, incoming.${column}, Attendance.${column})`;
    await withDeadlockRetry(() =>
      db.query(
        `INSERT INTO "Attendance" ("StudentID", "ClassID", "ClassDate", "Status", branch_id, "MarkedByType", "MarkedBy", "MarkedAt")
         VALUES ${incoming.sql} AS incoming
         ON DUPLICATE KEY UPDATE ${["ClassID", "Status", "branch_id", "MarkedByType", "MarkedBy", "MarkedAt"].map(take).join(", ")}`,
        incoming.params,
      ),
    );
  },

  async findRecord(id, branchId) {
    const scope = branchFilter(branchId);
    const row = await db.one(
      `SELECT "AttendanceID" AS id, "StudentID" AS "studentId", "ClassID" AS "classId", "ClassDate" AS date, "Status" AS status,
              branch_id AS "branchId"
         FROM "Attendance" WHERE "AttendanceID" = ? ${scope.clause}`,
      [id, ...scope.params],
    );
    return row ?? null;
  },

  async removeRecord(id) {
    await db.query(`DELETE FROM "Attendance" WHERE "AttendanceID" = ?`, [id]);
  },

  /** Records in the website's shape, newest day first. `firstName` matches part of the name. */
  async list({ branchId, from, to, firstName, ...filters }) {
    const scope = branchFilter(branchId, "a");
    const where = whereOf(filters);
    if (from != null) {
      where.clause += ` AND a."ClassDate" BETWEEN ? AND ?`;
      where.params.push(from, to);
    }
    if (firstName != null) {
      where.clause += ` AND s."FirstName" LIKE ?`;
      where.params.push(`%${firstName.replace(/[\\%_]/g, "\\$&")}%`);
    }
    const { rows } = await db.query(
      `SELECT ${RECORD_COLUMNS} FROM "Attendance" a ${RECORD_JOINS}
        WHERE 1=1 ${where.clause} ${scope.clause}
        ORDER BY a."ClassDate" DESC, c."ClassName", c."Section", CAST(s."RollNumber" AS UNSIGNED), s."FirstName"`,
      [...where.params, ...scope.params],
    );
    return rows;
  },

  async countRecords(branchId) {
    const scope = branchFilter(branchId, "a");
    const row = await db.one(`SELECT COUNT(*) AS n FROM "Attendance" a WHERE 1=1 ${scope.clause}`, scope.params);
    return Number(row.n);
  },

  /** { Present: n, ... } for the records matching every given filter. */
  async statusCounts({ branchId, studentId, classId, date }) {
    const scope = branchFilter(branchId, "a");
    const where = whereOf({ studentId, classId, date });
    const { rows } = await db.query(
      `SELECT a."Status" AS status, COUNT(*) AS n FROM "Attendance" a
        WHERE 1=1 ${where.clause} ${scope.clause}
        GROUP BY a."Status" ORDER BY FIELD(a."Status", 'Present', 'Absent', 'Late', 'Leave')`,
      [...where.params, ...scope.params],
    );
    return Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
  },

  async findStudentInfo(studentId, branchId) {
    const scope = branchFilter(branchId, "s");
    const row = await db.one(
      `SELECT s."StudentID", s."FirstName", s."LastName", s."RollNumber", c."ClassName", c."Section"
         FROM "Students" s LEFT JOIN "Classes" c ON c."ClassID" = s."ClassID"
        WHERE s."StudentID" = ? ${scope.clause}`,
      [studentId, ...scope.params],
    );
    return row ?? null;
  },

  async exists({ branchId, studentId, date }) {
    const scope = branchFilter(branchId, "a");
    const row = await db.one(
      `SELECT EXISTS (SELECT 1 FROM "Attendance" a WHERE a."StudentID" = ? AND a."ClassDate" = ? ${scope.clause}) AS found`,
      [studentId, date, ...scope.params],
    );
    return Boolean(row.found);
  },

  /** Every student of the class and section, with their branch, left-joined to their days in the range. */
  async gridRows({ branchId, className, section, from, to }) {
    const scope = branchFilter(branchId, "s");
    const { rows } = await db.query(
      `SELECT s."StudentID", s."FirstName", s."LastName", s."RollNumber", a."ClassDate", a."Status",
              s.branch_id AS "BranchID", b.name_bn AS "BranchNameBn", b.name_en AS "BranchNameEn"
         FROM "Students" s
         JOIN "Classes" c ON c."ClassID" = s."ClassID"
         LEFT JOIN "Branches" b ON b.id = s.branch_id
         LEFT JOIN "Attendance" a ON a."StudentID" = s."StudentID" AND a."ClassDate" BETWEEN ? AND ?
        WHERE c."ClassName" = ? AND c."Section" = ? ${scope.clause}
        ORDER BY s.branch_id, s."RollNumber", a."ClassDate"`,
      [from, to, className, section, ...scope.params],
    );
    return rows;
  },
};
