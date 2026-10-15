import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { requireWriteBranch } from "../src/shared/http/requireWriteBranch.js";
import {
  addStudentController,
  checkRollNumberController,
  deleteStudentController,
  getAllClassesController,
  getAllStudentsController,
  getStudentByIdController,
  getStudentCountController,
  getStudentsByClassAndSectionController,
  getStudentsByClassController,
  searchStudentsController,
  updateStudentController,
} from "../controllers/student.controller.js";

const router = express.Router();

// ── Public read routes (optionalAuth: branch-scoped if ?branch_id provided, else all) ──
router.get("/", optionalAuth, getAllStudentsController);
router.get("/count", optionalAuth, getStudentCountController);
router.get("/search/filter", optionalAuth, searchStudentsController);
router.get("/classes", optionalAuth, getAllClassesController);
router.get("/class/:className", optionalAuth, getStudentsByClassController);
// Check roll — used during student creation in admin (branch-scoped).
// Must be registered before "/:id", otherwise "check-roll" is taken as an id.
router.get("/check-roll", optionalAuth, checkRollNumberController);
router.get("/:id", optionalAuth, getStudentByIdController);
router.get(
  "/class/:className/section/:sectionName",
  optionalAuth,
  getStudentsByClassAndSectionController,
);

// ── Write routes — require a valid JWT (admin only) ──
router.post("/", authMiddleware, requireWriteBranch, addStudentController);
router.put("/:id", authMiddleware, updateStudentController);
router.delete("/:id", authMiddleware, deleteStudentController);

export default router;
