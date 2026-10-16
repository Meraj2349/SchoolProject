import db from "../../../../config/db.config.js";
import { ConflictError } from "../../../shared/errors/index.js";
import {
  createBranch,
  getAllBranches,
  getBranchById,
  getBranchStats,
  updateBranch,
} from "../../../../models/branch.model.js";

// MySQL adapter for the branch repository port. It reuses the existing SQL in
// models/branch.model.js; move the queries here when that file is retired.
export const mysqlBranchRepository = {
  findAll: () => getAllBranches(),
  findById: (id) => getBranchById(id),
  create: async (data) => {
    const result = await createBranch(data);
    return { ...result.data, image_public_id: data.image_public_id };
  },
  update: (id, data) => updateBranch(id, data),
  // The database refuses to delete a branch something still points at.
  // usage() counts the common cases first; this catches anything else.
  remove: async (id) => {
    try {
      await db.query("DELETE FROM Branches WHERE id = ?", [id]);
    } catch (error) {
      if (error.code === "ER_ROW_IS_REFERENCED_2") throw new ConflictError("branch_in_use");
      throw error;
    }
  },

  async stats() {
    const [branches, [admins]] = await Promise.all([
      getBranchStats(),
      db.query("SELECT branch_id, COUNT(*) AS total FROM Admin WHERE branch_id IS NOT NULL GROUP BY branch_id"),
    ]);
    const adminCount = new Map(admins.map((row) => [row.branch_id, Number(row.total)]));
    return branches.map((branch) => ({ ...branch, adminCount: adminCount.get(branch.id) ?? 0 }));
  },

  /** How many rows of each kind still belong to the branch. */
  async usage(id) {
    const countIn = async (tables) => {
      const counts = await Promise.all(
        tables.map(async (table) => {
          const [[row]] = await db.query(`SELECT COUNT(*) AS n FROM \`${table}\` WHERE branch_id = ?`, [id]);
          return Number(row.n);
        }),
      );
      return counts.reduce((sum, n) => sum + n, 0);
    };
    const groups = {
      students: ["Students"],
      teachers: ["Teachers"],
      classes: ["Classes"],
      admins: ["Admin"],
      invoices: ["FeeInvoices"],
      payments: ["FeePayments"],
      applications: ["Applications", "JobApplications"],
      // The branch's own website content (whole-school content has no branch).
      websiteItems: ["Notices", "NoticeAnnouncements", "News", "Messages", "Images", "Events", "Achievements", "JobCirculars"],
    };
    const entries = await Promise.all(Object.entries(groups).map(async ([key, tables]) => [key, await countIn(tables)]));
    return Object.fromEntries(entries);
  },
};
