import express from "express";
import {
  getAllStudentsController,
  addStudentController,
  getStudentByIdController,
  updateStudentController,
  deleteStudentController,
  searchStudentsController,
  getStudentCountController,
  getStudentsByClassController,
  checkRollNumberController,
  getStudentsByClassAndSectionController
} from "../controllers/student.controller.js";

const router = express.Router();

// Route to get all students
router.get("/", getAllStudentsController);

// Route to add a new student
router.post("/", addStudentController);

// Route to get the total count of students
router.get("/count", getStudentCountController);

// Route to search students with filters
router.get("/search/filter", searchStudentsController);

// Route to check if a roll number exists in a specific class and section
router.get("/check-roll", checkRollNumberController);

// Route to get students by class name
router.get("/class/:className", getStudentsByClassController);

// Route to get a student by ID
router.get("/:id", getStudentByIdController);

// Route to update a student by ID
router.put("/:id", updateStudentController);

// Route to delete a student by ID
router.delete("/:id", deleteStudentController);

// Route to get students by class and section
router.get("/class/:className/section/:sectionName", getStudentsByClassAndSectionController);

export default router;