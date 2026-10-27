import db from "../../../shared/db/index.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

// SQL adapter for the exam repository port. An exam belongs to its class's
// branch: new exams copy it into Exams.branch_id, and reads scope by the class
// (as before, so rows written before branch_ownership_migration.sql still match).

const SELECT_EXAMS = `
  SELECT e."ExamID" AS id, c.branch_id AS "branchId", e."ClassID" AS "classId", c."ClassName" AS "className",
         c."Section" AS section, e."ExamType" AS type, e."ExamName" AS name, e."ExamDate" AS date
  FROM "Exams" e
  LEFT JOIN "Classes" c ON c."ClassID" = e."ClassID"`;

// Exam field → column, for updates (never a column name from the request).
const COLUMNS = { type: `"ExamType"`, name: `"ExamName"`, classId: `"ClassID"`, date: `"ExamDate"` };

function findById(id, { branchId }) {
  const { clause, params } = branchFilter(branchId, "c");
  return db.one(`${SELECT_EXAMS} WHERE e."ExamID" = ? ${clause}`, [id, ...params]);
}

export const postgresExamRepository = {
  findById,

  async findAll({ branchId }) {
    const { clause, params } = branchFilter(branchId, "c");
    const { rows } = await db.query(`${SELECT_EXAMS} WHERE 1=1 ${clause} ORDER BY e."ExamDate" DESC, e."ExamID" DESC`, params);
    return rows;
  },

  async distinctNames() {
    const { rows } = await db.query(`SELECT DISTINCT "ExamName" FROM "Exams" ORDER BY "ExamName"`);
    return rows.map((row) => row.ExamName);
  },

  findClass: ({ branchId, className, section }) =>
    db.one(`SELECT "ClassID" AS id, branch_id AS "branchId" FROM "Classes" WHERE "ClassName" = ? AND "Section" = ? AND branch_id = ?`, [
      className,
      section,
      branchId,
    ]),

  async create({ type, name, classId, date }) {
    const id = await db.insert(
      `INSERT INTO "Exams" ("ExamType", "ExamName", "ClassID", "ExamDate", branch_id)
       SELECT ?, ?, "ClassID", ?, branch_id FROM "Classes" WHERE "ClassID" = ?`,
      [type, name, date, classId],
      "ExamID",
    );
    return findById(id, { branchId: null });
  },

  async update(id, changes) {
    const fields = Object.keys(changes).filter((field) => field in COLUMNS);
    if (fields.length === 0) return;
    await db.query(`UPDATE "Exams" SET ${fields.map((field) => `${COLUMNS[field]} = ?`).join(", ")} WHERE "ExamID" = ?`, [
      ...fields.map((field) => changes[field]),
      id,
    ]);
  },

  /** The exam and its results, together. */
  remove: (id) =>
    db.withTransaction(async (tx) => {
      await tx.query(`DELETE FROM "Results" WHERE "ExamID" = ?`, [id]);
      await tx.query(`DELETE FROM "Exams" WHERE "ExamID" = ?`, [id]);
    }),
};
