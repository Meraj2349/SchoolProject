import fs from "fs/promises";
import path from "path";
import { classKey } from "../domain/classKey.js";
import { parseCsv } from "./csv.js";

// Reads the BEnQA dataset (https://github.com/sheikhshafayat/BEnQA): one CSV
// per class and subject, e.g. "10th-Math-II.csv", with English and Bangla
// columns. Produces question inputs for the importQuestions use case.

const FILE_NAME = /^(\d{1,2}(?:st|nd|rd|th))-(.+)\.csv$/i;

/** { classKey, subject, name } for a BEnQA file name, or null. */
export function benqaFileInfo(fileName) {
  const match = path.basename(fileName).match(FILE_NAME);
  const key = match && classKey(match[1]);
  if (!key) return null;
  return { classKey: key, subject: match[2], name: `${match[1]}-${match[2]}` };
}

const optionsOf = (row, suffix = "") =>
  Object.fromEntries(["A", "B", "C", "D"].map((letter) => [letter, row[`${letter}${suffix}`] ?? ""]));

/** Question inputs from one BEnQA CSV file. sourceKey is stable across runs. */
export function benqaQuestions(fileName, csvText) {
  const info = benqaFileInfo(fileName);
  if (!info) return [];
  return parseCsv(csvText).map((row, index) => ({
    sourceKey: `benqa:${info.name}:${index + 1}`,
    classKey: info.classKey,
    subject: info.subject,
    prompt: row["English Question"] ?? "",
    options: optionsOf(row),
    promptBn: row["Bengali Question"] ?? "",
    optionsBn: optionsOf(row, " Bn"),
    answer: row["Correct Answer"] ?? "",
  }));
}

/** Every question input in a BEnQA folder for the given class keys. */
export async function loadBenqa(folder, classKeys) {
  const files = (await fs.readdir(folder)).filter((file) => {
    const info = benqaFileInfo(file);
    return info && classKeys.includes(info.classKey);
  });
  const questions = [];
  for (const file of files.sort()) {
    questions.push(...benqaQuestions(file, await fs.readFile(path.join(folder, file), "utf8")));
  }
  return questions;
}
