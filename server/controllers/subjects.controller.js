import { t } from "../config/i18n.js";
import {
  addSubject,
  deleteSubject,
  editSubject,
  getAllClasses,
  getSubjects,
} from "../models/subjects.model.js";

// Add a new subject
export const addSubjectController = async (req, res) => {
  const lang = req.language;
  const { subjectName, className } = req.body;

  if (!subjectName || !className) {
    return res
      .status(400)
      .json({ error: t("subject_name_class_required", lang) });
  }

  try {
    const result = await addSubject({ subjectName, className });
    res
      .status(201)
      .json({ message: t("subject_added", lang), SubjectID: result.SubjectID });
  } catch (error) {
    console.error("Error adding subject:", error);
    res.status(500).json({ error: t("subject_add_failed", lang) });
  }
};

// Delete a subject by ID
export const deleteSubjectController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;

  try {
    const result = await deleteSubject(id);
    res
      .status(200)
      .json({ message: t("subject_deleted", lang), success: result.success });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: t("subject_delete_failed", lang) });
  }
};

// Get all subjects
export const getSubjectsController = async (req, res) => {
  const lang = req.language;
  try {
    const subjects = await getSubjects();
    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: t("subject_fetch_failed", lang) });
  }
};

// Edit a subject by ID
export const editSubjectController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const { subjectName, className } = req.body;

  if (!subjectName || !className) {
    return res
      .status(400)
      .json({ error: t("subject_name_class_required", lang) });
  }

  try {
    const result = await editSubject(id, { subjectName, className });
    res
      .status(200)
      .json({ message: t("subject_updated", lang), success: result.success });
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ error: t("subject_update_failed", lang) });
  }
};

// Get all classes
export const getAllClassesController = async (req, res) => {
  const lang = req.language;
  try {
    const classes = await getAllClasses();
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: t("class_fetch_failed", lang) });
  }
};
