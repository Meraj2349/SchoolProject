import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  addTeacherController,
  getAllTeachersController,
  updateTeacherController,
  deleteTeacherController,
  checkDuplicateTeacherController,
  searchTeachersController,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/addTeacher", addTeacherController);
router.get("/", getAllTeachersController);
router.get("/search", searchTeachersController);
router.put("/updateTeacher/:id", updateTeacherController);
router.delete("/deleteTeacher/:id", deleteTeacherController);
router.get("/checkDuplicate", checkDuplicateTeacherController);

export default router;
