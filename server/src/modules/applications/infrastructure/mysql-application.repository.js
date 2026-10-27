import db, { insertList } from "../../../shared/db/index.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

export const mysqlApplicationRepository = {
  async branchExists(id) {
    const { rows } = await db.query(`SELECT 1 FROM "Branches" WHERE id = ?`, [id]);
    return rows.length > 0;
  },

  async list({ branchId }) {
    const { clause, params } = branchFilter(branchId);
    const { rows } = await db.query(`SELECT * FROM "Applications" WHERE 1=1 ${clause} ORDER BY created_at DESC, id DESC`, params);
    return rows;
  },

  async find(id) {
    const { rows } = await db.query(`SELECT * FROM "Applications" WHERE id = ?`, [id]);
    return rows[0] ?? null;
  },

  async insert(row) {
    const values = insertList(row, db.ident);
    return db.insert(`INSERT INTO "Applications" ${values.sql}`, values.params, "id");
  },

  async setStatus(id, status) {
    await db.query(`UPDATE "Applications" SET status = ? WHERE id = ?`, [status, id]);
  },

  // Remembers the enrolment, so accepting again does not enrol the child twice.
  async linkStudent(id, studentId, branchId) {
    await db.query(`UPDATE "Applications" SET student_id = ?, branch_id = ? WHERE id = ?`, [studentId, branchId, id]);
  },

  async remove(id) {
    await db.query(`DELETE FROM "Applications" WHERE id = ?`, [id]);
  },
};
