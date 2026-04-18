// One-shot seed: import questions from web_application/data/questions.json
// into the QuizQuestions table. Idempotent — uses SourceQuestionID UNIQUE
// constraint to skip rows already imported.
//
// Run: node server/scripts/seedQuizQuestions.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUESTIONS_FILE = path.resolve(
  __dirname,
  "../../web_application/data/questions.json",
);

async function main() {
  if (!fs.existsSync(QUESTIONS_FILE)) {
    console.error("questions.json not found at", QUESTIONS_FILE);
    process.exit(1);
  }

  const raw = fs.readFileSync(QUESTIONS_FILE, "utf8");
  const questions = JSON.parse(raw);
  console.log(`Loaded ${questions.length} questions from JSON`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const q of questions) {
    const sourceId = q.id ?? null;
    const prompt = q.question ?? "";
    const options = q.options ?? {};
    const correct = (q.correct_answer ?? "").toString().toUpperCase().slice(0, 1);
    const subject = q.subject ?? null;
    const grade = q.grade ?? null;
    const difficulty = q.difficulty ?? null;
    const sourceFile = q.source_file ?? null;

    if (!prompt || !correct || !["A", "B", "C", "D"].includes(correct)) {
      failed++;
      continue;
    }

    try {
      const [result] = await db.query(
        `INSERT IGNORE INTO QuizQuestions
           (SourceQuestionID, Prompt, OptionsJSON, CorrectAnswer, Subject, Grade, Difficulty, SourceFile, Language)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sourceId,
          prompt,
          JSON.stringify(options),
          correct,
          subject,
          grade,
          difficulty,
          sourceFile,
          "en",
        ],
      );
      if (result.affectedRows > 0) inserted++;
      else skipped++;
    } catch (err) {
      console.error(`Failed id=${sourceId}:`, err.message);
      failed++;
    }
  }

  console.log(`Inserted: ${inserted}, skipped (dup): ${skipped}, failed: ${failed}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
