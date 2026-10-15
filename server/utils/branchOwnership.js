import db from "../config/db.config.js";

// Which branch rows belong to, for checks such as "this student is in the
// admin's branch". Table and id column come from this list only.
const ID_COLUMNS = {
  Students: "StudentID",
  Classes: "ClassID",
  Teachers: "TeacherID",
  Subjects: "SubjectID",
};

const idColumnOf = (table) => {
  const column = ID_COLUMNS[table];
  if (!column) throw new Error(`branchOwnership: unknown table ${table}`);
  return column;
};

/** The branch_id of one row, or undefined when the row does not exist. */
export async function branchOf(table, id) {
  const [rows] = await db.query(`SELECT branch_id FROM \`${table}\` WHERE ${idColumnOf(table)} = ?`, [id]);
  return rows[0]?.branch_id;
}

/** True when every id exists and belongs to branchId. */
export async function allInBranch(table, ids, branchId) {
  const unique = [...new Set(ids.map(Number))];
  if (unique.length === 0) return true;
  const [[row]] = await db.query(
    `SELECT COUNT(*) AS n FROM \`${table}\` WHERE ${idColumnOf(table)} IN (?) AND branch_id = ?`,
    [unique, branchId],
  );
  return Number(row.n) === unique.length;
}
