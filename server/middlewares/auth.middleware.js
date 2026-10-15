import jwt from "jsonwebtoken";

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

// Sets req.adminId, req.role and req.branchId from a verified admin token.
// req.branchId is null for super_admin (sees all data, or ?branch_id=X for
// scoped reads) and the admin's own branch for branch_admin.
const attachAdmin = (req, decoded) => {
  req.adminId = decoded.adminID;
  req.role = decoded.role || "branch_admin";
  req.branchId = req.role === "super_admin" ? queryBranchId(req) : decoded.branch_id ?? null;
  req.user = { id: decoded.adminID, role: req.role };
};

const rejectUnauthenticated = (res) =>
  res.status(401).json({ error: "Access denied, please log in again" });

// Primary auth middleware for admin-only routes.
const authMiddleware = (req, res, next) => {
  const token = bearerToken(req);
  if (!token) return rejectUnauthenticated(res);

  try {
    const decoded = verifyAdminToken(token);
    if (!decoded) return rejectUnauthenticated(res);
    attachAdmin(req, decoded);
    next();
  } catch {
    // 401 (not 403) so the frontend clears the stale token and redirects to login.
    return rejectUnauthenticated(res);
  }
};

export default authMiddleware;

// Kept as an alias for routes that import `protect`.
export const protect = authMiddleware;

/**
 * optionalAuth — for read-only public endpoints (GET /students, /teachers…).
 *
 * - Valid admin token → same as authMiddleware (branch_admin locked to own branch)
 * - No token, or a stale/invalid one → public visitor; req.branchId comes from
 *   ?branch_id (null = all branches). A visitor whose browser still holds an
 *   expired admin cookie must still be able to browse the public site.
 */
export const optionalAuth = (req, res, next) => {
  const token = bearerToken(req);
  if (token) {
    try {
      const decoded = verifyAdminToken(token);
      if (decoded) {
        attachAdmin(req, decoded);
        return next();
      }
    } catch {
      // fall through to public access
    }
  }

  req.role = "public";
  req.branchId = queryBranchId(req);
  next();
};

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
