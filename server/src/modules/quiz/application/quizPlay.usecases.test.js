import { beforeEach, describe, expect, it } from "@jest/globals";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeFakeQuizRepository } from "./fakeQuizRepository.js";
import { makeQuizPlayUseCases } from "./quizPlay.usecases.js";

const RAHIM = {
  studentId: 7,
  firstName: "Rahim",
  lastName: "Uddin",
  rollNumber: "1",
  className: "Class 8",
  section: "Good",
  branchId: 1,
};

const question = (classKey, subject, answer = "A", extra = {}) => ({
  classKey,
  subject,
  prompt: `${subject} question for ${classKey}`,
  options: { A: "1", B: "2", C: "3", D: "4" },
  promptBn: `প্রশ্ন ${classKey}`,
  optionsBn: { A: "১", B: "২", C: "৩", D: "৪" },
  answer,
  ...extra,
});

describe("quiz play", () => {
  let repo;
  let students;
  let play;
  let ids;

  beforeEach(async () => {
    repo = makeFakeQuizRepository();
    students = new Map([[RAHIM.studentId, RAHIM]]);
    play = makeQuizPlayUseCases({
      quizRepository: repo,
      studentDirectory: {
        verify: async (identity) =>
          identity.firstName === "Rahim" && identity.rollNumber === "1" ? RAHIM : null,
        findById: async (id) => students.get(Number(id)) ?? null,
      },
      issueToken: (student) => `token-for-${student.studentId}`,
      now: () => new Date("2026-10-15T10:00:00Z"),
    });
    ids = {
      math8: (await repo.createQuestion(question("8", "Math", "B"))).id,
      science8: (await repo.createQuestion(question("8", "Science", "C"))).id,
      math10: (await repo.createQuestion(question("10", "Math", "A"))).id,
      hidden8: (await repo.createQuestion(question("8", "Math", "A", { active: false }))).id,
    };
  });

  describe("verifyStudent", () => {
    const identity = { branchId: 1, firstName: "Rahim", lastName: "Uddin", className: "Class 8", section: "Good", rollNumber: "1" };

    it("returns a quiz token and the student with their class key", async () => {
      expect(await play.verifyStudent(identity)).toEqual({ token: "token-for-7", student: { ...RAHIM, classKey: "8" } });
    });

    it("needs every identity field", async () => {
      await expect(play.verifyStudent({ ...identity, section: " " })).rejects.toMatchObject({ code: "quiz_identity_required" });
    });

    it("says when no student matches", async () => {
      const result = play.verifyStudent({ ...identity, rollNumber: "2" });

      await expect(result).rejects.toBeInstanceOf(NotFoundError);
      await expect(result).rejects.toMatchObject({ code: "quiz_student_not_found" });
    });
  });

  describe("metaFor", () => {
    it("lists only the student's own class subjects, counting active questions", async () => {
      expect(await play.metaFor(7)).toEqual({
        className: "Class 8",
        classKey: "8",
        subjects: [
          { subject: "Math", count: 1 },
          { subject: "Science", count: 1 },
        ],
        total: 2,
      });
    });

    it("refuses a student who no longer exists", async () => {
      await expect(play.metaFor(99)).rejects.toMatchObject({ code: "quiz_student_not_found" });
    });
  });

  describe("startQuiz", () => {
    it("serves only active questions from the student's class, without the answers", async () => {
      const quiz = await play.startQuiz({ studentId: 7, count: 10 });

      expect(quiz.questions.map((q) => q.id).sort()).toEqual([ids.math8, ids.science8].sort());
      for (const q of quiz.questions) {
        expect(q).not.toHaveProperty("answer");
        expect(q).toMatchObject({ classKey: "8", promptBn: "প্রশ্ন 8", optionsBn: { A: "১" } });
      }
      expect(quiz.startedAt).toBe("2026-10-15T10:00:00.000Z");
    });

    it("can be limited to one subject", async () => {
      const quiz = await play.startQuiz({ studentId: 7, subject: "Science", count: 10 });

      expect(quiz.questions.map((q) => q.id)).toEqual([ids.science8]);
      expect(quiz.subject).toBe("Science");
    });

    it("treats 'all' or an empty subject as every subject", async () => {
      expect((await play.startQuiz({ studentId: 7, subject: "all" })).questions).toHaveLength(2);
      expect((await play.startQuiz({ studentId: 7, subject: "" })).subject).toBeNull();
    });

    it("keeps the number of questions between 1 and 50", async () => {
      expect((await play.startQuiz({ studentId: 7, count: 1 })).questions).toHaveLength(1);
      expect((await play.startQuiz({ studentId: 7, count: 0 })).questions).toHaveLength(2);
      expect((await play.startQuiz({ studentId: 7, count: "x" })).questions).toHaveLength(2);
    });

    it("says clearly when the class has no questions yet", async () => {
      students.set(8, { ...RAHIM, studentId: 8, className: "Class 6" });

      await expect(play.startQuiz({ studentId: 8 })).rejects.toMatchObject({ code: "quiz_no_questions_for_class" });
    });

    it("says clearly when the subject has no questions", async () => {
      await expect(play.startQuiz({ studentId: 7, subject: "Physics" })).rejects.toMatchObject({
        code: "quiz_no_questions_for_subject",
      });
    });
  });

  describe("finishQuiz", () => {
    it("scores, saves the session under the verified student, and returns the review", async () => {
      const result = await play.finishQuiz({
        studentId: 7,
        answers: [
          { questionId: ids.math8, userAnswer: "B" },
          { questionId: ids.science8, userAnswer: "A" },
        ],
        timeTakenSeconds: 95,
      });

      expect(result).toMatchObject({ totalQuestions: 2, correctAnswers: 1, scorePercentage: 50, grade: "F" });
      expect(result.details).toHaveLength(2);
      expect(repo.sessions[0]).toMatchObject({
        studentId: 7,
        studentName: "Rahim Uddin",
        className: "Class 8",
        section: "Good",
        classKey: "8",
        subject: null,
        branchId: 1,
        totalQuestions: 2,
        correctAnswers: 1,
        scorePercentage: 50,
        timeTakenSeconds: 95,
        startedAt: new Date("2026-10-15T09:58:25Z"),
        completedAt: new Date("2026-10-15T10:00:00Z"),
      });
    });

    it("records the subject when every question shares one", async () => {
      await play.finishQuiz({ studentId: 7, answers: [{ questionId: ids.math8, userAnswer: "B" }] });

      expect(repo.sessions[0].subject).toBe("Math");
    });

    it("ignores questions from another class and hidden questions", async () => {
      const result = await play.finishQuiz({
        studentId: 7,
        answers: [
          { questionId: ids.math8, userAnswer: "B" },
          { questionId: ids.math10, userAnswer: "A" },
          { questionId: ids.hidden8, userAnswer: "A" },
        ],
      });

      expect(result).toMatchObject({ totalQuestions: 1, correctAnswers: 1, scorePercentage: 100 });
    });

    it("needs at least one answer to a real question", async () => {
      await expect(play.finishQuiz({ studentId: 7, answers: [] })).rejects.toBeInstanceOf(ValidationError);
      await expect(play.finishQuiz({ studentId: 7, answers: [{ questionId: ids.math10, userAnswer: "A" }] })).rejects.toMatchObject({
        code: "quiz_no_valid_answers",
      });
      expect(repo.sessions).toHaveLength(0);
    });

    it("never trusts a negative or silly time", async () => {
      await play.finishQuiz({ studentId: 7, answers: [{ questionId: ids.math8, userAnswer: "B" }], timeTakenSeconds: -20 });

      expect(repo.sessions[0].timeTakenSeconds).toBe(0);
    });
  });
});
