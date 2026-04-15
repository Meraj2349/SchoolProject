import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
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
router.get("/:id", optionalAuth, getStudentByIdController);
router.get(
  "/class/:className/section/:sectionName",
  optionalAuth,
  getStudentsByClassAndSectionController,
);

// ── Check roll — used during student creation in admin, keep optional (branch-scoped) ──
router.get("/check-roll", optionalAuth, checkRollNumberController);

// ── Write routes — require a valid JWT (admin only) ──
router.post("/", authMiddleware, addStudentController);
router.put("/:id", authMiddleware, updateStudentController);
router.delete("/:id", authMiddleware, deleteStudentController);

export default router;
