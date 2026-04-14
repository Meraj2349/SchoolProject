import express from "express";
import {
  addTeacherController,
  getAllTeachersController,
  updateTeacherController,
  deleteTeacherController,
  checkDuplicateTeacherController,
  searchTeachersController,
} from "../controllers/teacher.controller.js";

const router = express.Router();
router.post("/addTeacher", addTeacherController);
router.get("/", getAllTeachersController);
router.get("/search", searchTeachersController);
router.put("/updateTeacher/:id", updateTeacherController);
router.delete("/deleteTeacher/:id", deleteTeacherController);
router.get("/checkDuplicate", checkDuplicateTeacherController);
export default router;
