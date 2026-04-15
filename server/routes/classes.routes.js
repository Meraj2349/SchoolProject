import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  addClassController,
  deleteClassController,
  getClassesController,
  editClassController,
  getTotalStudentsInClassByNameController,
  getDistinctClassesWithSectionsController,
  getDistinctClassNamesController,
} from "../controllers/classes.controller.js";

const router = express.Router();

router.use(authMiddleware);

// Add a new class
router.post("/add", addClassController);

// Delete a class by ID
router.delete("/delete/:id", deleteClassController);

// Get all classes
router.get("/", getClassesController);

// Get all distinct class names across all branches (global — class names are universal)
router.get("/names", getDistinctClassNamesController);

// Get distinct class names with sections (for dropdowns/autocomplete)
router.get("/distinct", getDistinctClassesWithSectionsController);

// Edit a class by ID
router.put("/edit/:id", editClassController);

// Get total students in a class by class name
router.get(
  "/totalstudents/:className",
  getTotalStudentsInClassByNameController,
);

export default router;
