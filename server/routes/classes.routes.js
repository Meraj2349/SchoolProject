import express from "express";
import {
  getAllClassesController,
  addClassController,
  deleteClassController,
  updateClassController,
  searchClassesController,
  getClassByIdController,
  getStudentsByClassController,
} from "../controllers/classes.controller.js";

const router = express.Router();

// Get all classes
router.get("/", getAllClassesController);

// Add a new class
router.post("/", addClassController);

// Delete a class by ID
router.delete("/:id", deleteClassController);

// Update a class by ID
router.put("/:id", updateClassController);

// Search classes by filters (e.g., ClassName, Section, TeacherID)
router.get("/search", searchClassesController);

// Get a class by ID
router.get("/:id", getClassByIdController);

// Get students by class ID
router.get("/:classID/students", getStudentsByClassController);

export default router;