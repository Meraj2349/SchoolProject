import db, { inList, valuesRows } from "../../../shared/db/index.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

// MySQL adapter for the absence SMS port (see application/fakeAbsenceSmsRepository.js).
// AttendanceSms holds at most one message per student per day.

/** A send takes seconds; a message "sending" for this long was interrupted. */
const STALE_SENDING_MINUTES = 10;

const OUTCOME_COLUMNS = { status: "status", phone: "phone", providerRef: "provider_ref", sentAt: "sent_at", error: "error", dueAt: "due_at" };

export const mysqlAbsenceSmsRepository = {
  /**
   * Queues a message per student, due at `dueAt`. A message already queued,
   * sent or failed that day is left alone (one per day); a cancelled one is
   * queued again. status is assigned last: MySQL applies assignments in
   * order, so the conditions before it still see the stored status.
   */
  async queue({ studentIds, date, branchId, dueAt }) {
    const incoming = valuesRows(studentIds.map((studentId) => [studentId, date, branchId, dueAt]));
    const reopen = "AttendanceSms.status = 'cancelled'";
    await db.query(
      `INSERT INTO AttendanceSms (student_id, class_date, branch_id, due_at) VALUES ${incoming.sql} AS incoming
       ON DUPLICATE KEY UPDATE
         due_at = IF(${reopen}, incoming.due_at, AttendanceSms.due_at),
         attempts = IF(${reopen}, 0, AttendanceSms.attempts),
         error = IF(${reopen}, NULL, AttendanceSms.error),
         status = IF(${reopen}, 'pending', AttendanceSms.status)`,
      incoming.params,
    );
  },

  async cancel({ studentIds, date }) {
    const students = inList(studentIds);
    await db.query(
      `UPDATE AttendanceSms SET status = 'cancelled' WHERE class_date = ? AND student_id IN ${students.sql} AND status = 'pending'`,
      [date, ...students.params],
    );
  },

  /**
   * Messages still "sending" long after a run took them (the process stopped
   * mid-send). Both times are the database's own clock.
   */
  async failInterrupted() {
    await db.query(
      `UPDATE AttendanceSms SET status = 'failed', error = 'interrupted'
        WHERE status = 'sending' AND updated_at < NOW() - INTERVAL ${STALE_SENDING_MINUTES} MINUTE`,
    );
  },

  async dueIds(now, limit) {
    const { rows } = await db.query(
      "SELECT id FROM AttendanceSms WHERE status = 'pending' AND due_at <= ? ORDER BY due_at, id LIMIT ?",
      [now, limit],
    );
    return rows.map((r) => r.id);
  },

  /** Takes the message for sending; false when another run took it first. */
  async claim(id) {
    const result = await db.query(
      "UPDATE AttendanceSms SET status = 'sending', attempts = attempts + 1 WHERE id = ? AND status = 'pending'",
      [id],
    );
    return result.rowCount === 1;
  },

  /** The message with the child's name, the parent's number and the child's status that day now. */
  async details(id) {
    const row = await db.one(
      `SELECT m.id, m.student_id AS studentId, m.class_date AS date, m.attempts,
              CONCAT_WS(' ', s.FirstName, s.LastName) AS name, s.ParentContact AS parentPhone,
              a.Status AS attendanceStatus
         FROM AttendanceSms m
         JOIN Students s ON s.StudentID = m.student_id
         LEFT JOIN Attendance a ON a.StudentID = m.student_id AND a.ClassDate = m.class_date
        WHERE m.id = ?`,
      [id],
    );
    return row ?? null;
  },

  async finish(id, outcome) {
    const fields = Object.entries(outcome).filter(([key]) => key in OUTCOME_COLUMNS);
    await db.query(
      `UPDATE AttendanceSms SET ${fields.map(([key]) => `${OUTCOME_COLUMNS[key]} = ?`).join(", ")} WHERE id = ?`,
      [...fields.map(([, value]) => value), id],
    );
  },

  async list({ branchId, date }) {
    const scope = branchFilter(branchId, "m");
    const { rows } = await db.query(
      `SELECT m.id, m.student_id AS studentId, CONCAT_WS(' ', s.FirstName, s.LastName) AS studentName,
              s.RollNumber AS roll, c.ClassID AS classId, c.ClassName AS className, c.Section AS section, m.class_date AS date,
              m.status, m.phone, m.attempts, m.due_at AS dueAt, m.sent_at AS sentAt, m.error
         FROM AttendanceSms m
         JOIN Students s ON s.StudentID = m.student_id
         LEFT JOIN Classes c ON c.ClassID = s.ClassID
        WHERE m.class_date = ? ${scope.clause}
        ORDER BY c.ClassName, c.Section, CAST(s.RollNumber AS UNSIGNED), s.StudentID`,
      [date, ...scope.params],
    );
    return rows;
  },
};
