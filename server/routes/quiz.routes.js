import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import quizStudentMiddleware from "../middlewares/quizStudent.middleware.js";
import {
  getMetaController,
  verifyStudentController,
  startController,
  finishController,
  mySessionsController,
  myProgressController,
  adminSessionsController,
  adminLeaderboardController,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Public: subject + grade list (for filter dropdowns)
router.post("/meta", getMetaController);
router.get("/meta", getMetaController);

// Public: verify student identity, returns 30m quiz JWT
router.post("/verify", verifyStudentController);

// Quiz-token-authenticated (30m JWT, userType: "quiz")
router.post("/start", quizStudentMiddleware, startController);
router.post("/finish", quizStudentMiddleware, finishController);
router.get("/my-sessions", quizStudentMiddleware, mySessionsController);
router.get("/my-progress", quizStudentMiddleware, myProgressController);

// Admin-authenticated (branch-scoped inside the controller)
router.get("/admin/sessions", authMiddleware, adminSessionsController);
router.get("/admin/leaderboard", authMiddleware, adminLeaderboardController);

export default router;
