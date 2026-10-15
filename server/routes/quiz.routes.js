import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import quizStudentMiddleware from "../middlewares/quizStudent.middleware.js";
import { requireRole } from "../src/shared/http/requireRole.js";
import { quizController as quiz } from "../src/modules/quiz/index.js";

const router = express.Router();

// Public: a student proves who they are and gets a 30-minute quiz token.
router.post("/verify", quiz.verify);

// Quiz token (userType "quiz"): the student's own class, quizzes and history.
router.get("/meta", quizStudentMiddleware, quiz.meta);
router.post("/start", quizStudentMiddleware, quiz.start);
router.post("/finish", quizStudentMiddleware, quiz.finish);
router.get("/my-sessions", quizStudentMiddleware, quiz.mySessions);
router.get("/my-progress", quizStudentMiddleware, quiz.myProgress);

// Admins: the question bank and results (branch-scoped). The bank is shared by
// every branch: any admin may read it, only super admins may change it.
const superAdminOnly = requireRole("super_admin");
const admin = express.Router();
admin.use(authMiddleware);
admin.get("/questions", quiz.listQuestions);
admin.get("/questions/subjects", quiz.subjects);
admin.get("/questions/:id", quiz.getQuestion);
admin.post("/questions", superAdminOnly, quiz.createQuestion);
admin.put("/questions/:id", superAdminOnly, quiz.updateQuestion);
admin.patch("/questions/:id/active", superAdminOnly, quiz.setActive);
admin.get("/sessions", quiz.sessions);
admin.get("/leaderboard", quiz.leaderboard);
router.use("/admin", admin);

export default router;
