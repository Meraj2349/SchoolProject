import { t } from "../config/i18n.js";
import {
  addExamByClassDetails,
  createExamByClassNameAndSection,
  deleteExam,
  getAllExams,
  getExamById,
  getExamsByClass,
  updateExam,
} from "../models/exam.model.js";

// Get all exams
const getAllExamsController = async (req, res) => {
  const lang = req.language;
  try {
    const exams = await getAllExams();
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
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const exam = await getExamById(id);
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
  try {
    const { classId } = req.params;
    if (!classId || isNaN(classId)) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_class_required", lang) });
    }
    const exams = await getExamsByClass(classId);
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
const addExamByClassDetailsController = async (req, res) => {
  const lang = req.language;
  try {
    const { examType, examName, className, sectionName, examDate } = req.body;
    if (!examType || !examName || !className || !sectionName || !examDate) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const result = await addExamByClassDetails({
      examType,
      examName,
      className,
      sectionName,
      examDate,
    });
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

// Create exam by class name and section (alternative endpoint)
const createExamByClassNameAndSectionController = async (req, res) => {
  const lang = req.language;
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
  try {
    const { id } = req.params;
    const examData = req.body;
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const result = await updateExam(id, examData);
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
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: t("exam_required_fields", lang) });
    }
    const result = await deleteExam(id);
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

export {
  addExamByClassDetailsController,
  createExamByClassNameAndSectionController,
  deleteExamController,
  getAllExamsController,
  getExamByIdController,
  getExamsByClassController,
  updateExamController,
};
