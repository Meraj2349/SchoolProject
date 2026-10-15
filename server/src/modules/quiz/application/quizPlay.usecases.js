import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { classKey } from "../domain/classKey.js";
import { letterGrade, scoreAnswers, summarize } from "../domain/scoring.js";

const IDENTITY_FIELDS = ["branchId", "firstName", "lastName", "className", "section", "rollNumber"];
const DEFAULT_COUNT = 10;
const MAX_COUNT = 50;
// A quiz must be finished within this time of starting it.
const QUIZ_TIME_LIMIT_SECONDS = 2 * 3600;

const text = (value) => String(value ?? "").trim();
const subjectFilter = (subject) => (text(subject) && text(subject) !== "all" ? text(subject) : null);

function questionCount(value) {
  const count = Number.parseInt(value, 10);
  return Number.isInteger(count) && count >= 1 ? Math.min(count, MAX_COUNT) : DEFAULT_COUNT;
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
 * Taking a quiz. A student only ever gets active questions for their own
 * class, looked up fresh on every request. The server remembers which
 * questions it served (a "start"); finishing scores exactly those, once, with
 * the time measured by the server — so answers can't be replayed or cherry-picked.
 *
 * @param {object} deps
 * @param {{subjectCounts, randomQuestions, questionsByIds, createStart, findStart, saveSession}} deps.quizRepository
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
      const startedAt = now();
      const { id: quizId } = await quizRepository.createStart({
        studentId: student.studentId,
        questionIds: questions.map((q) => q.id),
        subject: chosenSubject,
        startedAt,
      });
      return {
        quizId,
        questions: questions.map(toPlayable),
        subject: chosenSubject,
        classKey: student.classKey,
        startedAt: startedAt.toISOString(),
      };
    },

    async finishQuiz({ studentId, quizId, answers }) {
      if (!Array.isArray(answers)) throw new ValidationError("quiz_answers_required");
      // No quiz has more than MAX_COUNT questions.
      if (answers.length > MAX_COUNT) throw new ValidationError("quiz_too_many_answers");
      const student = await requireStudent(studentId);

      const start = Number.isInteger(Number(quizId)) ? await quizRepository.findStart(Number(quizId)) : null;
      if (!start || start.studentId !== student.studentId) throw new NotFoundError("quiz_not_found");
      if (start.finishedAt) throw new ConflictError("quiz_already_finished");
      const completedAt = now();
      const seconds = Math.max(0, Math.round((completedAt - start.startedAt) / 1000));
      if (seconds > QUIZ_TIME_LIMIT_SECONDS) throw new ConflictError("quiz_expired");

      // Exactly the served questions: anything else is ignored, and a served
      // question left out counts as unanswered (wrong).
      const served = await quizRepository.questionsByIds(start.questionIds);
      const given = new Map(
        answers
          .filter((a) => a && typeof a === "object")
          .map((a) => [Number.parseInt(a.questionId, 10), a]),
      );
      const graded = scoreAnswers(
        served.map((q) => ({ userAnswer: "", ...given.get(q.id), questionId: q.id })),
        served,
      );
      if (graded.length === 0) throw new ValidationError("quiz_no_valid_answers");

      const { total, correct, percentage } = summarize(graded);
      const subjects = new Set(served.map((q) => q.subject));
      const sessionId = await quizRepository.saveSession(
        {
          quizId: start.id,
          studentId: student.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          className: student.className,
          section: student.section,
          classKey: student.classKey,
          subject: start.subject ?? (subjects.size === 1 ? [...subjects][0] : null),
          branchId: student.branchId,
          totalQuestions: total,
          correctAnswers: correct,
          scorePercentage: percentage,
          timeTakenSeconds: seconds,
          startedAt: start.startedAt,
          completedAt,
        },
        graded,
      );
      // Another request finished this quiz a moment earlier.
      if (sessionId == null) throw new ConflictError("quiz_already_finished");

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
