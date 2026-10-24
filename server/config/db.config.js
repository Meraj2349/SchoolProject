import mysql from "mysql2/promise"; //use for async/await
//use .env for this code
import dotenv from "dotenv";
dotenv.config();

// A pool (not a single connection) so concurrent requests don't queue behind
// each other, and a connection MySQL closes after idling (wait_timeout) is
// replaced automatically instead of taking the whole API down.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  enableKeepAlive: true,
  // Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Date objects.
  // Without this, mysql2 converts DATE to a Date object at midnight local time,
  // which toISOString() then shifts back by the UTC offset — causing off-by-one
  // day bugs in Bangladesh (UTC+6) and any other UTC+ timezone.
  dateStrings: ["DATE"],
});

// Double quotes name tables and columns ("Students"), as in PostgreSQL, so
// the same SQL runs on both engines while the app moves to PostgreSQL.
db.pool.on("connection", (connection) => {
  connection.query("SET SESSION sql_mode = CONCAT(@@SESSION.sql_mode, ',ANSI_QUOTES')");
});

export default db;
