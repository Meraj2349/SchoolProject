import { ValidationError } from "../../../shared/errors/index.js";
import { toQuestion } from "../domain/question.js";

// A question for import: drop incomplete Bangla rather than lose the question.
function importable(input) {
  try {
    return toQuestion(input);
  } catch (error) {
    if (error.code !== "quiz_bangla_incomplete") throw error;
    return toQuestion({ ...input, promptBn: null, optionsBn: null });
  }
}

const sameQuestionKey = (q) => `${q.classKey}|${q.subject.toLowerCase()}|${q.prompt.replace(/\s+/g, " ").toLowerCase()}`;

/**
 * The question bank: importing, and (later) listing and editing questions.
 * Questions are shared by every branch.
 *
 * @param {object} deps
 * @param {{existingSourceKeys, createQuestion}} deps.quizRepository
 */
export function makeQuestionBankUseCases({ quizRepository }) {
  return {
    /**
     * Adds questions from a data set. Rows already imported (same sourceKey)
     * are left alone so teachers' edits survive a re-import. Returns counts,
     * with skipped rows grouped by reason (an i18n code).
     */
    async importQuestions(inputs) {
      const report = { imported: 0, alreadyImported: 0, skipped: {} };
      const skip = (reason) => (report.skipped[reason] = (report.skipped[reason] ?? 0) + 1);

      const existing = await quizRepository.existingSourceKeys(inputs.map((input) => input.sourceKey));
      const seen = new Set();

      for (const input of inputs) {
        let question;
        try {
          question = importable(input);
        } catch (error) {
          if (!(error instanceof ValidationError)) throw error;
          skip(error.code);
          continue;
        }
        const key = sameQuestionKey(question);
        if (seen.has(key)) {
          skip("quiz_duplicate");
          continue;
        }
        seen.add(key);

        if (existing.has(input.sourceKey)) {
          report.alreadyImported += 1;
          continue;
        }
        await quizRepository.createQuestion({ ...question, sourceKey: input.sourceKey });
        report.imported += 1;
      }
      return report;
    },
  };
}
