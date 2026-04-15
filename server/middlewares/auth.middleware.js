import jwt from "jsonwebtoken";

// Primary auth middleware — sets req.adminId, req.role, req.branchId
// req.branchId is null for super_admin (sees all data) and a number for branch_admin
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.adminId = decoded.adminID;
    req.role = decoded.role || "branch_admin";

    if (req.role === "super_admin") {
      // super_admin: respect ?branch_id=X query param for scoped reads,
      // otherwise null = no filter (see all branches)
      const qb = req.query?.branch_id;
      req.branchId = qb != null && qb !== "" ? parseInt(qb, 10) : null;
    } else {
      // branch_admin: always locked to their own branch from JWT
      req.branchId = decoded.branch_id ?? null;
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export default authMiddleware;

// protect — same as authMiddleware but also populates req.user for authorize()
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.adminId = decoded.adminID;
    req.role = decoded.role || "branch_admin";

    if (req.role === "super_admin") {
      const qb = req.query?.branch_id;
      req.branchId = qb != null && qb !== "" ? parseInt(qb, 10) : null;
    } else {
      req.branchId = decoded.branch_id ?? null;
    }

    req.user = { id: decoded.adminID, role: req.role };
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Role-based authorization middleware — use after protect or authMiddleware
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
