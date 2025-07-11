import mysql from "mysql2/promise"; //use for async/await
//use .env for this code
import dotenv from "dotenv";
dotenv.config();
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export default db;
