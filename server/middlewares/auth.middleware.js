import jwt from "jsonwebtoken";
import { currentAdmin } from "../src/modules/admins/index.js";

const bearerToken = (req) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
};

const queryBranchId = (req) => {
  const qb = req.query?.branch_id;
  return qb != null && qb !== "" ? parseInt(qb, 10) : null;
};

/**
 * Verifies an admin JWT. Returns the decoded payload, or null when the token
 * is missing its admin claims — e.g. a quiz student's token, which is signed
 * with the same secret but must never grant admin access.
 * Throws when the token is malformed, tampered with or expired.
 */
const verifyAdminToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (decoded.userType === "quiz" || decoded.adminID == null) return null;
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
    return decoded ? findAdmin(decoded.adminID) : null;
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

// Role-based authorization middleware — use after authMiddleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.role || req.user?.role;
    if (!role) {
      return res.status(403).json({ error: "Role information missing" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: `Role ${role} is not authorized to access this resource`,
      });
    }

    next();
  };
};
