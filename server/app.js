import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from "./config/db.config.js";
import studentRouter from "./routes/student.route.js";

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

// Handle root URL (Welcome message)
app.get("/", (req, res) => {
  res.send("Welcome to the School Project API");
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});