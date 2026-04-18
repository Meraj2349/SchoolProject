import { t } from "../config/i18n.js";
import {
  addExamByClassDetails,
  createExamByClassNameAndSection,
  deleteExam,
  getAllExams,
  getDistinctExamNames,
  getExamById,
  getExamsByClass,
  updateExam,
} from "../models/exam.model.js";

// Get all exams
const getAllExamsController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const exams = await getAllExams(branchId);
    res.status(200).json({ success: true, data: exams, count: exams.length });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: t("exam_fetch_failed", lang),
        error: error.message,
      });
  }
};

// Get exam by ID
const getExamByIdController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const exam = await getExamById(id, branchId);
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: t("exam_not_found", lang) });
    }
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: t("exam_fetch_failed", lang),
        error: error.message,
      });
  }
};

// Get exams by class
const getExamsByClassController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const { classId } = req.params;
    if (!classId || isNaN(classId)) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_class_required", lang) });
    }
    const exams = await getExamsByClass(classId, branchId);
    res.status(200).json({ success: true, data: exams, count: exams.length });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: t("exam_fetch_failed", lang),
        error: error.message,
      });
  }
};

// Add exam by class details (names instead of IDs)
// Accepts both camelCase and PascalCase field names for compatibility
const addExamByClassDetailsController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const examType = req.body.examType || req.body.ExamType;
    const examName = req.body.examName || req.body.ExamName;
    const className = req.body.className || req.body.ClassName;
    const sectionName = req.body.sectionName || req.body.SectionName;
    const examDate = req.body.examDate || req.body.ExamDate;

    if (!examType || !examName || !className || !sectionName || !examDate) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const result = await addExamByClassDetails(
      { examType, examName, className, sectionName, examDate },
      branchId,
    );
    res.status(201).json({ ...result, message: t("exam_created", lang) });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: error.message || t("exam_required_fields", lang),
        error: error.message,
      });
  }
};

// Create exam by class name and section (alternative endpoint)
const createExamByClassNameAndSectionController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const { examType, examName, className, sectionName, examDate } = req.body;
    if (!examType || !examName || !className || !sectionName || !examDate) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const result = await createExamByClassNameAndSection(
      examType,
      examName,
      className,
      sectionName,
      examDate,
      branchId,
    );
    res.status(201).json({ ...result, message: t("exam_created", lang) });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: t("exam_required_fields", lang),
        error: error.message,
      });
  }
};

// Update exam
const updateExamController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const { id } = req.params;
    const examData = req.body;
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const result = await updateExam(id, examData, branchId);
    res.status(200).json({ ...result, message: t("exam_updated", lang) });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: t("exam_fetch_failed", lang),
        error: error.message,
      });
  }
};

// Delete exam
const deleteExamController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const result = await deleteExam(id, branchId);
    res.status(200).json({ ...result, message: t("exam_deleted", lang) });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: t("exam_fetch_failed", lang),
        error: error.message,
      });
  }
};

// Get distinct exam names — public endpoint for autocomplete (no auth required)
const getDistinctExamNamesController = async (req, res) => {
  try {
    const names = await getDistinctExamNames();
    res.status(200).json({ success: true, data: names });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addExamByClassDetailsController,
  createExamByClassNameAndSectionController,
  deleteExamController,
  getAllExamsController,
  getDistinctExamNamesController,
  getExamByIdController,
  getExamsByClassController,
  updateExamController,
};
