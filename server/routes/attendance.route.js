import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
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

// ── Public read routes (optionalAuth: branch-scoped via ?branch_id) ──
// Students/parents can look up attendance without an admin token

// Search by class + section (used by public AttendancePage)
router.get(
  "/search/class/:className/section/:section",
  optionalAuth,
  getAttendanceByClassAndSectionController,
);

// Search by name/roll/class/section
router.get(
  "/search/name/:firstName/roll/:roll/class/:class/section/:section",
  optionalAuth,
  getAttendanceByNameRollClassSectionController,
);

// Student-specific attendance lookup
router.get("/student/:studentID", optionalAuth, getAttendanceByStudentIdController);
router.get("/summary/student/:studentID", optionalAuth, getAttendanceSummaryByStudentController);

// ── Admin-only routes — require a valid JWT ──
router.use(authMiddleware);

// Statistics and Count Routes
router.get("/statistics", getAttendanceStatisticsController);

// Grid route: GET /attendance/grid?className=&section=&startDate=&endDate=
router.get("/grid", getAttendanceGridController);

// Upsert a single attendance cell
router.post("/cell", upsertAttendanceCellController);

router.get("/count", getAttendanceCountController);
router.get("/exists", checkAttendanceExistsController);

router.get(
  "/summary/class/:classID/date/:date",
  getClassAttendanceSummaryByClassAndDateController,
);

router.get(
  "/search/daterange/:startDate/:endDate",
  getAttendanceByDateRangeController,
);

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
