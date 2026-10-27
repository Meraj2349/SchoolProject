import { afterAll, describe, expect, it } from "@jest/globals";
import { db } from "./helpers.js";

// What a fresh install gets (the dbmate migrations). These are the columns
// and tables the application code queries.

const columnsOf = async (table) => {
  const { rows } = await db.query(
    `SELECT column_name AS name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ?`,
    [table],
  );
  return rows.map((r) => r.name);
};

/** The table a column's foreign key points to. */
const referencedTable = async (table, column) => {
  const row = await db.one(
    `SELECT target.relname AS target FROM pg_constraint k
       JOIN pg_class source ON source.oid = k.conrelid
       JOIN pg_class target ON target.oid = k.confrelid
       JOIN pg_attribute a ON a.attrelid = k.conrelid AND a.attnum = ANY (k.conkey)
      WHERE k.contype = 'f' AND source.relname = ? AND a.attname = ?`,
    [table, column],
  );
  return row?.target;
};

/** The column lists of a table's unique keys, e.g. "ClassName,Section,branch_id". */
const uniqueKeys = async (table) => {
  const { rows } = await db.query(
    `SELECT string_agg(a.attname, ',' ORDER BY k.ord) AS cols
       FROM pg_index i
       JOIN pg_class t ON t.oid = i.indrelid
       CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord)
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
      WHERE t.relname = ? AND i.indisunique AND NOT i.indisprimary
      GROUP BY i.indexrelid`,
    [table],
  );
  return rows.map((r) => r.cols);
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
  it.each(["Notices", "NoticeAnnouncements", "News", "Messages", "Images", "Applications", "Achievements", "JobCirculars", "JobApplications"])(
    "gives %s an optional branch that must exist",
    async (table) => {
      const column = await db.one(
        `SELECT is_nullable AS nullable FROM information_schema.columns
          WHERE table_schema = current_schema() AND table_name = ? AND column_name = 'branch_id'`,
        [table],
      );
      expect(column?.nullable).toBe("YES");
      expect(await referencedTable(table, "branch_id")).toBe("Branches");
    },
  );

  it("has the shared ClassNames reference table with the standard classes", async () => {
    const { rows } = await db.query(`SELECT name FROM "ClassNames" ORDER BY sort_order`);
    expect(rows.map((r) => r.name)).toEqual(expect.arrayContaining(["Play", "Class 1", "Class 10"]));
  });

  it("makes a class name + section unique per branch, not globally", async () => {
    expect(await uniqueKeys("Classes")).toContain("ClassName,Section,branch_id");
  });
});
