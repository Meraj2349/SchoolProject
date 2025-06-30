import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import db from "./config/db.config.js";
import adminRouter from "./routes/admin.routes.js";
import studentRouter from "./routes/student.route.js";
import teacherRoutes from "./routes/teacher.routes.js";
import noticeRoutes from "./routes/notices.routes.js";
import userRoutes from "./routes/user.routes.js";
import classRoutes from "./routes/classes.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import subjectRoutes from "./routes/subjects.routes.js";
import imageRoutes from "./routes/image.routes.js";
import attendanceRoutes from "./routes/attendance.route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

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
app.use("/api/messages", messageRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/attendance", attendanceRoutes);

// Handle root URL (Welcome message)
app.get("/", (req, res) => {
  res.send("Welcome to the School Project API");
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
