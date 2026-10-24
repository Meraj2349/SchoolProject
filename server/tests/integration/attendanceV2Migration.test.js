import { afterAll, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { BRANCH_A, count, db, insert, resetDb, seedStudent } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/attendance_v2_migration.sql"), "utf8");

const runMigration = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  try {
    await connection.query(MIGRATION);
  } finally {
    await connection.end();
  }
};

const columnsOf = async (table) => {
  const { rows: rows } = await db.query(
    `SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable, COLUMN_DEFAULT AS def
       FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY COLUMN_NAME`,
    [table],
  );
  return rows;
};

const uniqueKeysOf = async (table) => {
  const { rows: rows } = await db.query(
    `SELECT GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols
       FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND NON_UNIQUE = 0 AND INDEX_NAME <> 'PRIMARY'
      GROUP BY INDEX_NAME ORDER BY cols`,
    [table],
  );
  return rows.map((r) => r.cols);
};

const foreignKeysOf = async (table) => {
  const { rows: rows } = await db.query(
    `SELECT CONSTRAINT_NAME AS name FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY' ORDER BY name`,
    [table],
  );
  return rows.map((r) => r.name);
};

const snapshot = async () => ({
  attendance: await columnsOf("Attendance"),
  attendanceKeys: await uniqueKeysOf("Attendance"),
  attendanceFks: await foreignKeysOf("Attendance"),
  teachers: await columnsOf("Teachers"),
  teacherKeys: await uniqueKeysOf("Teachers"),
  sms: await columnsOf("AttendanceSms"),
  smsKeys: await uniqueKeysOf("AttendanceSms"),
  smsFks: await foreignKeysOf("AttendanceSms"),
});

// The schema before this migration: one row per student, class and day, so a
// student could hold two rows for one day (another class, or a NULL class).
async function restoreOldSchema() {
  await db.query("DROP TABLE AttendanceSms");
  await db.query("DROP TABLE Attendance");
  await db.query(`
    CREATE TABLE Attendance (
      AttendanceID INT PRIMARY KEY AUTO_INCREMENT,
      StudentID INT NOT NULL,
      ClassID INT NULL,
      ClassDate DATE NOT NULL,
      Status ENUM ('Present', 'Absent', 'Late') NOT NULL,
      branch_id INT NOT NULL DEFAULT 1,
      FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
      CONSTRAINT fk_attendance_class FOREIGN KEY (ClassID) REFERENCES Classes (ClassID) ON DELETE SET NULL,
      UNIQUE (StudentID, ClassID, ClassDate)
    )`);
  await db.query("ALTER TABLE Attendance ADD CONSTRAINT fk_attendance_branch FOREIGN KEY (branch_id) REFERENCES Branches (id)");
  await db.query(`ALTER TABLE Teachers DROP INDEX uq_teachers_app_phone, DROP COLUMN AppPhone, DROP COLUMN AppPasswordHash,
    DROP COLUMN AppEnabled, DROP COLUMN TokenVersion, DROP COLUMN LastLoginAt, DROP COLUMN FailedLogins, DROP COLUMN LockedUntil`);
}

describe("attendance_v2_migration.sql", () => {
  afterAll(() => db.end());

  it("brings an old database to the fresh-install schema, keeps the newest row per student and day, and is safe to run twice", async () => {
    await resetDb();
    const fresh = await snapshot();
    await restoreOldSchema();

    const { classId, studentId } = await seedStudent({ branchId: BRANCH_A, roll: "1" });
    const otherClass = await insert("Classes", { ClassName: "Class 6", Section: "Good", branch_id: BRANCH_A });
    const old = (ClassID, ClassDate, Status) =>
      insert("Attendance", { StudentID: studentId, ClassID, ClassDate, Status, branch_id: BRANCH_A });
    await old(classId, "2026-01-05", "Present");
    await old(null, "2026-01-05", "Absent");
    await old(otherClass, "2026-01-05", "Late"); // the newest of the three
    await old(classId, "2026-01-06", "Absent");

    await runMigration();
    await runMigration();

    expect(await snapshot()).toEqual(fresh);
    const { rows: rows } = await db.query("SELECT ClassDate, Status FROM Attendance ORDER BY ClassDate");
    expect(rows).toEqual([
      { ClassDate: "2026-01-05", Status: "Late" },
      { ClassDate: "2026-01-06", Status: "Absent" },
    ]);
    await expect(old(classId, "2026-01-06", "Present")).rejects.toThrow(/duplicate/i);
    await old(classId, "2026-01-07", "Leave");
    expect(await count("Attendance", "Status = 'Leave'")).toBe(1);
  });

  it("gives a fresh install one row per student per day, the Leave status and who marked it", async () => {
    await resetDb();

    expect(await uniqueKeysOf("Attendance")).toEqual(["StudentID,ClassDate"]);
    expect((await columnsOf("Attendance")).map((c) => c.name)).toEqual(
      expect.arrayContaining(["MarkedByType", "MarkedBy", "MarkedAt", "UpdatedAt"]),
    );
    const status = (await columnsOf("Attendance")).find((c) => c.name === "Status");
    expect(status.type).toBe("enum('Present','Absent','Late','Leave')");
    expect(await uniqueKeysOf("Teachers")).toEqual(["AppPhone"]);
    expect(await uniqueKeysOf("AttendanceSms")).toEqual(["student_id,class_date"]);
  });
});
