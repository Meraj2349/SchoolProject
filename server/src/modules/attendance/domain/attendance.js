import { ForbiddenError, ValidationError } from "../../../shared/errors/index.js";
import { isDay, schoolToday } from "../../../shared/schoolDate.js";

// Daily class attendance: one status per student per school day.

export const STATUSES = ["Present", "Absent", "Late", "Leave"];

/** How long an offline phone may take to sync a day it took. */
export const CATCH_UP_HOURS = 48;

const BY_LOWER_CASE = new Map(STATUSES.map((status) => [status.toLowerCase(), status]));

/** "Present", "Absent", "Late" or "Leave", whatever the case. */
export function parseStatus(value) {
  const status = typeof value === "string" ? BY_LOWER_CASE.get(value.trim().toLowerCase()) : undefined;
  if (!status) throw new ValidationError("attendance_status_invalid");
  return status;
}

/** A real calendar date, "YYYY-MM-DD". */
export function parseDay(value) {
  if (!isDay(value)) throw new ValidationError("attendance_date_invalid");
  return value;
}

const studentIdOf = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError("attendance_entries_invalid");
  return id;
};

/**
 * The statuses to save for a class's day, one per student, ordered by student
 * id (so concurrent saves lock rows in the same order). `rosterIds` are the
 * students in the class. A whole day (`complete`) must give every one of them
 * a status; otherwise some students may be left out (one cell of the grid).
 */
export function toDayEntries(input, rosterIds, { complete = true } = {}) {
  if (!Array.isArray(input) || input.length === 0) throw new ValidationError("attendance_entries_required");
  const inClass = new Set(rosterIds);
  const byStudent = new Map();
  for (const entry of input) {
    if (!entry || typeof entry !== "object") throw new ValidationError("attendance_entries_invalid");
    const studentId = studentIdOf(entry.studentId);
    const status = parseStatus(entry.status);
    if (byStudent.has(studentId)) throw new ValidationError("attendance_entries_duplicate");
    if (!inClass.has(studentId)) throw new ValidationError("attendance_student_not_in_class");
    byStudent.set(studentId, status);
  }
  if (complete) {
    const missing = rosterIds.filter((id) => !byStudent.has(id));
    if (missing.length) throw new ValidationError("attendance_entries_incomplete", undefined, { details: { missing } });
  }
  return [...byStudent]
    .sort(([a], [b]) => a - b)
    .map(([studentId, status]) => ({ studentId, status }));
}

function parseTakenAt(value, now) {
  if (value == null || value === "") return now;
  const takenAt = new Date(value);
  if (Number.isNaN(takenAt.getTime())) throw new ValidationError("attendance_taken_at_invalid");
  return takenAt > now ? now : takenAt;
}

/**
 * When a class teacher's save of `date` counts as taken. Teachers mark today
 * only; the one exception is a phone that took the day offline on that day and
 * syncs it within CATCH_UP_HOURS. Earlier days are corrected by an admin.
 * `takenAt` is the phone's clock, so it is never later than now.
 */
export function teacherTakenAt({ date, takenAt, now }) {
  const taken = parseTakenAt(takenAt, now);
  const today = schoolToday(now);
  if (date === today) return schoolToday(taken) === date ? taken : now;
  const caughtUp = date < today && schoolToday(taken) === date && now - taken <= CATCH_UP_HOURS * 3600_000;
  if (!caughtUp) throw new ForbiddenError("attendance_day_locked");
  return taken;
}

/** When an admin's save counts as taken: now, for today or any earlier day. */
export function adminTakenAt({ date, now }) {
  if (date > schoolToday(now)) throw new ValidationError("attendance_date_future");
  return now;
}

const roundTo2 = (value) => Math.round(value * 100) / 100;

/**
 * Percent of expected students who came: late students came, students on
 * leave were not expected. Null when nobody was expected.
 */
export function attendanceRate({ Present = 0, Absent = 0, Late = 0 } = {}) {
  const came = Number(Present) + Number(Late);
  const expected = came + Number(Absent);
  return expected ? roundTo2((came / expected) * 100) : null;
}

const byRoll = (a, b) => String(a.RollNumber).localeCompare(String(b.RollNumber), undefined, { numeric: true });

const branchOfRow = (row) => ({ id: row.BranchID, nameBn: row.BranchNameBn, nameEn: row.BranchNameEn });

/**
 * The students × days grid from rows of students left-joined to their
 * attendance: every student (by branch, then by roll number, numerically)
 * with their branch and a { day: status } map, the days that have any
 * record, and the branches of the students (by id) — "all branches" can mix
 * the same class and section of several branches.
 */
export function buildGrid(rows) {
  const students = new Map();
  const branches = new Map();
  const days = new Set();
  for (const row of rows) {
    if (!students.has(row.StudentID)) {
      const branch = branchOfRow(row);
      branches.set(branch.id, branch);
      students.set(row.StudentID, {
        StudentID: row.StudentID,
        FirstName: row.FirstName,
        LastName: row.LastName,
        RollNumber: row.RollNumber,
        branch,
        attendance: {},
      });
    }
    if (row.ClassDate) {
      students.get(row.StudentID).attendance[row.ClassDate] = row.Status;
      days.add(row.ClassDate);
    }
  }
  return {
    students: [...students.values()].sort((a, b) => a.branch.id - b.branch.id || byRoll(a, b)),
    dates: [...days].sort(),
    branches: [...branches.values()].sort((a, b) => a.id - b.id),
  };
}

// The overview's count keys: present, absent, late, leave.
const COUNT_KEYS = STATUSES.map((status) => status.toLowerCase());

const countsOf = (mark) => Object.fromEntries(COUNT_KEYS.map((key) => [key, Number(mark?.[key] ?? 0)]));

const isTaken = (counts) => COUNT_KEYS.some((key) => counts[key] > 0);

const classOverview = ({ id, name, section, students, classTeacher }, mark) => ({
  id,
  name,
  section,
  students,
  classTeacher,
  takenBy: mark?.takenBy ?? null,
  counts: countsOf(mark),
});

function totalsOf(classes) {
  const taken = classes.filter((cls) => isTaken(cls.counts)).length;
  const sum = (pick) => classes.reduce((total, cls) => total + pick(cls), 0);
  return {
    classes: classes.length,
    taken,
    notTaken: classes.length - taken,
    students: sum((cls) => cls.students),
    ...Object.fromEntries(COUNT_KEYS.map((key) => [key, sum((cls) => cls.counts[key])])),
  };
}

/**
 * One day across branches: each branch (in the given order) with its classes
 * (in the given order), each class's counts and who took it, and the branch's
 * totals. A class is taken when it has any status that day. `marks` are the
 * day's { classId, present, absent, late, leave, takenBy } of the classes that
 * have any; a branch without classes is still listed.
 */
export function buildOverview({ date, branches, classes, marks }) {
  const markOf = new Map(marks.map((mark) => [mark.classId, mark]));
  return {
    date,
    branches: branches.map(({ id, nameBn, nameEn }) => {
      const rows = classes.filter((cls) => cls.branchId === id).map((cls) => classOverview(cls, markOf.get(cls.id)));
      return { id, nameBn, nameEn, totals: totalsOf(rows), classes: rows };
    }),
  };
}
