import { t } from "../config/i18n.js";
import {
  addSubject,
  deleteSubject,
  editSubject,
  getSubjects,
  getSubjectsByClassId,
  getSubjectsByClassName,
} from "../models/subjects.model.js";

export const addSubjectController = async (req, res) => {
  const lang = req.language;
  const subjectName = req.body.SubjectName ?? req.body.subjectName;
  const classId = req.body.ClassID ?? req.body.classId;

  if (!subjectName || !classId) {
    return res.status(400).json({ error: t("subject_name_class_required", lang) });
  }

  try {
    const result = await addSubject({ subjectName, classId });
    res.status(201).json({ message: t("subject_added", lang), SubjectID: result.SubjectID });
  } catch (error) {
    console.error("Error adding subject:", error);
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: `Subject "${subjectName}" already exists for this class`,
      });
    }
    res.status(500).json({ error: t("subject_add_failed", lang) });
  }
};

export const deleteSubjectController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  try {
    const result = await deleteSubject(id);
    res.status(200).json({ message: t("subject_deleted", lang), success: result.success });
  } catch (error) {
    res.status(500).json({ error: t("subject_delete_failed", lang) });
  }
};

export const getSubjectsController = async (req, res) => {
  const lang = req.language;
  try {
    const subjects = await getSubjects();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: t("subject_fetch_failed", lang) });
  }
};

export const getSubjectsByClassIdController = async (req, res) => {
  const lang = req.language;
  const { classId } = req.params;
  if (!classId || isNaN(classId)) {
    return res.status(400).json({ error: "Valid ClassID is required" });
  }
  try {
    const subjects = await getSubjectsByClassId(classId);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: t("subject_fetch_failed", lang) });
  }
};

export const getSubjectsByClassNameController = async (req, res) => {
  const lang = req.language;
  const { className } = req.params;
  if (!className) {
    return res.status(400).json({ error: "ClassName is required" });
  }
  try {
    const subjects = await getSubjectsByClassName(decodeURIComponent(className));
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: t("subject_fetch_failed", lang) });
  }
};

export const editSubjectController = async (req, res) => {
  const lang = req.language;
  const { id } = req.params;
  const subjectName = req.body.SubjectName ?? req.body.subjectName;
  const classId = req.body.ClassID ?? req.body.classId;

  if (!subjectName || !classId) {
    return res.status(400).json({ error: t("subject_name_class_required", lang) });
  }

  try {
    const result = await editSubject(id, { subjectName, classId });
    res.status(200).json({ message: t("subject_updated", lang), success: result.success });
  } catch (error) {
    console.error("Error editing subject:", error);
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: `Subject "${subjectName}" already exists for this class`,
      });
    }
    res.status(500).json({ error: t("subject_update_failed", lang) });
  }
};
