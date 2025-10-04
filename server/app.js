import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import db from "./config/db.config.js";
import adminRouter from "./routes/admin.routes.js";
import attendanceRoutes from "./routes/attendance.route.js";
import classRoutes from "./routes/classes.routes.js";
import eventRoutes from "./routes/event.routes.js";
import examRoutes from "./routes/exam.routes.js";
import imageRoutes from "./routes/image.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import noticeRoutes from "./routes/notices.routes.js";
import resultRoutes from "./routes/result.routes.js";
import routineRoutes from "./routes/routine.routes.js";
import studentRouter from "./routes/student.route.js";
import subjectRoutes from "./routes/subjects.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Serve static files from public directory (for file uploads)
app.use(express.static('public'));

// Database connection check
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
    return;
  }
  console.log("Connected to the database");
});

// Use the routes under /api/
app.use("/api/admin", adminRouter);
app.use("/api/students", studentRouter);
app.use("/api/teachers", teacherRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);

// Handle root URL (Welcome message)
app.get("/", (req, res) => {
  res.send("Welcome to the School Project API");
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
