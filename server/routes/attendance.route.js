import express from "express";
import {
  createAttendanceController,
  deleteAttendanceController,
  getAllAttendanceController,
  getAttendanceByClassAndSectionController,
  getAttendanceByClassIDController,
  getAttendanceByDateController,
  getAttendanceByIDController,
  getAttendanceByNameRollClassSectionController,
  getAttendanceByStudentIdController,
  getAttendanceSummaryByStudentController,
  getClassAttendanceSummaryByClassAndDateController,
  updateAttendanceController,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// Route to get all attendance records
router.get("/", getAllAttendanceController);

// Route to create a new attendance record
router.post("/", createAttendanceController);

// Route to get attendance summary by student ID
router.get("/summary/student/:studentID", getAttendanceSummaryByStudentController);

// Route to get class attendance summary by class ID and date
router.get("/summary/class/:classID/date/:date", getClassAttendanceSummaryByClassAndDateController);

// Route to get attendance by student ID
router.get("/student/:studentID", getAttendanceByStudentIdController);

// Route to get attendance by class ID
router.get("/class/:classID", getAttendanceByClassIDController);

// Route to get attendance by date
router.get("/date/:date", getAttendanceByDateController);

// Route to get a specific attendance record by ID
router.get("/:id", getAttendanceByIDController);

// Route to update an attendance record by ID
router.put("/:id", updateAttendanceController);

// Route to delete an attendance record by ID
router.delete("/:id", deleteAttendanceController);

// Route to get attendance by name, roll number, class, and section
router.get("/name/:firstName/roll/:roll/class/:class/section/:section", getAttendanceByNameRollClassSectionController);
// Route to get attendance by class name and section
router.get("/class/:className/section/:section", getAttendanceByClassAndSectionController);



export default router;