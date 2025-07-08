import express from "express";
import {
  bulkCreateAttendanceController,
  checkAttendanceExistsController,
  createAttendanceController,
  deleteAttendanceController,
  forceSyncController,
  getAllAttendanceController,
  getAttendanceByClassAndSectionController,
  getAttendanceByClassIDController,
  getAttendanceByDateController,
  getAttendanceByDateRangeController,
  getAttendanceByIDController,
  getAttendanceByNameRollClassSectionController,
  getAttendanceByStudentIdController,
  getAttendanceCountController,
  getAttendanceStatisticsController,
  getAttendanceSummaryByStudentController,
  getClassAttendanceSummaryByClassAndDateController,
  markAttendanceController,
  updateAttendanceController,
  validateDatabaseSyncController,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// Statistics and Count Routes (More specific routes first)
// Route to get attendance statistics
router.get("/statistics", getAttendanceStatisticsController);

// Route to get attendance count
router.get("/count", getAttendanceCountController);

// Route to check if attendance exists
router.get("/exists", checkAttendanceExistsController);

// Summary Routes
// Route to get attendance summary by student ID
router.get("/summary/student/:studentID", getAttendanceSummaryByStudentController);

// Route to get class attendance summary by class ID and date
router.get("/summary/class/:classID/date/:date", getClassAttendanceSummaryByClassAndDateController);

// Search and Filter Routes
// Route to get attendance by name, roll number, class, and section
router.get("/search/name/:firstName/roll/:roll/class/:class/section/:section", getAttendanceByNameRollClassSectionController);

// Route to get attendance by class name and section
router.get("/search/class/:className/section/:section", getAttendanceByClassAndSectionController);

// Route to get attendance by date range
router.get("/search/daterange/:startDate/:endDate", getAttendanceByDateRangeController);

// Route to get attendance by student ID
router.get("/student/:studentID", getAttendanceByStudentIdController);

// Route to get attendance by class ID
router.get("/class/:classID", getAttendanceByClassIDController);

// Route to get attendance by date
router.get("/date/:date", getAttendanceByDateController);

// CRUD Routes
// Route to get all attendance records
router.get("/", getAllAttendanceController);

// Route to create a new attendance record
router.post("/", createAttendanceController);

// Route to mark attendance (upsert - create or update)
router.post("/mark", markAttendanceController);

// Route to bulk create attendance records
router.post("/bulk", bulkCreateAttendanceController);

// Route to validate database sync
router.post("/validate-sync", validateDatabaseSyncController);

// Route to force complete data sync
router.post("/force-sync", forceSyncController);

// Route to get a specific attendance record by ID
router.get("/:id", getAttendanceByIDController);

// Route to update an attendance record by ID
router.put("/:id", updateAttendanceController);

// Route to delete an attendance record by ID
router.delete("/:id", deleteAttendanceController);

export default router;