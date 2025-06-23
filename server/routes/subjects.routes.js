import express from "express";
import {
  addSubjectController,
  deleteSubjectController,
  getSubjectsController,
  editSubjectController,
} from "../controllers/subjects.controller.js";

const router = express.Router();

// Add a new subject
router.post("/add", addSubjectController);

// Delete a subject by ID
router.delete("/delete/:id", deleteSubjectController);

// Get all subjects
router.get("/", getSubjectsController);

// Edit a subject by ID
router.put("/edit/:id", editSubjectController);

export default router;