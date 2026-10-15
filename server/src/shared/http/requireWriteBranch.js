import { t } from "../../../config/i18n.js";

/**
 * Middleware, after authMiddleware, for routes that create branch-owned rows
 * (students, teachers, exams, ...). The new row belongs to req.branchId, so a
 * super admin on "All branches" (null) must pick a branch first.
 */
export function requireWriteBranch(req, res, next) {
  if (req.branchId == null) {
    return res.status(400).json({ success: false, message: t("branch_required", req.language) });
  }
  next();
}
