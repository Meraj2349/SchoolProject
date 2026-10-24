import { afterAll, describe, expect, it } from "@jest/globals";
import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = fs.readFileSync(path.resolve(__dirname, "../../Sql/add_fees_migration.sql"), "utf8");

// Children first, so foreign keys never block the drop.
const FEE_TABLES = [
  "FeePayments", "FeeInvoiceItems", "FeeInvoices", "StudentDiscounts",
  "FeeHeads", "FeeStructures", "FeeSettings", "FeeReceiptCounters",
];

const runMigration = async () => {
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
};

const columnsOf = async (table) => {
  const { rows: rows } = await db.query(
    "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    [table],
  );
  return rows.map((r) => r.name).sort();
};

describe("add_fees_migration.sql", () => {
  afterAll(() => db.end());

  it("creates the same fee tables as a fresh install and is safe to run twice", async () => {
    const fresh = {};
    for (const table of FEE_TABLES) fresh[table] = await columnsOf(table);
    for (const table of FEE_TABLES) await db.query(`DROP TABLE \`${table}\``);

    await runMigration();
    await runMigration();

    for (const table of FEE_TABLES) expect(await columnsOf(table)).toEqual(fresh[table]);
  });
});
