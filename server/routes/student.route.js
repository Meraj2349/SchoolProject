// Routes file (student.routes.js)
import express from 'express';
import {
  getAllStudentsController,
  addStudentController,
  getStudentByIdController,
  updateStudentController,
  deleteStudentController,
  searchStudentsController,
  getStudentCountController,
  getStudentsByClassController,
  getStudentsByClassAndSectionController,
  checkRollNumberController,
} from '../controllers/student.controller.js';

const router = express.Router();

router.get('/', getAllStudentsController);
router.post('/', addStudentController);
router.get('/count', getStudentCountController);
router.get('/search', searchStudentsController);
router.get('/check-roll', checkRollNumberController);
router.get('/class/:className', getStudentsByClassController);
router.get('/class/:className/section/:section', getStudentsByClassAndSectionController);
router.get('/:id', getStudentByIdController);
router.put('/:id', updateStudentController);
router.delete('/:id', deleteStudentController);

export default router;