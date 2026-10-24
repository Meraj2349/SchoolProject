import { afterAll, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { db, resetDb } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/attendance_day_index_migration.sql"), "utf8");
const SCHEMA = fs.readFileSync(path.resolve(__dirname, "../../Sql/database.sql"), "utf8");

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  try {
    await connection.query(MIGRATION);
  } finally {
    await connection.end();
  }
}

/** Indexes of Attendance whose first column is ClassDate. */
const dayIndexes = async () => {
  const { rows } = await db.query(
    `SELECT INDEX_NAME AS name FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Attendance' AND SEQ_IN_INDEX = 1 AND COLUMN_NAME = 'ClassDate'`,
  );
  return rows.map((row) => row.name);
};

// The attendance overview reads one day of every branch: it needs an index on the day.
describe("attendance day index migration", () => {
  afterAll(async () => {
    await resetDb();
    await db.end();
  });

  // Other suites rebuild Attendance as an older schema, so this reads the file.
  it("is part of a fresh install", () => {
    expect(SCHEMA).toMatch(/INDEX idx_attendance_day \(ClassDate\)/);
  });

  it("adds the index to an older database once, however often it runs", async () => {
    if ((await dayIndexes()).length > 0) await db.query("ALTER TABLE Attendance DROP INDEX idx_attendance_day");

    await runMigration();
    await runMigration();

    expect(await dayIndexes()).toEqual(["idx_attendance_day"]);
  });
});
