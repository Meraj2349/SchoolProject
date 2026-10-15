import jwt from "jsonwebtoken";
import { makeQuestionBankUseCases } from "./application/questionBank.usecases.js";
import { makeQuizPlayUseCases } from "./application/quizPlay.usecases.js";
import { makeQuizResultsUseCases } from "./application/quizResults.usecases.js";
import { loadBenqa } from "./infrastructure/benqaSource.js";
import { mysqlQuizRepository } from "./infrastructure/mysql-quiz.repository.js";
import { mysqlStudentDirectory } from "./infrastructure/mysql-student-directory.js";
import { makeQuizController } from "./interface/quiz.controller.js";

// Composition root: the only place that knows which concrete adapters are used.

const QUIZ_TOKEN_EXPIRY = "30m";

// A short-lived token for taking quizzes; quizStudentMiddleware checks it and
// the admin auth middleware rejects it.
const issueQuizToken = (student) =>
  jwt.sign({ studentId: student.studentId, branch_id: student.branchId, userType: "quiz" }, process.env.JWT_SECRET_KEY, {
    expiresIn: QUIZ_TOKEN_EXPIRY,
  });

export const questionBank = makeQuestionBankUseCases({ quizRepository: mysqlQuizRepository });

export const quizController = makeQuizController({
  play: makeQuizPlayUseCases({
    quizRepository: mysqlQuizRepository,
    studentDirectory: mysqlStudentDirectory,
    issueToken: issueQuizToken,
  }),
  bank: questionBank,
  results: makeQuizResultsUseCases({ quizRepository: mysqlQuizRepository }),
});

/** Imports the BEnQA CSVs in `folder` for the given class keys. */
export async function importBenqa({ folder, classKeys }) {
  return questionBank.importQuestions(await loadBenqa(folder, classKeys));
}
