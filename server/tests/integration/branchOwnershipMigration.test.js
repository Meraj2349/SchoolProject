import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { BRANCH_A, BRANCH_B, db, insert, resetDb, seedStudent } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/branch_ownership_migration.sql"), "utf8");

afterAll(() => db.end());

async function runMigration() {
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
}

describe("branch_ownership_migration.sql", () => {
  beforeEach(resetDb);

  it("gives old exams and results their real branch, and is safe to run twice", async () => {
    const { classId, studentId } = await seedStudent({ branchId: BRANCH_B });
    // Saved by the old code: everything said branch 1.
    const examId = await insert("Exams", { ExamType: "Monthly", ExamName: "M1", ClassID: classId, ExamDate: "2030-01-01", branch_id: BRANCH_A });
    const subjectId = await insert("Subjects", { SubjectName: "Math", ClassID: classId, branch_id: BRANCH_B });
    await insert("Results", { StudentID: studentId, ExamID: examId, SubjectID: subjectId, ClassID: classId, MarksObtained: 70, branch_id: BRANCH_A });

    await runMigration();
    await runMigration();

    const exam = await db.one("SELECT branch_id FROM Exams");
    const result = await db.one("SELECT branch_id FROM Results");
    expect([exam.branch_id, result.branch_id]).toEqual([BRANCH_B, BRANCH_B]);
  });
});
