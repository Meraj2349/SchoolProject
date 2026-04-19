import { t } from "../config/i18n.js";
import {
  addClass,
  hardDeleteClass,
  getClasses,
  editClass,
  getTotalStudentsInClassByName,
  getDistinctClassesWithSections,
  getDistinctClassNames,
  getDistinctSections,
} from "../models/classes.model.js";
import {
  assignTeacher,
  unassignTeacher,
} from "../models/classAssignments.model.js";

// ── Class CRUD (super_admin only — classes are global) ─────────────────

export const addClassController = async (req, res) => {
  const lang = req.language;
  const { className, section } = req.body;

  if (!className || !section) {
    return res.status(400).json({ error: t("class_name_required", lang) });
  }

  try {
    const result = await addClass({ className, section });
    res.status(201).json({ message: t("class_added", lang), ClassID: result.ClassID });
  } catch (error) {
    console.error("Error adding class:", error);
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: `${className} - ${section} already exists`,
      });
    }
    res.status(500).json({ error: t("class_add_failed", lang) });
  }
};

export const editClassController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { className, section } = req.body;

  if (!className || !section) {
    return res.status(400).json({ error: t("class_name_required", lang) });
  }

  try {
    const result = await editClass(id, { className, section });
    res.status(200).json({ message: t("class_updated", lang), success: result.success });
  } catch (error) {
    console.error("Error editing class:", error);
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: `${className} - ${section} already exists`,
      });
    }
    res.status(500).json({ error: t("class_update_failed", lang) });
  }
};

export const hardDeleteClassController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;

  try {
    const result = await hardDeleteClass(id);
    res.status(200).json({ message: t("class_deleted", lang), success: result.success });
  } catch (error) {
    console.error("Error hard-deleting class:", error);
    // FK RESTRICT from Students → tell the caller why
    if (error?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "Cannot delete: students still assigned to this class",
      });
    }
    res.status(500).json({ error: t("class_delete_failed", lang) });
  }
};

// ── Read ──────────────────────────────────────────────────────────────

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

export const getDistinctClassesWithSectionsController = async (req, res) => {
  const lang = req.language;
  try {
    const rows = await getDistinctClassesWithSections();
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching distinct classes:", error);
    res.status(500).json({ error: t("class_fetch_failed", lang) });
  }
};

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

export const getStandardSectionsController = async (req, res) => {
  try {
    const sections = await getDistinctSections();
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
};

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

// ── Teacher assignment (branch-scoped; branch_admin + super_admin) ─────

export const assignTeacherController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const branchId = req.branchId;
  const teacherId = req.body.teacherId ?? req.body.TeacherID;

  if (branchId == null) {
    return res.status(400).json({
      error: "branch_id required (super admin must select a branch)",
    });
  }
  if (!teacherId) {
    return res.status(400).json({ error: "teacherId required" });
  }

  try {
    const result = await assignTeacher(id, branchId, teacherId);
    res.status(200).json({ message: t("class_updated", lang), ...result });
  } catch (error) {
    console.error("Error assigning teacher:", error);
    res.status(500).json({ error: t("class_update_failed", lang) });
  }
};

export const unassignTeacherController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const branchId = req.branchId;

  if (branchId == null) {
    return res.status(400).json({
      error: "branch_id required (super admin must select a branch)",
    });
  }

  try {
    const result = await unassignTeacher(id, branchId);
    res.status(200).json({ message: t("class_deleted", lang), ...result });
  } catch (error) {
    console.error("Error unassigning teacher:", error);
    res.status(500).json({ error: t("class_delete_failed", lang) });
  }
};
