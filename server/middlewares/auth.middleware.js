import jwt from "jsonwebtoken";
import { currentAdmin } from "../src/modules/admins/index.js";
import { requireRole } from "../src/shared/http/requireRole.js";

const bearerToken = (req) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
};

// ?branch_id as a branch id; anything else (missing, "abc", "0") means none.
const queryBranchId = (req) => {
  const id = Number(req.query?.branch_id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/**
 * Verifies an admin JWT. Returns the decoded payload, or null when the token
 * is missing its admin claims — e.g. a quiz student's or a teacher-app token:
 * signed with the same secret, they must never grant admin access.
 * Throws when the token is malformed, tampered with or expired.
 */
const verifyAdminToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (decoded.userType != null || decoded.adminID == null) return null; // quiz and teacher-app tokens
  return decoded;
};

// Sets req.adminId, req.role and req.branchId for an admin as stored now.
// req.branchId is null for super_admin (sees all data, or ?branch_id=X for
// scoped reads) and the admin's own branch for branch_admin.
const attachAdmin = (req, admin) => {
  req.adminId = admin.id;
  req.role = admin.role || "branch_admin";
  req.branchId = req.role === "super_admin" ? queryBranchId(req) : admin.branchId ?? null;
  req.user = { id: admin.id, role: req.role };
};

const rejectUnauthenticated = (res) =>
  res.status(401).json({ error: "Access denied, please log in again" });

/**
 * Builds the auth middlewares. `findAdmin(id)` returns the admin as stored now
 * ({ id, role, branchId }) or null. The login token only proves who you are:
 * role and branch come from the database on every request, so removing,
 * demoting or moving an admin takes effect at once rather than when the
 * token expires.
 */
export function makeAuthMiddleware({ findAdmin }) {
  // The admin behind a request's token; null for no/invalid/stale tokens.
  async function currentAdmin(req) {
    const token = bearerToken(req);
    if (!token) return null;
    let decoded;
    try {
      decoded = verifyAdminToken(token);
    } catch {
      return null; // malformed, tampered with or expired
    }
    if (!decoded) return null;
    const admin = await findAdmin(decoded.adminID);
    // A branch admin without a branch (their branch was deleted) must not fall
    // through to "no branch filter", which would mean every branch.
    if (admin && admin.role !== "super_admin" && admin.branchId == null) return null;
    return admin;
  }

  const serverError = (res, error) => {
    console.error("Auth lookup failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  };

  // Primary auth middleware for admin-only routes.
  const authMiddleware = async (req, res, next) => {
    let admin;
    try {
      admin = await currentAdmin(req);
    } catch (error) {
      return serverError(res, error);
    }
    // 401 (not 403) so the frontend clears the stale token and redirects to login.
    if (!admin) return rejectUnauthenticated(res);
    attachAdmin(req, admin);
    next();
  };

  /**
   * optionalAuth — for read-only public endpoints (GET /students, /teachers…).
   *
   * - Current admin's token → same as authMiddleware (branch_admin locked to own branch)
   * - No token, or a stale/invalid one → public visitor; req.branchId comes from
   *   ?branch_id (null = all branches). A visitor whose browser still holds an
   *   expired admin cookie must still be able to browse the public site.
   */
  const optionalAuth = async (req, res, next) => {
    let admin;
    try {
      admin = await currentAdmin(req);
    } catch (error) {
      return serverError(res, error);
    }
    if (admin) {
      attachAdmin(req, admin);
      return next();
    }
    req.role = "public";
    req.branchId = queryBranchId(req);
    next();
  };

  return { authMiddleware, optionalAuth };
}

const { authMiddleware, optionalAuth } = makeAuthMiddleware({ findAdmin: currentAdmin });

export default authMiddleware;

export { optionalAuth };

// Kept as an alias for routes that import `protect`.
export const protect = authMiddleware;

// Role-based authorization — use after authMiddleware (which loads req.role).
// The same guard as the modules use, with the translated 403.
export const authorize = requireRole;
