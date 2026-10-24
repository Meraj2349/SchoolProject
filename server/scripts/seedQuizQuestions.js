// Imports the BEnQA questions (server/data/quiz/benqa) into QuizQuestions.
// Safe to re-run: questions already imported are left alone.
//
// Run:  npm run seed:quiz                      (Class 8 and 10)
//       npm run seed:quiz -- --classes 8,10,12

import path from "path";
import { fileURLToPath } from "url";
import db from "../src/shared/db/index.js";
import { importBenqa } from "../src/modules/quiz/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOLDER = path.resolve(__dirname, "../data/quiz/benqa");
const DEFAULT_CLASSES = ["8", "10"];

function classKeysFromArgs(args) {
  const index = args.indexOf("--classes");
  if (index === -1) return DEFAULT_CLASSES;
  return String(args[index + 1] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function main() {
  const classKeys = classKeysFromArgs(process.argv.slice(2));
  console.log(`Importing BEnQA questions for classes ${classKeys.join(", ")} from ${FOLDER}`);
  const report = await importBenqa({ folder: FOLDER, classKeys });
  console.log(`Imported: ${report.imported}, already there: ${report.alreadyImported}`);
  for (const [reason, count] of Object.entries(report.skipped)) console.log(`Skipped (${reason}): ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.end());
