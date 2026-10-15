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
