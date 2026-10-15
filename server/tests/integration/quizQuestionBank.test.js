import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { importBenqa } from "../../src/modules/quiz/index.js";
import { db, resetDb } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, "fixtures/benqa");
const MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/quiz_question_bank_migration.sql"), "utf8");
const STARTS_MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/quiz_starts_migration.sql"), "utf8");

afterAll(() => db.end());

async function runMigration(sql = MIGRATION) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  try {
    await connection.query(sql);
  } finally {
    await connection.end();
  }
}

const describeTable = async () => {
  const [columns] = await db.query(
    "SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable, COLUMN_DEFAULT AS def FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' ORDER BY COLUMN_NAME",
  );
  const [indexes] = await db.query(
    "SELECT DISTINCT INDEX_NAME AS name, NON_UNIQUE AS nonUnique FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizQuestions' ORDER BY INDEX_NAME",
  );
  return { columns, indexes };
};

const NEW_COLUMNS = ["SourceKey", "ClassKey", "PromptBn", "OptionsBnJSON", "Active", "CreatedBy", "UpdatedBy"];

describe("quiz_question_bank_migration.sql", () => {
  beforeEach(resetDb);

  it("upgrades an old QuizQuestions table to the fresh-install shape, safely twice, and fills in the class", async () => {
    const fresh = await describeTable();
    await db.query("ALTER TABLE QuizQuestions DROP INDEX uq_quiz_question_source, DROP INDEX idx_quiz_question_class_subject");
    await db.query(`ALTER TABLE QuizQuestions ${NEW_COLUMNS.map((c) => `DROP COLUMN ${c}`).join(", ")}`);
    const old = (grade) =>
      db.query("INSERT INTO QuizQuestions (Prompt, OptionsJSON, CorrectAnswer, Subject, Grade) VALUES ('Old question', '{}', 'A', 'Math', ?)", [grade]);
    await old("10th");
    await old("Class 5");
    await old("8");
    await old("Nursery");
    const session = (grade) =>
      db.query(
        "INSERT INTO QuizSessions (StudentName, Grade, TotalQuestions, CorrectAnswers, ScorePercentage, TimeTakenSeconds) VALUES ('Old', ?, 1, 1, 100, 10)",
        [grade],
      );
    await session("10th");
    await session("all");

    await runMigration();
    await runMigration();

    expect(await describeTable()).toEqual(fresh);
    const [rows] = await db.query("SELECT Grade, ClassKey, Active FROM QuizQuestions ORDER BY QuestionID");
    expect(rows).toEqual([
      { Grade: "10th", ClassKey: "10", Active: 1 },
      { Grade: "Class 5", ClassKey: "5", Active: 1 },
      { Grade: "8", ClassKey: "8", Active: 1 },
      { Grade: "Nursery", ClassKey: null, Active: 1 },
    ]);
    const [sessions] = await db.query("SELECT Grade FROM QuizSessions ORDER BY SessionID");
    expect(sessions.map((s) => s.Grade)).toEqual(["10", null]);
  });
});

describe("quiz_starts_migration.sql", () => {
  beforeEach(resetDb);

  it("creates the QuizStarts table like a fresh install, safely twice", async () => {
    const columns = async () => {
      const [rows] = await db.query(
        "SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'QuizStarts' ORDER BY COLUMN_NAME",
      );
      return rows;
    };
    const fresh = await columns();
    await db.query("DROP TABLE QuizStarts");

    await runMigration(STARTS_MIGRATION);
    await runMigration(STARTS_MIGRATION);

    expect(fresh.length).toBeGreaterThan(0);
    expect(await columns()).toEqual(fresh);
  });
});

describe("importing BEnQA questions", () => {
  beforeEach(resetDb);

  it("imports the chosen classes, skips bad rows, and keeps Bangla and LaTeX intact", async () => {
    const report = await importBenqa({ folder: FIXTURES, classKeys: ["8", "10"] });

    expect(report).toEqual({
      imported: 3,
      alreadyImported: 0,
      skipped: { quiz_spreadsheet_error: 1, quiz_answer_invalid: 1, quiz_duplicate: 1 },
    });
    const [rows] = await db.query(
      "SELECT SourceKey, ClassKey, Subject, Prompt, OptionsJSON, PromptBn, OptionsBnJSON, CorrectAnswer, Active FROM QuizQuestions ORDER BY SourceKey",
    );
    expect(rows.map((r) => r.SourceKey)).toEqual(["benqa:10th-Physics:1", "benqa:10th-Physics:5", "benqa:8th-Math:1"]);
    expect(rows[0]).toMatchObject({
      ClassKey: "10",
      Subject: "Physics",
      PromptBn: "গাড়ির রিয়ার ভিউ মিরর হিসাবে কোন ধরনের দর্পণ ব্যবহৃত হয়?",
      OptionsBnJSON: { A: "অবতল", B: "উত্তল", C: "সমতল", D: "অভিসারী" },
      CorrectAnswer: "B",
      Active: 1,
    });
    expect(rows[1].Prompt).toBe('What is \\frac{1}{2} + \\frac{1}{2}, written "simply"?');
    expect(rows[1].OptionsJSON.D).toBe("\\frac{1}{4}");
  });

  it("adds nothing the second time and leaves edited questions alone", async () => {
    await importBenqa({ folder: FIXTURES, classKeys: ["8", "10"] });
    await db.query("UPDATE QuizQuestions SET Prompt = 'Edited' WHERE SourceKey = 'benqa:8th-Math:1'");

    const again = await importBenqa({ folder: FIXTURES, classKeys: ["8", "10"] });

    expect(again).toMatchObject({ imported: 0, alreadyImported: 3 });
    const [[row]] = await db.query("SELECT COUNT(*) AS n FROM QuizQuestions");
    expect(row.n).toBe(3);
    const [[edited]] = await db.query("SELECT Prompt FROM QuizQuestions WHERE SourceKey = 'benqa:8th-Math:1'");
    expect(edited.Prompt).toBe("Edited");
  });
});
