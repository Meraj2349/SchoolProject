import { t } from "../config/i18n.js";
import {
  addSubject,
  deleteSubject,
  editSubject,
  getSubjects,
} from "../models/subjects.model.js";

// Add a new subject
export const addSubjectController = async (req, res) => {
  const lang = req.language;
  // Accept both camelCase and PascalCase field names
  const subjectName = req.body.SubjectName ?? req.body.subjectName;
  const classId = req.body.ClassID ?? req.body.classId;

  if (!subjectName || !classId) {
    return res
      .status(400)
      .json({ error: t("subject_name_class_required", lang) });
  }

  try {
    const result = await addSubject({ subjectName, classId });
    res
      .status(201)
      .json({ message: t("subject_added", lang), SubjectID: result.SubjectID });
  } catch (error) {
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
    res.status(500).json({ error: t("subject_fetch_failed", lang) });
  }
};

// Edit a subject by ID
export const editSubjectController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const subjectName = req.body.SubjectName ?? req.body.subjectName;
  const classId = req.body.ClassID ?? req.body.classId;

  if (!subjectName || !classId) {
    return res
      .status(400)
      .json({ error: t("subject_name_class_required", lang) });
  }

  try {
    const result = await editSubject(id, { subjectName, classId });
    res
      .status(200)
      .json({ message: t("subject_updated", lang), success: result.success });
  } catch (error) {
    res.status(500).json({ error: t("subject_update_failed", lang) });
  }
};
