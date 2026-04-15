import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
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
  getAttendanceGridController,
  getAttendanceStatisticsController,
  getAttendanceSummaryByStudentController,
  getClassAttendanceSummaryByClassAndDateController,
  markAttendanceController,
  updateAttendanceController,
  upsertAttendanceCellController,
  validateDatabaseSyncController,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.use(authMiddleware);

// Statistics and Count Routes (More specific routes first)
router.get("/statistics", getAttendanceStatisticsController);

// Grid route: GET /attendance/grid?className=&section=&startDate=&endDate=
router.get("/grid", getAttendanceGridController);

// Upsert a single attendance cell
router.post("/cell", upsertAttendanceCellController);

// Route to get attendance count
router.get("/count", getAttendanceCountController);

// Route to check if attendance exists
router.get("/exists", checkAttendanceExistsController);

// Summary Routes
router.get(
  "/summary/student/:studentID",
  getAttendanceSummaryByStudentController,
);

router.get(
  "/summary/class/:classID/date/:date",
  getClassAttendanceSummaryByClassAndDateController,
);

// Search and Filter Routes
router.get(
  "/search/name/:firstName/roll/:roll/class/:class/section/:section",
  getAttendanceByNameRollClassSectionController,
);

router.get(
  "/search/class/:className/section/:section",
  getAttendanceByClassAndSectionController,
);

router.get(
  "/search/daterange/:startDate/:endDate",
  getAttendanceByDateRangeController,
);

router.get("/student/:studentID", getAttendanceByStudentIdController);
router.get("/class/:classID", getAttendanceByClassIDController);
router.get("/date/:date", getAttendanceByDateController);

// CRUD Routes
router.get("/", getAllAttendanceController);
router.post("/", createAttendanceController);
router.post("/mark", markAttendanceController);
router.post("/bulk", bulkCreateAttendanceController);
router.post("/validate-sync", validateDatabaseSyncController);
router.post("/force-sync", forceSyncController);

router.get("/:id", getAttendanceByIDController);
router.put("/:id", updateAttendanceController);
router.delete("/:id", deleteAttendanceController);

export default router;
