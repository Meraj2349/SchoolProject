import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
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
router.post("/addTeacher", authMiddleware, addTeacherController);
router.put("/updateTeacher/:id", authMiddleware, updateTeacherController);
router.delete("/deleteTeacher/:id", authMiddleware, deleteTeacherController);

export default router;
