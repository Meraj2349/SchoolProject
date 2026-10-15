import jwt from "jsonwebtoken";
import db from "../../config/db.config.js";

export { db };

export const BRANCH_A = 1;
export const BRANCH_B = 2;

// Reference data loaded by database.sql that tests must not wipe.
const REFERENCE_TABLES = ["ClassNames", "ChairmanProfile"];

// Empties every data table and re-seeds two branches so each test starts clean.
export async function resetDb() {
  const [tables] = await db.query(
    "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME NOT IN (?)",
    [REFERENCE_TABLES],
  );
  // FOREIGN_KEY_CHECKS is per connection, so do all of it on one connection.
  const connection = await db.getConnection();
  try {
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const { name } of tables) await connection.query(`TRUNCATE TABLE \`${name}\``);
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    connection.release();
  }
  await db.query(
    "INSERT INTO Branches (id, name_en, name_bn) VALUES (?, 'Main', 'প্রধান'), (?, 'North', 'উত্তর')",
    [BRANCH_A, BRANCH_B],
  );
}

export async function insert(table, row) {
  const columns = Object.keys(row);
  const [result] = await db.query(
    `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES (?)`,
    [Object.values(row)],
  );
  return result.insertId;
}

export async function count(table, where = "1=1", params = []) {
  const [[row]] = await db.query(`SELECT COUNT(*) AS n FROM \`${table}\` WHERE ${where}`, params);
  return Number(row.n);
}

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

export const superAdminToken = (adminID = 1) =>
  sign({ adminID, role: "super_admin", branch_id: null });

export const branchAdminToken = (branchId, adminID = 2) =>
  sign({ adminID, role: "branch_admin", branch_id: branchId });

export const quizStudentToken = (studentId, branchId) =>
  sign({ studentId, branch_id: branchId, userType: "quiz" });

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });

// A class + student in the given branch, the most common fixture.
export async function seedStudent({ branchId = BRANCH_A, className = "Class 5", section = "Good", roll = "1", firstName = "Rahim" } = {}) {
  const [[existing]] = await db.query(
    "SELECT ClassID FROM Classes WHERE ClassName = ? AND Section = ? AND branch_id = ?",
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
