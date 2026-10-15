import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { classKey } from "../domain/classKey.js";
import { letterGrade, scoreAnswers, summarize } from "../domain/scoring.js";

const IDENTITY_FIELDS = ["branchId", "firstName", "lastName", "className", "section", "rollNumber"];
const DEFAULT_COUNT = 10;
const MAX_COUNT = 50;
const MAX_QUIZ_SECONDS = 24 * 3600;

const text = (value) => String(value ?? "").trim();
const subjectFilter = (subject) => (text(subject) && text(subject) !== "all" ? text(subject) : null);

function questionCount(value) {
  const count = Number.parseInt(value, 10);
  return Number.isInteger(count) && count >= 1 ? Math.min(count, MAX_COUNT) : DEFAULT_COUNT;
}

function quizSeconds(value) {
  const seconds = Number.parseInt(value, 10);
  return Number.isInteger(seconds) && seconds > 0 ? Math.min(seconds, MAX_QUIZ_SECONDS) : 0;
}

// What a student sees of a question while answering: never the answer.
const toPlayable = ({ id, classKey: key, subject, prompt, options, promptBn, optionsBn }) => ({
  id,
  classKey: key,
  subject,
  prompt,
  options,
  promptBn,
  optionsBn,
});

/**
 * Taking a quiz. A student only ever gets — and is only ever scored on —
 * active questions for their own class, looked up fresh on every request.
 *
 * @param {object} deps
 * @param {{subjectCounts, randomQuestions, questionsByIds, saveSession}} deps.quizRepository
 * @param {{verify(identity), findById(studentId)}} deps.studentDirectory
 * @param {(student) => string} deps.issueToken
 * @param {() => Date} [deps.now]
 */
export function makeQuizPlayUseCases({ quizRepository, studentDirectory, issueToken, now = () => new Date() }) {
  const withClassKey = (student) => ({ ...student, classKey: classKey(student.className) });

  async function requireStudent(studentId) {
    const student = await studentDirectory.findById(studentId);
    if (!student) throw new NotFoundError("quiz_student_not_found");
    return withClassKey(student);
  }

  return {
    async verifyStudent(input) {
      const identity = Object.fromEntries(IDENTITY_FIELDS.map((field) => [field, text(input?.[field])]));
      if (IDENTITY_FIELDS.some((field) => !identity[field])) throw new ValidationError("quiz_identity_required");

      const student = await studentDirectory.verify({ ...identity, branchId: Number(identity.branchId) });
      if (!student) throw new NotFoundError("quiz_student_not_found");
      return { token: issueToken(student), student: withClassKey(student) };
    },

    async metaFor(studentId) {
      const student = await requireStudent(studentId);
      const subjects = student.classKey
        ? await quizRepository.subjectCounts({ classKey: student.classKey, activeOnly: true })
        : [];
      return {
        className: student.className,
        classKey: student.classKey,
        subjects,
        total: subjects.reduce((sum, s) => sum + s.count, 0),
      };
    },

    async startQuiz({ studentId, subject, count }) {
      const student = await requireStudent(studentId);
      const chosenSubject = subjectFilter(subject);
      const questions = student.classKey
        ? await quizRepository.randomQuestions({
            classKey: student.classKey,
            subject: chosenSubject,
            limit: questionCount(count),
          })
        : [];
      if (questions.length === 0) {
        throw new NotFoundError(chosenSubject ? "quiz_no_questions_for_subject" : "quiz_no_questions_for_class");
      }
      return {
        questions: questions.map(toPlayable),
        subject: chosenSubject,
        classKey: student.classKey,
        startedAt: now().toISOString(),
      };
    },

    async finishQuiz({ studentId, answers, timeTakenSeconds }) {
      if (!Array.isArray(answers) || answers.length === 0) throw new ValidationError("quiz_answers_required");
      // No quiz has more than MAX_COUNT questions; more answers is someone
      // harvesting the answer key.
      if (answers.length > MAX_COUNT) throw new ValidationError("quiz_too_many_answers");
      const student = await requireStudent(studentId);

      const wellFormed = answers.filter((a) => a && typeof a === "object");
      const ids = [...new Set(wellFormed.map((a) => Number.parseInt(a.questionId, 10)).filter(Number.isInteger))];
      const allowed = (await quizRepository.questionsByIds(ids)).filter(
        (q) => q.active && q.classKey === student.classKey,
      );
      const graded = scoreAnswers(wellFormed, allowed);
      if (graded.length === 0) throw new ValidationError("quiz_no_valid_answers");

      const { total, correct, percentage } = summarize(graded);
      const seconds = quizSeconds(timeTakenSeconds);
      const completedAt = now();
      const subjects = new Set(allowed.filter((q) => graded.some((g) => g.questionId === q.id)).map((q) => q.subject));
      const sessionId = await quizRepository.saveSession(
        {
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          className: student.className,
          section: student.section,
          classKey: student.classKey,
          subject: subjects.size === 1 ? [...subjects][0] : null,
          branchId: student.branchId,
          totalQuestions: total,
          correctAnswers: correct,
          scorePercentage: percentage,
          timeTakenSeconds: seconds,
          startedAt: new Date(completedAt.getTime() - seconds * 1000),
          completedAt,
        },
        graded,
      );

      return {
        sessionId,
        totalQuestions: total,
        correctAnswers: correct,
        scorePercentage: percentage,
        grade: letterGrade(percentage),
        details: graded,
      };
    },

    mySessions: async (studentId) => quizRepository.sessionsOfStudent((await requireStudent(studentId)).studentId),

    myProgress: async (studentId) => quizRepository.progressOfStudent((await requireStudent(studentId)).studentId),
  };
}
