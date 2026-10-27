import fs from "fs";
import mysql from "mysql2/promise";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import { runMigrations } from "../../src/shared/db/migrate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MYSQL_SCHEMA = path.resolve(__dirname, "../../Sql/database.sql");
const PG_MIGRATIONS = path.resolve(__dirname, "../../db/migrations");

const settings = (defaultPort) => ({
  host: process.env.TEST_DB_HOST || "127.0.0.1",
  port: Number(process.env.TEST_DB_PORT || defaultPort),
  user: process.env.TEST_DB_USER || "school_test",
  password: process.env.TEST_DB_PASSWORD ?? "school_test",
});

// Builds a fresh test database exactly as a new install gets it — so tests
// catch schema drift too. MySQL: Sql/database.sql. PostgreSQL: the dbmate
// migrations, applied by the same runner as `npm run db:migrate`.
export default async function globalSetup() {
  const dbName = process.env.TEST_DB_NAME || "school_test";
  if ((process.env.TEST_DB_DIALECT || "mysql") === "postgres") await buildPostgres(dbName);
  else await buildMysql(dbName);
}

async function buildMysql(dbName) {
  const connection = await mysql.createConnection({ ...settings(3306), multipleStatements: true });
  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await connection.query(`CREATE DATABASE \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    await connection.query(fs.readFileSync(MYSQL_SCHEMA, "utf8"));
  } finally {
    await connection.end();
  }
}

async function buildPostgres(dbName) {
  const admin = new pg.Client({ ...settings(5432), database: "postgres" });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${dbName}"`);
  } finally {
    await admin.end();
  }
  const client = new pg.Client({ ...settings(5432), database: dbName });
  await client.connect();
  try {
    await runMigrations({
      client,
      files: fs.readdirSync(PG_MIGRATIONS),
      read: (file) => fs.readFileSync(path.join(PG_MIGRATIONS, file), "utf8"),
    });
  } finally {
    await client.end();
  }
}
