import express from "express";
import {
    addMultipleResultsController,
    addResultByStudentDetailsController,
    addResultController,
    advancedSearchResultsController,
    checkResultExistsController,
    deleteResultController,
    deleteResultsByExamController,
    getAllResultsController,
    getResultByIdController,
    getResultCountController,
    getResultsByClassController,
    getResultsByExamController,
    getResultsByStudentController,
    getResultsBySubjectController,
    getStudentResultSummaryController,
    searchResultsController,
    updateResultController
} from "../controllers/result.controller.js";

const router = express.Router();

// Route to get all results with pagination
router.get("/", getAllResultsController);

// Route to add a new result by IDs
router.post("/", addResultController);

// Route to add a result using student details (names, roll number, etc.)
router.post("/add-by-details", addResultByStudentDetailsController);

// Route to add multiple results (batch insert)
router.post("/batch", addMultipleResultsController);

// Route to get the total count of results
router.get("/count", getResultCountController);

// Route to search results with basic filters
router.get("/search", searchResultsController);

// Route to advanced search with pagination and comprehensive filters
router.get("/search/advanced", advancedSearchResultsController);

// Route to check if a result exists
router.get("/check-exists", checkResultExistsController);

// Route to get results by student
router.get("/student/:studentId", getResultsByStudentController);

// Route to get results by exam
router.get("/exam/:examId", getResultsByExamController);

// Route to get results by class
router.get("/class/:classId", getResultsByClassController);

// Route to get results by subject
router.get("/subject/:subjectId", getResultsBySubjectController);

// Route to get student result summary for a specific exam
router.get("/summary/:studentId/:examId", getStudentResultSummaryController);

// Route to get a specific result by ID
router.get("/:id", getResultByIdController);

// Route to update a result
router.put("/:id", updateResultController);

// Route to delete a result
router.delete("/:id", deleteResultController);

// Route to delete all results for a specific exam
router.delete("/exam/:examId", deleteResultsByExamController);

export default router;
