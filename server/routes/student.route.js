import express from 'express';
import {
  getAllStudentsController,
  addStudentController,
  deleteStudentController,
  updateStudentController,
  searchStudentsController,
  getStudentCountController,
  getStudentByIdController,
} from '../controllers/student.controller.js';

const router = express.Router();

router.get('/', getAllStudentsController);
router.post('/addStudents', addStudentController);
router.delete('/deleteStudent/:id', deleteStudentController);
router.put('/updateStudent/:id', updateStudentController);
router.get('/search', searchStudentsController);
router.get('/count', getStudentCountController);
router.get('/student/:id', getStudentByIdController);

export default router;