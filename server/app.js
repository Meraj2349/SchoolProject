import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import db from "./config/db.config.js";

//import userRoutes from './routes/user.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
//database connection or not
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1+1 AS solution");
    res.send(`database is working ! Solution: ${rows[0].solution}`);
  } catch (error) {
    res.status(500).send("Database Cunnection failed :" + error);
  }
});
// Routes
//app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
