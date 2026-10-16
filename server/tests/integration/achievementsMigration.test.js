import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { db, insert, resetDb } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/achievements_migration.sql"), "utf8");

afterAll(() => db.end());

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

describe("achievements_migration.sql", () => {
  beforeEach(resetDb);

  it("creates the Achievements table with its branch link, and is safe to run twice", async () => {
    await db.query("DROP TABLE Achievements");

    await runMigration();
    await runMigration();

    await insert("Achievements", { title_en: "Win", title_bn: "জয়", category: "sports", year: 2025, branch_id: null });
    await expect(
      insert("Achievements", { title_en: "Win", title_bn: "জয়", category: "sports", year: 2025, branch_id: 999 }),
    ).rejects.toThrow(/foreign key/i);
  });
});
