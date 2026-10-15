import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_FILE = path.resolve(__dirname, "../../Sql/database.sql");

// Builds a fresh test database from Sql/database.sql — exactly what a new
// install (e.g. docker-compose) gets — so tests catch schema drift too.
export default async function globalSetup() {
  const dbName = process.env.TEST_DB_NAME || "school_test";
  const connection = await mysql.createConnection({
    host: process.env.TEST_DB_HOST || "127.0.0.1",
    port: Number(process.env.TEST_DB_PORT || 3306),
    user: process.env.TEST_DB_USER || "school_test",
    password: process.env.TEST_DB_PASSWORD ?? "school_test",
    multipleStatements: true,
  });
  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await connection.query(`CREATE DATABASE \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    await connection.query(fs.readFileSync(SCHEMA_FILE, "utf8"));
  } finally {
    await connection.end();
  }
}
