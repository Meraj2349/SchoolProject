import express from "express";
import authMiddleware, { optionalAuth, authorize } from "../middlewares/auth.middleware.js";
import {
  addClassController,
  deleteClassController,
  hardDeleteClassController,
  getClassesController,
  editClassController,
  getTotalStudentsInClassByNameController,
  getDistinctClassesWithSectionsController,
  getDistinctClassNamesController,
  getStandardSectionsController,
} from "../controllers/classes.controller.js";

const router = express.Router();

// ── Public read routes (optionalAuth: branch-scoped if ?branch_id provided) ──
router.get("/", optionalAuth, getClassesController);
// Class names are global (no branch scoping needed), still optional auth is fine
router.get("/names", optionalAuth, getDistinctClassNamesController);
// Sections in use — branch-scoped distinct from Classes (legacy fallback if empty)
router.get("/standard-sections", optionalAuth, getStandardSectionsController);
router.get("/distinct", optionalAuth, getDistinctClassesWithSectionsController);
router.get(
  "/totalstudents/:className",
  optionalAuth,
  getTotalStudentsInClassByNameController,
);

// ── Write routes — require a valid JWT ──
// POST /add — super_admin only (creates new class rows)
router.post("/add", authMiddleware, authorize("super_admin"), addClassController);
// PUT /edit/:id — any authenticated admin can reassign a teacher to a class
router.put("/edit/:id", authMiddleware, editClassController);
// DELETE /delete/:id — unassigns teacher; any authenticated admin (branch-scoped)
router.delete("/delete/:id", authMiddleware, deleteClassController);
// DELETE /hard-delete/:id — permanently removes a class row; super_admin only
router.delete(
  "/hard-delete/:id",
  authMiddleware,
  authorize("super_admin"),
  hardDeleteClassController,
);

export default router;
