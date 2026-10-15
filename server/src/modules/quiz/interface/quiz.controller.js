import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

// HTTP adapter for the quiz: student play (quiz token → req.quizStudentId)
// and admin pages (admin token → req.adminId, req.branchId).
export function makeQuizController({ play, bank, results }) {
  const handle = (handler, fallbackKey) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language, fallbackKey);
    }
  };
  const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
  const okWith = (res, req, messageKey, data, status = 200) =>
    res.status(status).json({ success: true, message: t(messageKey, req.language), data });

  return {
    // ── Student ─────────────────────────────────────────────────────────
    verify: handle(async (req, res) => ok(res, await play.verifyStudent(req.body)), "quiz_failed"),

    meta: handle(async (req, res) => ok(res, await play.metaFor(req.quizStudentId)), "quiz_failed"),

    start: handle(async (req, res) => {
      const { subject: chosen, count } = req.body ?? {};
      ok(res, await play.startQuiz({ studentId: req.quizStudentId, subject: chosen, count }));
    }, "quiz_failed"),

    finish: handle(async (req, res) => {
      const { answers, timeTakenSeconds } = req.body ?? {};
      ok(res, await play.finishQuiz({ studentId: req.quizStudentId, answers, timeTakenSeconds }), 201);
    }, "quiz_save_failed"),

    mySessions: handle(async (req, res) => ok(res, await play.mySessions(req.quizStudentId)), "quiz_failed"),

    myProgress: handle(async (req, res) => ok(res, await play.myProgress(req.quizStudentId)), "quiz_failed"),

    // ── Admin: question bank ────────────────────────────────────────────
    listQuestions: handle(async (req, res) => {
      const q = req.query;
      ok(
        res,
        await bank.listQuestions({
          classKey: q.classKey,
          subject: q.subject,
          search: q.search,
          status: q.status,
          page: q.page,
          pageSize: q.pageSize,
        }),
      );
    }, "quiz_failed"),

    subjects: handle(async (req, res) => ok(res, await bank.subjectsFor(req.query.classKey)), "quiz_failed"),

    getQuestion: handle(async (req, res) => ok(res, await bank.getQuestion(req.params.id)), "quiz_failed"),

    createQuestion: handle(async (req, res) => {
      const question = await bank.createQuestion({ input: req.body ?? {}, adminId: req.adminId });
      okWith(res, req, "quiz_question_created", question, 201);
    }, "quiz_save_failed"),

    updateQuestion: handle(async (req, res) => {
      const question = await bank.updateQuestion({ id: req.params.id, input: req.body ?? {}, adminId: req.adminId });
      okWith(res, req, "quiz_question_updated", question);
    }, "quiz_save_failed"),

    setActive: handle(async (req, res) => {
      const question = await bank.setActive({ id: req.params.id, active: req.body?.active, adminId: req.adminId });
      okWith(res, req, question.active ? "quiz_question_shown" : "quiz_question_hidden", question);
    }, "quiz_save_failed"),

    // ── Admin: results ──────────────────────────────────────────────────
    sessions: handle(async (req, res) => {
      const q = req.query;
      ok(
        res,
        await results.listSessions({
          branchId: req.branchId ?? null,
          classKey: q.classKey,
          subject: q.subject,
          page: q.page,
          pageSize: q.pageSize,
        }),
      );
    }, "quiz_failed"),

    leaderboard: handle(async (req, res) => {
      ok(res, await results.leaderboard({ branchId: req.branchId ?? null, classKey: req.query.classKey, limit: req.query.limit }));
    }, "quiz_failed"),
  };
}
