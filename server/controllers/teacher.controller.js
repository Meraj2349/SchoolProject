import { t } from "../config/i18n.js";
import {
  addTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  checkDuplicateTeacher,
} from "../models/teacher.model.js";

const addTeacherController = async (req, res) => {
  const lang = req.language;
  try {
    const result = await addTeacher(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t("teacher_fetch_failed", lang) });
  }
};

const getAllTeachersController = async (req, res) => {
  const lang = req.language;
  try {
    const teachers = await getAllTeachers();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: t("teacher_fetch_failed", lang) });
  }
};

const updateTeacherController = async (req, res) => {
  const lang = req.language;
  try {
    const result = await updateTeacher(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t("internal_server_error", lang) });
  }
};

const deleteTeacherController = async (req, res) => {
  const lang = req.language;
  try {
    const result = await deleteTeacher(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t("internal_server_error", lang) });
  }
};

const checkDuplicateTeacherController = async (req, res) => {
  const lang = req.language;
  const { email, contactNumber } = req.query;

  try {
    const result = await checkDuplicateTeacher(email, contactNumber);
    res.status(200).json(result);
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
};
