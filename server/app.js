import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import db from "./config/db.config.js";
import { languageMiddleware } from "./middlewares/language.middleware.js";
import adminRouter from "./routes/admin.routes.js";
import attendanceRoutes from "./routes/attendance.route.js";
import applicationRoutes from "./routes/application.routes.js";
import newsRoutes from "./routes/news.routes.js";
import noticeAnnouncementRoutes from "./routes/notice-announcement.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import jobCircularRoutes from "./routes/jobCircular.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import classRoutes from "./routes/classes.routes.js";
import eventRoutes from "./routes/event.routes.js";
import examRoutes from "./routes/exam.routes.js";
import feeRoutes from "./routes/fees.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import imageRoutes from "./routes/image.routes.js";
import chairmanRoutes from "./routes/chairman.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import noticeRoutes from "./routes/notices.routes.js";
import resultRoutes from "./routes/result.routes.js";
import routineRoutes from "./routes/routine.routes.js";
import studentRouter from "./routes/student.route.js";
import quizRoutes from "./routes/quiz.routes.js";
import subjectRoutes from "./routes/subjects.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import adminsRoutes from "./routes/admins.routes.js";
import { errorHandler } from "./src/shared/http/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Language detection – attaches req.language ("en" | "bn"), default "bn"
app.use(languageMiddleware);

// Serve static files from public directory (for file uploads)
app.use(express.static("public"));

// Use the routes under /api/
app.use("/api/admin", adminRouter);
app.use("/api/admins", adminsRoutes);
app.use("/api/students", studentRouter);
app.use("/api/teachers", teacherRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/chairman", chairmanRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/notice-announcements", noticeAnnouncementRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/job-circulars", jobCircularRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Errors raised outside controllers (e.g. a refused upload) → JSON, translated.
app.use(errorHandler);

// Handle root URL (Welcome message)
app.get("/", (req, res) => {
  res.send("Welcome to the School Project API");
});

export default app;

// Only listen when run directly (`node app.js`); tests and serverless
// platforms import the app instead.
const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  db.query("SELECT 1")
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Database connection failed: " + err.message));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
