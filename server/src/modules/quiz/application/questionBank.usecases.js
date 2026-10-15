import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { toPage } from "../../../shared/paging.js";
import { classKey } from "../domain/classKey.js";
import { toQuestion, toQuestionChanges } from "../domain/question.js";

const STATUSES = ["active", "hidden", "all"];

function requireClassKey(value) {
  const key = classKey(value);
  if (!key) throw new ValidationError("quiz_class_invalid");
  return key;
}

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
 * The question bank: importing, listing, adding, editing and hiding
 * questions. Questions are shared by every branch. They are hidden rather
 * than deleted, so past quiz attempts keep their questions.
 *
 * @param {object} deps
 * @param {{existingSourceKeys, createQuestion, findQuestion, updateQuestion, listQuestions, subjectCounts}} deps.quizRepository
 */
export function makeQuestionBankUseCases({ quizRepository }) {
  async function findOrFail(id) {
    const question = await quizRepository.findQuestion(id);
    if (!question) throw new NotFoundError("quiz_question_not_found");
    return question;
  }

  return {
    async listQuestions({ classKey: key, subject, search, status, page, pageSize }) {
      const paging = toPage({ page, pageSize });
      const { items, total } = await quizRepository.listQuestions({
        classKey: requireClassKey(key),
        subject: String(subject ?? "").trim() || null,
        search: String(search ?? "").trim() || null,
        status: STATUSES.includes(status) ? status : "active",
        offset: paging.offset,
        pageSize: paging.pageSize,
      });
      return { items, total, page: paging.page, pageSize: paging.pageSize };
    },

    /** Subjects of a class with how many questions each has (hidden included). */
    subjectsFor: async (key) => quizRepository.subjectCounts({ classKey: requireClassKey(key), activeOnly: false }),

    getQuestion: findOrFail,

    async createQuestion({ input, adminId }) {
      const question = toQuestion(input);
      const { id } = await quizRepository.createQuestion({ ...question, createdBy: adminId });
      return findOrFail(id);
    },

    async updateQuestion({ id, input, adminId }) {
      const existing = await findOrFail(id);
      const changes = toQuestionChanges(input ?? {}, existing);
      await quizRepository.updateQuestion(existing.id, { ...changes, updatedBy: adminId });
      return findOrFail(existing.id);
    },

    async setActive({ id, active, adminId }) {
      if (typeof active !== "boolean") throw new ValidationError("quiz_active_invalid");
      const existing = await findOrFail(id);
      await quizRepository.updateQuestion(existing.id, { active, updatedBy: adminId });
      return findOrFail(existing.id);
    },

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
