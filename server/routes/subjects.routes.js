import {
    getAllSubjectsController,
    getSubjectsByIdController,
    addSubjectController,
    updateSubjectController,
    deleteSubjectController,
    getSubjectsByClassController,
    searchSubjectsController
}from '../controllers/controller.subject.js';
import express from 'express';
const router = express.Router();

router.get('/', getAllSubjectsController);
router.get('/:id', getSubjectsByIdController);
router.post('/', addSubjectController);
router.put('/:id', updateSubjectController);
router.delete('/:id', deleteSubjectController);
router.get('/class/:id', getSubjectsByClassController);
router.get('/search', searchSubjectsController);

export default router;