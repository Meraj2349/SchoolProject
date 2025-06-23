import {
  addTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  checkDuplicateTeacher,
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

const checkDuplicateTeacherController = async (req, res) => {
  const { email, contactNumber } = req.query;  // Extract email and contactNumber from query params

  try {
    // Check if duplicate exists
    const result = await checkDuplicateTeacher(email, contactNumber);
    res.status(200).json(result); // Send result back (whether there's a duplicate or not)
  } catch (error) {
    console.error(error);  // Log error for debugging
    res.status(500).json({ message: 'Internal server error' });
  }
};
export {
  addTeacherController,
  getAllTeachersController,
  updateTeacherController,
  deleteTeacherController,
  checkDuplicateTeacherController,
};