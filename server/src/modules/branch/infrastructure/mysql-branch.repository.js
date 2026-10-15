import {
  createBranch,
  deleteBranch,
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
  remove: (id) => deleteBranch(id),
  stats: () => getBranchStats(),
};
