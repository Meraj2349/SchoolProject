import { ValidationError } from "../../../shared/errors/index.js";

// Fee data always belongs to one branch. A super admin (branchId null) can read
// across branches but must pick a branch (?branch_id=) to configure or change it.
export function requireBranch(branchId) {
  if (branchId == null) throw new ValidationError("fee_branch_required");
  return Number(branchId);
}
