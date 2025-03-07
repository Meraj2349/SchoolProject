import {
  getAllStudents,
  addStudent,
  deleteStudent,
  updateStudent,
  searchStudents,
  getStudentCount,
  getStudentById,
} from '../models/student.model.js';

const getAllStudentsController = async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addStudentController = async (req, res) => {
  try {
    const result = await addStudent(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteStudentController = async (req, res) => {
  try {
    const result = await deleteStudent(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStudentController = async (req, res) => {
  try {
    const result = await updateStudent(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchStudentsController = async (req, res) => {
  try {
    const students = await searchStudents(req.query);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentCountController = async (req, res) => {
  try {
    const result = await getStudentCount();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentByIdController = async (req, res) => {
  try {
    const student = await getStudentById(req.params.id);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllStudentsController,
  addStudentController,
  deleteStudentController,
  updateStudentController,
  searchStudentsController,
  getStudentCountController,
  getStudentByIdController,
};