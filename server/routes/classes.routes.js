import express from "express";
import authMiddleware, { optionalAuth, authorize } from "../middlewares/auth.middleware.js";
import {
  addClassController,
  hardDeleteClassController,
  getClassesController,
  editClassController,
  getTotalStudentsInClassByNameController,
  getDistinctClassesWithSectionsController,
  getDistinctClassNamesController,
  getStandardSectionsController,
  assignTeacherController,
  unassignTeacherController,
} from "../controllers/classes.controller.js";

const router = express.Router();

// ── Public read (optional auth — branch-scoped student counts via ?branch_id) ──
router.get("/", optionalAuth, getClassesController);
router.get("/names", optionalAuth, getDistinctClassNamesController);
router.get("/standard-sections", optionalAuth, getStandardSectionsController);
router.get("/distinct", optionalAuth, getDistinctClassesWithSectionsController);
router.get(
  "/totalstudents/:className",
  optionalAuth,
  getTotalStudentsInClassByNameController,
);

// ── Class CRUD (super_admin only — classes are global across branches) ──
router.post("/add", authMiddleware, authorize("super_admin"), addClassController);
router.put("/edit/:id", authMiddleware, authorize("super_admin"), editClassController);
router.delete(
  "/hard-delete/:id",
  authMiddleware,
  authorize("super_admin"),
  hardDeleteClassController,
);

// ── Teacher assignment (per branch — branch_admin or super_admin+branch) ──
router.put(
  "/:id/teacher",
  authMiddleware,
  authorize("branch_admin", "super_admin"),
  assignTeacherController,
);
router.delete(
  "/:id/teacher",
  authMiddleware,
  authorize("branch_admin", "super_admin"),
  unassignTeacherController,
);

export default router;
