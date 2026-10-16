import express from "express";
import { teacherAppController as teacherApp, teacherAuth } from "../src/modules/teacher-app/index.js";
import { rateLimit } from "../src/shared/http/rateLimit.js";

// The class teachers' phone app. Versioned, so an old app keeps working
// while a newer one moves to /v2.
const router = express.Router();

// Per address, on top of the lock after five wrong passwords for one number:
// stops one address guessing across many numbers.
const loginLimit = rateLimit({
  max: Number(process.env.TEACHER_APP_LOGINS_PER_15_MINUTES || 20),
  windowMs: 15 * 60 * 1000,
});

router.post("/login", loginLimit, teacherApp.login);

router.use(teacherAuth);
router.get("/me", teacherApp.me);
router.post("/password", teacherApp.changePassword);
// GET /classes/:classId/roster?date=YYYY-MM-DD (default today)
router.get("/classes/:classId/roster", teacherApp.roster);
router.put("/classes/:classId/attendance/:date", teacherApp.saveDay);

export default router;
