import db, { insertList } from "../../../shared/db/index.js";
import { ConflictError } from "../../../shared/errors/index.js";
import { branchFilter } from "../../../../utils/branchFilter.js";

export const postgresJobApplicationRepository = {
  async list({ branchId, circularId, status }) {
    const { clause, params } = branchFilter(branchId);
    const filters = [circularId && ["circular_id = ?", circularId], status && ["status = ?", status]].filter(Boolean);
    const { rows } = await db.query(
      `SELECT * FROM "JobApplications" WHERE 1=1 ${clause} ${filters.map(([sql]) => `AND ${sql}`).join(" ")}
        ORDER BY created_at DESC, id DESC`,
      [...params, ...filters.map(([, value]) => value)],
    );
    return rows;
  },

  async find(id) {
    const { rows } = await db.query(`SELECT * FROM "JobApplications" WHERE id = ?`, [id]);
    return rows[0] ?? null;
  },

  // The unique key (circular, post, phone) refuses a second application.
  async insert(row) {
    try {
      const values = insertList(row, db.ident);
      return await db.insert(`INSERT INTO "JobApplications" ${values.sql}`, values.params, "id");
    } catch (error) {
      if (db.isUniqueViolation(error)) throw new ConflictError("job_application_duplicate");
      throw error;
    }
  },

  async setStatus(id, status) {
    await db.query(`UPDATE "JobApplications" SET status = ? WHERE id = ?`, [status, id]);
  },

  async remove(id) {
    await db.query(`DELETE FROM "JobApplications" WHERE id = ?`, [id]);
  },

  async countsByCircular({ branchId }) {
    const { clause, params } = branchFilter(branchId);
    const { rows } = await db.query(`SELECT circular_id, COUNT(*) AS n FROM "JobApplications" WHERE 1=1 ${clause} GROUP BY circular_id`, params);
    return Object.fromEntries(rows.map((row) => [row.circular_id, Number(row.n)]));
  },
};
