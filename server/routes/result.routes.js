import express from "express";
import {
  getAllResultsController,
  addResultController,
  deleteResultController,
  updateResultController,
  searchResultsController,
  getResultByIdController,
  getResultsByStudentController,
  getResultsByExamController,
  getResultsByClassController,
  getHighestMarksInSubjectController,
  getSubjectHighestMarksByClassAndExamController,
  getStudentResultsByExamController
} from "../controllers/result.controller.js";

const router = express.Router();

// Get all results
router.get("/", getAllResultsController);

// Add a new result
router.post("/", addResultController);

// Delete a result by ID
router.delete("/:id", deleteResultController);

// Update a result by ID
router.put("/:id", updateResultController);

// Search results by filters (e.g., StudentID, ExamID, SubjectID, etc.)
router.get("/search", searchResultsController);

// Get highest marks in a specific subject for a class, exam and year
router.get("/highest-marks/:className/:examName/:year/:subjectName", getHighestMarksInSubjectController);

// Get highest marks for all subjects in a class, exam and year
router.get("/highest-marks/:className/:examName/:year", getSubjectHighestMarksByClassAndExamController);

// Get results by student ID
router.get("/student/:studentID", getResultsByStudentController);

// Get results by exam ID
router.get("/exam/:examID", getResultsByExamController);

// Get results by class ID
router.get("/class/:classID", getResultsByClassController);

// Get a result by ID
router.get("/:id", getResultByIdController);

router.get("/student/:studentID/:className/:examName/:year", getStudentResultsByExamController);

export default router;