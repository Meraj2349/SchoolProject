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

/**
 * The students × days grid from rows of students left-joined to their
 * attendance: every student (ordered by roll number, numerically) with a
 * { day: status } map, and the days that have any record.
 */
export function buildGrid(rows) {
  const students = new Map();
  const days = new Set();
  for (const row of rows) {
    if (!students.has(row.StudentID)) {
      students.set(row.StudentID, {
        StudentID: row.StudentID,
        FirstName: row.FirstName,
        LastName: row.LastName,
        RollNumber: row.RollNumber,
        attendance: {},
      });
    }
    if (row.ClassDate) {
      students.get(row.StudentID).attendance[row.ClassDate] = row.Status;
      days.add(row.ClassDate);
    }
  }
  return {
    students: [...students.values()].sort((a, b) =>
      String(a.RollNumber).localeCompare(String(b.RollNumber), undefined, { numeric: true }),
    ),
    dates: [...days].sort(),
  };
}
