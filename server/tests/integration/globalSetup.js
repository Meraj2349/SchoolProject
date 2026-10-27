import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import { runMigrations } from "../../src/shared/db/migrate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = path.resolve(__dirname, "../../db/migrations");

const settings = {
  host: process.env.TEST_DB_HOST || "127.0.0.1",
  port: Number(process.env.TEST_DB_PORT || 5432),
  user: process.env.TEST_DB_USER || "school_test",
  password: process.env.TEST_DB_PASSWORD ?? "school_test",
};

// Builds a fresh test database exactly as a new install gets it — so tests
// catch schema drift too: the dbmate migrations, applied by the same runner
// as `npm run db:migrate`.
export default async function globalSetup() {
  const dbName = process.env.TEST_DB_NAME || "school_test";
  const admin = new pg.Client({ ...settings, database: "postgres" });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${dbName}"`);
  } finally {
    await admin.end();
  }
  const client = new pg.Client({ ...settings, database: dbName });
  await client.connect();
  try {
    await runMigrations({
      client,
      files: fs.readdirSync(MIGRATIONS),
      read: (file) => fs.readFileSync(path.join(MIGRATIONS, file), "utf8"),
    });
  } finally {
    await client.end();
  }
}
