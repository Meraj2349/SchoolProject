import express from 'express';
import {
  getAllStudents,
  addStudent,
  deleteStudent,
  updateStudent,
  searchStudents,
  getStudentCount,
  getStudentById,
} from '../models/student.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/addStudents', async (req, res) => {
  try {
    const result = await addStudent(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/deleteStudent/:id', async (req, res) => {
  try {
    const result = await deleteStudent(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/updateStudent/:id', async (req, res) => {
  try {
    const result = await updateStudent(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const students = await searchStudents(req.query);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/count', async (req, res) => {
  try {
    const result = await getStudentCount();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/student/:id', async (req, res) => {
  try {
    const student = await getStudentById(req.params.id);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;