import { ForbiddenError, NotFoundError } from "./errors/index.js";

// Who may see and change rows that belong to one branch or, when branch_id is
// null, to the whole school (website content, applications).
// `admin` is { role, branchId } as set by authMiddleware: a branch admin's own
// branch, or the branch a super admin picked (null = "All branches").

/** A viewer with no branch sees everything; otherwise their branch plus whole-school rows. */
export const canSee = (viewerBranchId, rowBranchId) =>
  viewerBranchId == null || rowBranchId == null || rowBranchId === viewerBranchId;

/** A super admin manages every row; a branch admin only their own branch's rows. */
export const canManage = (admin, rowBranchId) =>
  admin.role === "super_admin" || (rowBranchId != null && rowBranchId === admin.branchId);

/** The branch a new row belongs to: the acting branch, or null (whole school) for a super admin on "All". */
export const newRowBranch = (admin) => admin.branchId ?? null;

/**
 * Throws unless the admin may change the row. Another branch's row is hidden
 * (NotFoundError with `notFoundKey`); a whole-school row the branch admin can
 * see but not change is refused (ForbiddenError).
 */
export function assertCanManage(admin, rowBranchId, notFoundKey) {
  if (canManage(admin, rowBranchId)) return;
  if (!canSee(admin.branchId, rowBranchId)) throw new NotFoundError(notFoundKey);
  throw new ForbiddenError("content_not_yours");
}
