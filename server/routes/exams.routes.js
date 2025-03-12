import express from "express";
import {
  getAllExamsController,
  addExamController,
  deleteExamController,
  updateExamController,
  searchExamsController,
  getExamByIdController,
  getExamsByClassController,
  getUpcomingExamsController
} from "../controllers/exams.controller.js";

const router = express.Router();

// Get all exams
router.get("/", getAllExamsController);

// Search exams with filters
router.get("/search", searchExamsController);

// Get upcoming exams
router.get("/upcoming", getUpcomingExamsController);

// Get exams by class ID
router.get("/class/:classID", getExamsByClassController);

// Get a specific exam by ID
router.get("/:id", getExamByIdController);

// Add a new exam
router.post("/", addExamController);

// Update an exam
router.put("/:id", updateExamController);

// Delete an exam
router.delete("/:id", deleteExamController);

export default router;