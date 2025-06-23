import express from "express";
import {
  addClassController,
  deleteClassController,
  getClassesController,
  editClassController,
} from "../controllers/classes.controller.js";

const router = express.Router();

// Add a new class
router.post("/add", addClassController);

// Delete a class by ID
router.delete("/delete/:id", deleteClassController);

// Get all classes
router.get("/", getClassesController);

// Edit a class by ID
router.put("/edit/:id", editClassController);

export default router;