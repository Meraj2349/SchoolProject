import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import path from "path";
import { fileURLToPath } from "url";
import { importBenqa } from "../../src/modules/quiz/index.js";
import { db, resetDb } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, "fixtures/benqa");

afterAll(() => db.end());

describe("importing BEnQA questions", () => {
  beforeEach(resetDb);

  it("imports the chosen classes, skips bad rows, and keeps Bangla and LaTeX intact", async () => {
    const report = await importBenqa({ folder: FIXTURES, classKeys: ["8", "10"] });

    expect(report).toEqual({
      imported: 3,
      alreadyImported: 0,
      skipped: { quiz_spreadsheet_error: 1, quiz_answer_invalid: 1, quiz_duplicate: 1 },
    });
    const { rows } = await db.query(
      `SELECT "SourceKey", "ClassKey", "Subject", "Prompt", "OptionsJSON", "PromptBn", "OptionsBnJSON", "CorrectAnswer", "Active" FROM "QuizQuestions" ORDER BY "SourceKey"`,
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
    await db.query(`UPDATE "QuizQuestions" SET "Prompt" = 'Edited' WHERE "SourceKey" = 'benqa:8th-Math:1'`);

    const again = await importBenqa({ folder: FIXTURES, classKeys: ["8", "10"] });

    expect(again).toMatchObject({ imported: 0, alreadyImported: 3 });
    const row = await db.one(`SELECT COUNT(*) AS n FROM "QuizQuestions"`);
    expect(row.n).toBe(3);
    const edited = await db.one(`SELECT "Prompt" FROM "QuizQuestions" WHERE "SourceKey" = 'benqa:8th-Math:1'`);
    expect(edited.Prompt).toBe("Edited");
  });
});
