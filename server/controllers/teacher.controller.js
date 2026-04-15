import { t } from "../config/i18n.js";
import {
  addTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  checkDuplicateTeacher,
  searchTeachers,
} from "../models/teacher.model.js";

const addTeacherController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const result = await addTeacher(req.body, branchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t("teacher_fetch_failed", lang) });
  }
};

const getAllTeachersController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const teachers = await getAllTeachers(branchId);
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: t("teacher_fetch_failed", lang) });
  }
};

const updateTeacherController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const result = await updateTeacher(req.params.id, req.body, branchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t("internal_server_error", lang) });
  }
};

const deleteTeacherController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  try {
    const result = await deleteTeacher(req.params.id, branchId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t("internal_server_error", lang) });
  }
};

const checkDuplicateTeacherController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  const { email, contactNumber } = req.query;

  try {
    const result = await checkDuplicateTeacher(email, contactNumber, branchId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: t("internal_server_error", lang) });
  }
};

const searchTeachersController = async (req, res) => {
  const lang = req.language;
  const branchId = req.branchId ?? null;
  const { q = "", className = "" } = req.query;
  try {
    const results = await searchTeachers(q.trim(), className.trim(), branchId);
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: t("internal_server_error", lang) });
  }
};

export {
  addTeacherController,
  getAllTeachersController,
  updateTeacherController,
  deleteTeacherController,
  checkDuplicateTeacherController,
  searchTeachersController,
};
