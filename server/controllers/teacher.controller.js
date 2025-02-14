import {
  addTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
} from '../models/teacher.model.js';

const addTeacherController = async (req, res) => {
  try {
    const result = await addTeacher(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTeachersController = async (req, res) => {
  try {
    const teachers = await getAllTeachers();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTeacherController = async (req, res) => {
  try {
    const result = await updateTeacher(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTeacherController = async (req, res) => {
  try {
    const result = await deleteTeacher(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  addTeacherController,
  getAllTeachersController,
  updateTeacherController,
  deleteTeacherController,
};