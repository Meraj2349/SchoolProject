import db from "../../../shared/db/index.js";
import { branchFilter } from "../../../../utils/branchFilter.js";
import { ConflictError } from "../../../shared/errors/index.js";

// Database adapter for the teacher account port (see
// application/fakeTeacherAccountRepository.js). The sign-in columns live on
// Teachers (attendance_v2_migration.sql).

const ACCOUNT_COLUMNS = `t."TeacherID" AS id, t."FirstName" AS "firstName", t."LastName" AS "lastName", t.branch_id AS "branchId",
  t."AppPhone" AS phone, t."AppPasswordHash" AS "passwordHash", t."AppEnabled" AS enabled, t."TokenVersion" AS "tokenVersion",
  t."LastLoginAt" AS "lastLoginAt", t."FailedLogins" AS "failedLogins", t."LockedUntil" AS "lockedUntil",
  b.name_bn AS "branchNameBn", b.name_en AS "branchNameEn"`;

// Teachers (t) with their branch (b).
const ACCOUNTS = `"Teachers" t LEFT JOIN "Branches" b ON b.id = t.branch_id`;

function toAccount(row) {
  if (!row) return null;
  const { branchNameBn, branchNameEn, ...account } = row;
  return {
    ...account,
    enabled: Boolean(account.enabled),
    branch: { id: account.branchId, nameBn: branchNameBn, nameEn: branchNameEn },
  };
}

export const mysqlTeacherAccountRepository = {
  async findAccount(id) {
    const row = await db.one(`SELECT ${ACCOUNT_COLUMNS} FROM ${ACCOUNTS} WHERE t."TeacherID" = ?`, [id]);
    return toAccount(row);
  },

  async findAccountByPhone(phone) {
    const row = await db.one(`SELECT ${ACCOUNT_COLUMNS} FROM ${ACCOUNTS} WHERE t."AppPhone" = ?`, [phone]);
    return toAccount(row);
  },

  async listAccess(branchId) {
    const scope = branchFilter(branchId, "t");
    const { rows } = await db.query(
      `SELECT ${ACCOUNT_COLUMNS} FROM ${ACCOUNTS} WHERE 1=1 ${scope.clause} ORDER BY t."FirstName", t."LastName", t."TeacherID"`,
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
      phone !== undefined && [`"AppPhone" = ?`, [phone]],
      enabled !== undefined && [`"AppEnabled" = ?`, [enabled]],
      passwordHash !== undefined && [`"AppPasswordHash" = ?, "FailedLogins" = 0, "LockedUntil" = NULL`, [passwordHash]],
      signOut && [`"TokenVersion" = "TokenVersion" + 1`, []],
    ].filter(Boolean);
    if (changes.length === 0) return;
    const sets = changes.map(([set]) => set);
    const params = changes.flatMap(([, values]) => values);
    try {
      await db.query(`UPDATE "Teachers" SET ${sets.join(", ")} WHERE "TeacherID" = ?`, [...params, id]);
    } catch (error) {
      if (db.isUniqueViolation(error)) throw new ConflictError("teacher_app_phone_taken");
      throw error;
    }
  },

  /**
   * Counts a password check before it is made. The teacher's row stays locked
   * (FOR UPDATE) until the count is saved, so guesses sent at the same moment
   * cannot all pass a lock check first. Refused while the number is locked.
   * The `max`th check in a row locks it until `lockedUntil`; an expired lock
   * starts the count again.
   */
  async reserveLoginAttempt(id, { max, lockedUntil, now }) {
    return db.withTransaction(async (tx) => {
      const row = await tx.one(`SELECT "FailedLogins" AS failed, "LockedUntil" AS until FROM "Teachers" WHERE "TeacherID" = ? FOR UPDATE`, [
        id,
      ]);
      if (!row || (row.until != null && row.until > now)) return { allowed: false };
      const failed = row.until != null ? 1 : row.failed + 1;
      await tx.query(`UPDATE "Teachers" SET "FailedLogins" = ?, "LockedUntil" = ? WHERE "TeacherID" = ?`, [
        failed,
        failed >= max ? lockedUntil : null,
        id,
      ]);
      return { allowed: true };
    });
  },

  async recordLogin(id, now) {
    await db.query(`UPDATE "Teachers" SET "FailedLogins" = 0, "LockedUntil" = NULL, "LastLoginAt" = ? WHERE "TeacherID" = ?`, [now, id]);
  },

  /** The classes the teacher is class teacher of, with whether `date` is taken. */
  async classesOf(teacherId, branchId, date) {
    const { rows } = await db.query(
      `SELECT c."ClassID" AS id, c."ClassName" AS name, c."Section" AS section,
              COUNT(DISTINCT s."StudentID") AS students, COUNT(a."AttendanceID") AS "takenCount", MAX(a."MarkedAt") AS "takenAt"
         FROM "Classes" c
         LEFT JOIN "Students" s ON s."ClassID" = c."ClassID" AND s.branch_id = c.branch_id
         LEFT JOIN "Attendance" a ON a."StudentID" = s."StudentID" AND a."ClassDate" = ?
        WHERE c."TeacherID" = ? AND c.branch_id = ?
        GROUP BY c."ClassID", c."ClassName", c."Section"
        ORDER BY c."ClassName", c."Section"`,
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
