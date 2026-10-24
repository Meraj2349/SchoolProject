import jwt from "jsonwebtoken";
import db, { insertList } from "../../src/shared/db/index.js";

export { db };

export const BRANCH_A = 1;
export const BRANCH_B = 2;

// Admin accounts seeded by resetDb, used by the default tokens.
export const FIXTURE_ADMINS = { super: 9001, [BRANCH_A]: 9002, [BRANCH_B]: 9003 };

// Reference data loaded with the schema that tests must not wipe.
const REFERENCE_TABLES = ["ClassNames", "ChairmanProfile"];

async function dataTables() {
  const { rows } =
    db.dialect === "postgres"
      ? await db.query(
          "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'",
        )
      : await db.query("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()");
  return rows.map((row) => row.name).filter((name) => !REFERENCE_TABLES.includes(name) && name !== "schema_migrations");
}

// Empties every data table and re-seeds two branches so each test starts clean.
export async function resetDb() {
  const tables = await dataTables();
  if (db.dialect === "postgres") {
    await db.query(`TRUNCATE ${tables.map((t) => db.ident(t)).join(", ")} RESTART IDENTITY CASCADE`);
  } else {
    // FOREIGN_KEY_CHECKS is per connection, so do all of it on one connection.
    await db.withTransaction(async (tx) => {
      await tx.query("SET FOREIGN_KEY_CHECKS = 0");
      for (const table of tables) await tx.query(`TRUNCATE TABLE ${db.ident(table)}`);
      await tx.query("SET FOREIGN_KEY_CHECKS = 1");
    });
  }
  await db.query(
    `INSERT INTO "Branches" ("id", "name_en", "name_bn") VALUES (?, 'Main', 'প্রধান'), (?, 'North', 'উত্তর')`,
    [BRANCH_A, BRANCH_B],
  );
  // The server checks every admin token against the Admin table, so the
  // default tokens below belong to these real accounts.
  await db.query(
    `INSERT INTO "Admin" ("AdminID", "Username", "Email", "Password", "role", "branch_id") VALUES
       (?, 'fixture-super', 'super@fixture.test', 'x', 'super_admin', NULL),
       (?, 'fixture-a', 'a@fixture.test', 'x', 'branch_admin', ?),
       (?, 'fixture-b', 'b@fixture.test', 'x', 'branch_admin', ?)`,
    [FIXTURE_ADMINS.super, FIXTURE_ADMINS[BRANCH_A], BRANCH_A, FIXTURE_ADMINS[BRANCH_B], BRANCH_B],
  );
  // PostgreSQL does not move an identity past ids given explicitly.
  if (db.dialect === "postgres") {
    await db.query(`SELECT setval(pg_get_serial_sequence('"Branches"', 'id'), (SELECT MAX("id") FROM "Branches"))`);
    await db.query(`SELECT setval(pg_get_serial_sequence('"Admin"', 'AdminID'), (SELECT MAX("AdminID") FROM "Admin"))`);
  }
}

// For tests that manage admin accounts themselves (counts, first registration).
export async function clearAdmins() {
  await db.query(`DELETE FROM "Admin"`);
}

const identityColumns = new Map();

/** The table's generated id column on PostgreSQL (MySQL reports insertId on its own). */
async function identityColumnOf(table) {
  if (db.dialect !== "postgres") return null;
  if (!identityColumns.has(table)) {
    const row = await db.one(
      `SELECT a.attname AS name FROM pg_attribute a
        WHERE a.attrelid = ?::regclass AND a.attidentity <> '' AND NOT a.attisdropped`,
      [db.ident(table)],
    );
    identityColumns.set(table, row?.name ?? null);
  }
  return identityColumns.get(table);
}

/** Inserts a row and returns its generated id (undefined for tables without one). */
export async function insert(table, row) {
  const values = insertList(row, db.ident);
  const sql = `INSERT INTO ${db.ident(table)} ${values.sql}`;
  const idColumn = await identityColumnOf(table);
  if (db.dialect === "postgres" && !idColumn) {
    await db.query(sql, values.params);
    return undefined;
  }
  const id = await db.insert(sql, values.params, idColumn);
  // An explicit id leaves PostgreSQL's identity behind; move it past the row.
  if (idColumn && row[idColumn] !== undefined) {
    await db.query(
      `SELECT setval(pg_get_serial_sequence(?, ?), (SELECT MAX(${db.ident(idColumn)}) FROM ${db.ident(table)}))`,
      [db.ident(table), idColumn],
    );
  }
  return id;
}

export async function count(table, where = "1=1", params = []) {
  const row = await db.one(`SELECT COUNT(*) AS n FROM ${db.ident(table)} WHERE ${where}`, params);
  return Number(row.n);
}

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

export const superAdminToken = (adminID = FIXTURE_ADMINS.super) =>
  sign({ adminID, role: "super_admin", branch_id: null });

export const branchAdminToken = (branchId, adminID = FIXTURE_ADMINS[branchId]) =>
  sign({ adminID, role: "branch_admin", branch_id: branchId });

export const quizStudentToken = (studentId, branchId) =>
  sign({ studentId, branch_id: branchId, userType: "quiz" });

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });

// A class + student in the given branch, the most common fixture.
export async function seedStudent({ branchId = BRANCH_A, className = "Class 5", section = "Good", roll = "1", firstName = "Rahim" } = {}) {
  const existing = await db.one(
    `SELECT "ClassID" FROM "Classes" WHERE "ClassName" = ? AND "Section" = ? AND "branch_id" = ?`,
    [className, section, branchId],
  );
  const classId =
    existing?.ClassID ??
    (await insert("Classes", { ClassName: className, Section: section, branch_id: branchId }));
  const studentId = await insert("Students", {
    FirstName: firstName,
    LastName: "Uddin",
    RollNumber: roll,
    DateOfBirth: "2015-01-01",
    Gender: "Male",
    ClassID: classId,
    AdmissionDate: "2024-01-01",
    branch_id: branchId,
  });
  return { classId, studentId };
}
