// Applies pending PostgreSQL migrations (db/migrations) to the database named
// by DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME.
//
//   node scripts/migrate.js        (npm run db:migrate)
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import { runMigrations } from "../src/shared/db/migrate.js";

dotenv.config();
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../db/migrations");

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  await client.connect();
  const applied = await runMigrations({
    client,
    files: fs.readdirSync(dir),
    read: (file) => fs.readFileSync(path.join(dir, file), "utf8"),
  });
  console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Database is up to date.");
} catch (error) {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
