import db from "../../../../config/db.config.js";
import { branchFilter } from "../../../../utils/branchFilter.js";
import { ConflictError } from "../../../shared/errors/index.js";

// MySQL adapter for the teacher account port (see
// application/fakeTeacherAccountRepository.js). The sign-in columns live on
// Teachers (attendance_v2_migration.sql).

const ACCOUNT_COLUMNS = `TeacherID AS id, FirstName AS firstName, LastName AS lastName, branch_id AS branchId,
  AppPhone AS phone, AppPasswordHash AS passwordHash, AppEnabled AS enabled, TokenVersion AS tokenVersion,
  LastLoginAt AS lastLoginAt, FailedLogins AS failedLogins, LockedUntil AS lockedUntil`;

const toAccount = (row) => (row ? { ...row, enabled: Boolean(row.enabled) } : null);

export const mysqlTeacherAccountRepository = {
  async findAccount(id) {
    const [[row]] = await db.query(`SELECT ${ACCOUNT_COLUMNS} FROM Teachers WHERE TeacherID = ?`, [id]);
    return toAccount(row);
  },

  async findAccountByPhone(phone) {
    const [[row]] = await db.query(`SELECT ${ACCOUNT_COLUMNS} FROM Teachers WHERE AppPhone = ?`, [phone]);
    return toAccount(row);
  },

  async listAccess(branchId) {
    const scope = branchFilter(branchId);
    const [rows] = await db.query(
      `SELECT ${ACCOUNT_COLUMNS} FROM Teachers WHERE 1=1 ${scope.clause} ORDER BY FirstName, LastName, TeacherID`,
      scope.params,
    );
    return rows.map(toAccount);
  },

  /**
   * Changes the given fields (undefined keeps a field). A new password also
   * clears wrong-password counting; `signOut` bumps TokenVersion so every
   * token issued before stops working.
   */
  async updateAccess(id, { phone, passwordHash, enabled, signOut }) {
    const changes = [
      phone !== undefined && ["AppPhone = ?", [phone]],
      enabled !== undefined && ["AppEnabled = ?", [enabled]],
      passwordHash !== undefined && ["AppPasswordHash = ?, FailedLogins = 0, LockedUntil = NULL", [passwordHash]],
      signOut && ["TokenVersion = TokenVersion + 1", []],
    ].filter(Boolean);
    if (changes.length === 0) return;
    const sets = changes.map(([set]) => set);
    const params = changes.flatMap(([, values]) => values);
    try {
      await db.query(`UPDATE Teachers SET ${sets.join(", ")} WHERE TeacherID = ?`, [...params, id]);
    } catch (error) {
      if (error?.code === "ER_DUP_ENTRY") throw new ConflictError("teacher_app_phone_taken");
      throw error;
    }
  },

  /**
   * Counts a wrong password in one statement, so attempts at the same moment
   * all count. On the `max`th in a row the number is locked until
   * `lockedUntil` and the count starts again. LockedUntil is assigned first:
   * MySQL applies assignments in order, so it still sees the old count.
   */
  async recordFailedLogin(id, { max, lockedUntil, now }) {
    await db.query(
      `UPDATE Teachers
          SET LockedUntil = IF(FailedLogins + 1 >= ?, ?, LockedUntil),
              FailedLogins = IF(FailedLogins + 1 >= ?, 0, FailedLogins + 1)
        WHERE TeacherID = ?`,
      [max, lockedUntil, max, id],
    );
    const [[row]] = await db.query("SELECT LockedUntil AS lockedUntil FROM Teachers WHERE TeacherID = ?", [id]);
    // The number was not locked before this attempt (login checks that first).
    return { locked: row?.lockedUntil != null && new Date(row.lockedUntil) > now };
  },

  async recordLogin(id, now) {
    await db.query("UPDATE Teachers SET FailedLogins = 0, LockedUntil = NULL, LastLoginAt = ? WHERE TeacherID = ?", [now, id]);
  },

  /** The classes the teacher is class teacher of, with whether `date` is taken. */
  async classesOf(teacherId, branchId, date) {
    const [rows] = await db.query(
      `SELECT c.ClassID AS id, c.ClassName AS name, c.Section AS section,
              COUNT(DISTINCT s.StudentID) AS students, COUNT(a.AttendanceID) AS takenCount, MAX(a.MarkedAt) AS takenAt
         FROM Classes c
         LEFT JOIN Students s ON s.ClassID = c.ClassID AND s.branch_id = c.branch_id
         LEFT JOIN Attendance a ON a.StudentID = s.StudentID AND a.ClassDate = ?
        WHERE c.TeacherID = ? AND c.branch_id = ?
        GROUP BY c.ClassID, c.ClassName, c.Section
        ORDER BY c.ClassName, c.Section`,
      [date, teacherId, branchId],
    );
    return rows.map(({ takenCount, students, ...cls }) => ({
      ...cls,
      students: Number(students),
      taken: Number(takenCount) > 0,
      takenAt: cls.takenAt ?? null,
    }));
  },
};
