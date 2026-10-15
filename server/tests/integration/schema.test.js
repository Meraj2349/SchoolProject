import { afterAll, describe, expect, it } from "@jest/globals";
import { db } from "./helpers.js";

// Sql/database.sql is what a fresh install (docker-compose) loads. These are
// the columns and tables the application code queries.
const columnsOf = async (table) => {
  const [rows] = await db.query(
    "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    [table],
  );
  return rows.map((r) => r.name);
};

describe("fresh database schema", () => {
  afterAll(() => db.end());

  it("gives admins a role and a branch", async () => {
    expect(await columnsOf("Admin")).toEqual(expect.arrayContaining(["role", "branch_id"]));
  });

  it.each([
    "Students",
    "Teachers",
    "Classes",
    "Subjects",
    "Attendance",
    "Exams",
    "Results",
    "Events",
    "Routines",
    "QuizSessions",
    "FeeSettings",
    "FeeStructures",
    "FeeHeads",
    "StudentDiscounts",
    "FeeInvoices",
    "FeePayments",
  ])("scopes %s by branch_id", async (table) => {
    expect(await columnsOf(table)).toContain("branch_id");
  });

  // Website content and applications: NULL means the whole school.
  it.each(["Notices", "NoticeAnnouncements", "News", "Messages", "Images", "Applications"])(
    "gives %s an optional branch that must exist",
    async (table) => {
      const [[column]] = await db.query(
        `SELECT IS_NULLABLE AS nullable FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'branch_id'`,
        [table],
      );
      const [[fk]] = await db.query(
        `SELECT REFERENCED_TABLE_NAME AS target FROM information_schema.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'branch_id'
            AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [table],
      );
      expect(column?.nullable).toBe("YES");
      expect(fk?.target).toBe("Branches");
    },
  );

  it("has the shared ClassNames reference table with the standard classes", async () => {
    const [rows] = await db.query("SELECT name FROM ClassNames ORDER BY sort_order");
    expect(rows.map((r) => r.name)).toEqual(expect.arrayContaining(["Play", "Class 1", "Class 10"]));
  });

  it("makes a class name + section unique per branch, not globally", async () => {
    const [rows] = await db.query(
      `SELECT INDEX_NAME AS name, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols
         FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Classes' AND NON_UNIQUE = 0
        GROUP BY INDEX_NAME`,
    );
    expect(rows.map((r) => r.cols)).toContain("ClassName,Section,branch_id");
  });
});
