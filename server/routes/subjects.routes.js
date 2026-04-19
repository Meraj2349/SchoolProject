import express from "express";
import authMiddleware, { optionalAuth, authorize } from "../middlewares/auth.middleware.js";
import {
  addSubjectController,
  deleteSubjectController,
  editSubjectController,
  getSubjectsController,
  getSubjectsByClassIdController,
  getSubjectsByClassNameController,
} from "../controllers/subjects.controller.js";

const router = express.Router();

// Read — public (branches see the same global subject catalog).
router.get("/", optionalAuth, getSubjectsController);
router.get("/class/:classId", optionalAuth, getSubjectsByClassIdController);
router.get("/by-class-name/:className", optionalAuth, getSubjectsByClassNameController);

// Write — super_admin only (subjects are global).
router.post("/add", authMiddleware, authorize("super_admin"), addSubjectController);
router.put("/edit/:id", authMiddleware, authorize("super_admin"), editSubjectController);
router.delete("/delete/:id", authMiddleware, authorize("super_admin"), deleteSubjectController);

export default router;
