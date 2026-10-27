import { t } from "../../../../config/i18n.js";
import { sendError } from "../../../shared/http/sendError.js";

/** An exam as the Exams and Results pages read it. */
const toExamJson = (exam) => ({
  ExamID: exam.id,
  ExamType: exam.type,
  ExamName: exam.name,
  ClassID: exam.classId,
  ClassName: exam.className,
  Section: exam.section,
  ExamDate: exam.date,
});

// HTTP adapter for /api/exams: requests in, { success, message?, data? } out.
export function makeExamController({ useCases }) {
  const handle = (handler, fallbackKey) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      sendError(res, error, req.language, fallbackKey);
    }
  };
  const branchOf = (req) => req.branchId ?? null;

  return {
    list: handle(async (req, res) => {
      const exams = await useCases.listExams({ branchId: branchOf(req) });
      res.status(200).json({ success: true, data: exams.map(toExamJson), count: exams.length });
    }, "exam_fetch_failed"),

    names: handle(async (_req, res) => {
      res.status(200).json({ success: true, data: await useCases.examNames() });
    }, "exam_fetch_failed"),

    create: handle(async (req, res) => {
      const exam = await useCases.createExam({ branchId: branchOf(req), input: req.body });
      res.status(201).json({ success: true, message: t("exam_created", req.language), data: toExamJson(exam) });
    }),

    update: handle(async (req, res) => {
      await useCases.updateExam({ branchId: branchOf(req), id: req.params.id, input: req.body });
      res.status(200).json({ success: true, message: t("exam_updated", req.language) });
    }),

    remove: handle(async (req, res) => {
      const exam = await useCases.deleteExam({ branchId: branchOf(req), id: req.params.id });
      res.status(200).json({ success: true, message: t("exam_deleted", req.language), data: toExamJson(exam) });
    }),
  };
}
