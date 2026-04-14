import mysql from "mysql2/promise"; //use for async/await
//use .env for this code
import dotenv from "dotenv";
dotenv.config();
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Date objects.
  // Without this, mysql2 converts DATE to a Date object at midnight local time,
  // which toISOString() then shifts back by the UTC offset — causing off-by-one
  // day bugs in Bangladesh (UTC+6) and any other UTC+ timezone.
  dateStrings: ["DATE"],
});

export default db;
