import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { teacherAccessController as appAccess } from "../src/modules/teacher-app/index.js";
import { requireWriteBranch } from "../src/shared/http/requireWriteBranch.js";
import {
  addTeacherController,
  getAllTeachersController,
  updateTeacherController,
  deleteTeacherController,
  checkDuplicateTeacherController,
  searchTeachersController,
} from "../controllers/teacher.controller.js";

const router = express.Router();

// ── Public read routes (optionalAuth: branch-scoped if ?branch_id provided) ──
router.get("/", optionalAuth, getAllTeachersController);
router.get("/search", optionalAuth, searchTeachersController);
router.get("/checkDuplicate", optionalAuth, checkDuplicateTeacherController);

// ── Write routes — require a valid JWT (admin only) ──
router.post("/addTeacher", authMiddleware, requireWriteBranch, addTeacherController);
router.put("/updateTeacher/:id", authMiddleware, updateTeacherController);
router.delete("/deleteTeacher/:id", authMiddleware, deleteTeacherController);

// ── Attendance app sign-in, set by an admin ──
router.get("/app-access", authMiddleware, appAccess.list);
router.put("/:id/app-access", authMiddleware, appAccess.setAccess);

export default router;
