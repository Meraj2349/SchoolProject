import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import db from "./config/db.config.js";
import studentRouter from "./routes/student.route.js";
import teacherRoutes from './routes/teacher.routes.js';
import classRoutes from './routes/classes.routes.js';
import subjectRoutes from './routes/subjects.routes.js';
import examsRoutes from './routes/exams.routes.js';
import examResults from './routes/result.routes.js';
import path from 'path';
import fileRoutes from './routes/multer.routes.js';
import { fileURLToPath } from 'url';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection check
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS solution");
    res.send(`Database is working! Solution: ${rows[0].solution}`);
  } catch (error) {
    res.status(500).send("Database connection failed: " + error.message);
  }
});

// Use the student routes under /api/students
app.use("/api/students", studentRouter);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/results', examResults);
app.use('/api/multer', fileRoutes);

// Serve static files from the "uploads" directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle root URL (Welcome message)
app.get("/", (req, res) => {
  res.send("Welcome to the School Project API");
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});