import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
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

// ── Public read routes (optionalAuth: branch-scoped if ?branch_id provided) ──
router.get("/", optionalAuth, getClassesController);
// Class names are global (no branch scoping needed), still optional auth is fine
router.get("/names", optionalAuth, getDistinctClassNamesController);
router.get("/distinct", optionalAuth, getDistinctClassesWithSectionsController);
router.get(
  "/totalstudents/:className",
  optionalAuth,
  getTotalStudentsInClassByNameController,
);

// ── Write routes — require a valid JWT (admin only) ──
router.post("/add", authMiddleware, addClassController);
router.put("/edit/:id", authMiddleware, editClassController);
router.delete("/delete/:id", authMiddleware, deleteClassController);

export default router;
