import express from "express";
import {
    addSubjectController,
    deleteSubjectController,
    editSubjectController,
    getAllClassesController,
    getSubjectsController,
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

// Get all classes
router.get("/classes", getAllClassesController);

export default router;