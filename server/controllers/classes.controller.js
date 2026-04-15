import { t } from "../config/i18n.js";
import {
  addClass,
  deleteClass,
  getClasses,
  editClass,
  getTotalStudentsInClassByName,
  getDistinctClassesWithSections,
  getDistinctClassNames,
} from "../models/classes.model.js";

// Add a new class
export const addClassController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  const { className, section, teacherId } = req.body;

  if (!className || !section || !teacherId) {
    return res.status(400).json({ error: t("class_name_required", lang) });
  }

  try {
    const result = await addClass({ className, section, teacherId }, branchId);
    res
      .status(201)
      .json({ message: t("class_added", lang), ClassID: result.ClassID });
  } catch (error) {
    console.error("Error adding class:", error);
    res.status(500).json({ error: t("class_add_failed", lang) });
  }
};

// Delete a class by ID
export const deleteClassController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  const { id } = req.params;

  try {
    const result = await deleteClass(id, branchId);
    res
      .status(200)
      .json({ message: t("class_deleted", lang), success: result.success });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ error: t("class_delete_failed", lang) });
  }
};

// Get all classes
export const getClassesController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const classes = await getClasses(branchId);
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: t("class_fetch_failed", lang) });
  }
};

// Edit a class by ID
export const editClassController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  const { id } = req.params;
  const { className, section, teacherId } = req.body;

  if (!className || !section || !teacherId) {
    return res.status(400).json({ error: t("class_name_required", lang) });
  }

  try {
    const result = await editClass(id, { className, section, teacherId }, branchId);
    res
      .status(200)
      .json({ message: t("class_updated", lang), success: result.success });
  } catch (error) {
    console.error("Error editing class:", error);
    res.status(500).json({ error: t("class_update_failed", lang) });
  }
};

// Get distinct class names with their sections
export const getDistinctClassesWithSectionsController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const rows = await getDistinctClassesWithSections(branchId);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching distinct classes:", error);
    res.status(500).json({ error: t("class_fetch_failed", lang) });
  }
};

// Get all distinct class names (global — not branch-scoped)
export const getDistinctClassNamesController = async (req, res) => {
  const lang = req.language;
  try {
    const names = await getDistinctClassNames();
    res.status(200).json(names);
  } catch (error) {
    console.error("Error fetching distinct class names:", error);
    res.status(500).json({ error: t("class_fetch_failed", lang) });
  }
};

// Get total students in a class by class name
export const getTotalStudentsInClassByNameController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  const { className } = req.params;

  if (!className) {
    return res.status(400).json({ error: t("class_name_required", lang) });
  }

  try {
    const count = await getTotalStudentsInClassByName(className, branchId);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching student count:", error);
    res.status(500).json({ error: t("student_count_fetch_failed", lang) });
  }
};
