import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { attendanceController as attendance } from "../src/modules/attendance/index.js";
import { absenceSmsController } from "../src/modules/notifications/index.js";
import { requireWriteBranch } from "../src/shared/http/requireWriteBranch.js";

const router = express.Router();

// ── Public lookups (optionalAuth: branch-scoped via ?branch_id) ──
// Students and parents look up attendance without signing in.
router.get("/search/class/:className/section/:section", optionalAuth, attendance.byClassSection);
router.get("/search/name/:firstName/roll/:roll/class/:class/section/:section", optionalAuth, attendance.byNameRoll);
router.get("/student/:studentID", optionalAuth, attendance.byStudent);
router.get("/summary/student/:studentID", optionalAuth, attendance.studentSummary);

// ── Admins ──
router.use(authMiddleware);

router.get("/statistics", attendance.statistics);
router.get("/count", attendance.count);
router.get("/exists", attendance.exists);
// GET /grid?className=&section=&startDate=&endDate=
router.get("/grid", attendance.grid);
// GET /roster?classId=&date=  a class's students with their status that day
router.get("/roster", attendance.roster);
// GET /overview?date=  every class of the branch (or of all branches) that day
router.get("/overview", attendance.overview);
// GET /sms?date=  the day's SMS to parents of absent children
router.get("/sms", absenceSmsController.list);
router.get("/summary/class/:classID/date/:date", attendance.classDaySummary);
router.get("/search/daterange/:startDate/:endDate", attendance.byDateRange);
router.get("/class/:classID", attendance.byClass);
router.get("/date/:date", attendance.byDate);

// A class's whole day in one request.
router.put("/class/:classId/date/:date", attendance.saveDay);
// One student's day, filed under their own class and branch.
router.post("/cell", attendance.markStudent);
router.post("/mark", attendance.markStudent);

router.get("/", attendance.all);
router.post("/", requireWriteBranch, attendance.create);
router.post("/bulk", requireWriteBranch, attendance.bulk);

router.get("/:id", attendance.byId);
router.put("/:id", attendance.update);
router.delete("/:id", attendance.remove);

export default router;
