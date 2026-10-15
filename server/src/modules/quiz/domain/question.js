import { ValidationError } from "../../../shared/errors/index.js";
import { classKey } from "./classKey.js";

// A multiple-choice quiz question: English text and options A–D, optional
// Bangla text and options, and the correct letter. Text may contain LaTeX.

export const LETTERS = ["A", "B", "C", "D"];
const SUBJECT_MAX = 100; // QuizQuestions.Subject VARCHAR(100)

// Cells a spreadsheet wrote instead of a value (seen in imported data).
const SPREADSHEET_ERROR = /#(ERROR!|NAME\?|VALUE!|REF!|DIV\/0!|N\/A)/;

const text = (value) => String(value ?? "").trim();

function rejectSpreadsheetErrors(...values) {
  if (values.some((value) => SPREADSHEET_ERROR.test(value))) throw new ValidationError("quiz_spreadsheet_error");
}

function optionsFrom(raw) {
  return Object.fromEntries(LETTERS.map((letter) => [letter, text(raw?.[letter])]));
}

const isComplete = (options) => LETTERS.every((letter) => options[letter]);

/** Validates a question; throws ValidationError with an i18n code. */
export function toQuestion(input) {
  const key = classKey(input.classKey);
  if (!key) throw new ValidationError("quiz_class_invalid");

  const subject = text(input.subject);
  if (!subject) throw new ValidationError("quiz_subject_required");
  if (subject.length > SUBJECT_MAX) throw new ValidationError("quiz_subject_too_long");

  const prompt = text(input.prompt);
  if (!prompt) throw new ValidationError("quiz_prompt_required");
  const options = optionsFrom(input.options);
  if (!isComplete(options)) throw new ValidationError("quiz_options_required");

  const answer = text(input.answer).toUpperCase();
  if (!LETTERS.includes(answer)) throw new ValidationError("quiz_answer_invalid");

  // Bangla is optional, but a Bangla question needs all four Bangla options.
  const promptBn = text(input.promptBn) || null;
  const optionsBn = promptBn ? optionsFrom(input.optionsBn) : null;
  if (optionsBn && !isComplete(optionsBn)) throw new ValidationError("quiz_bangla_incomplete");

  rejectSpreadsheetErrors(prompt, ...Object.values(options), promptBn ?? "", ...Object.values(optionsBn ?? {}));

  return { classKey: key, subject, prompt, options, promptBn, optionsBn, answer };
}

/** The question after applying the fields that were sent, validated again. */
export function toQuestionChanges(input, existing) {
  const merged = { ...existing };
  for (const field of ["classKey", "subject", "prompt", "options", "promptBn", "optionsBn", "answer"]) {
    if (input[field] !== undefined) merged[field] = input[field];
  }
  return toQuestion(merged);
}
