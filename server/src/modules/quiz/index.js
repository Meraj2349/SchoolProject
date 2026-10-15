import { makeQuestionBankUseCases } from "./application/questionBank.usecases.js";
import { loadBenqa } from "./infrastructure/benqaSource.js";
import { mysqlQuizRepository } from "./infrastructure/mysql-quiz.repository.js";

// Composition root: the only place that knows which concrete adapters are used.
export const questionBank = makeQuestionBankUseCases({ quizRepository: mysqlQuizRepository });

/** Imports the BEnQA CSVs in `folder` for the given class keys. */
export async function importBenqa({ folder, classKeys }) {
  return questionBank.importQuestions(await loadBenqa(folder, classKeys));
}
