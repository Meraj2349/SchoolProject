import express from "express";
import {
    addExamByClassDetailsController,
    createExamByClassNameAndSectionController,
    deleteExamController,
    getAllExamsController,
    getExamByIdController,
    getExamsByClassController,
    updateExamController
} from "../controllers/exam.controller.js";

const router = express.Router();

// Route to get all exams
router.get("/", getAllExamsController);

// Route to add an exam using class details (names instead of IDs)
router.post("/by-class", addExamByClassDetailsController);

// Route to create exam by class name and section (alternative endpoint)
router.post("/create", createExamByClassNameAndSectionController);

// Route to get exams by class
router.get("/class/:classId", getExamsByClassController);

// Route to get a specific exam by ID
router.get("/:id", getExamByIdController);

// Route to update an exam
router.put("/:id", updateExamController);

// Route to delete an exam
router.delete("/:id", deleteExamController);

export default router;
