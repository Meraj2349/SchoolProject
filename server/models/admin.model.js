// filepath: /home/meraj/Dev/SchoolProject/server/models/admin.model.js
import db from "../src/shared/db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Find an admin by email + login context (role + branch)
// - isSuper=true  → look for super_admin row
// - isSuper=false → look for branch_admin row with matching branch_id
export const findAdminByEmail = async (email, isSuper = false, branchId = null) => {
  let sql, params;
  if (isSuper) {
    sql = `SELECT * FROM "Admin" WHERE "Email" = ? AND role = 'super_admin' LIMIT 1`;
    params = [email];
  } else if (branchId != null) {
    sql = `SELECT * FROM "Admin" WHERE "Email" = ? AND role = 'branch_admin' AND branch_id = ? LIMIT 1`;
    params = [email, branchId];
  } else {
    // Fallback — original behaviour (used by updateEmailPassword etc.)
    sql = `SELECT * FROM "Admin" WHERE "Email" = ? LIMIT 1`;
    params = [email];
  }
  const { rows } = await db.query(sql, params);
  return rows[0] ?? null;
};

// Authenticate admin — isSuper and branchId guide which row to look up
export const authenticateAdmin = async (email, password, isSuper = false, branchId = null) => {
  const admin = await findAdminByEmail(email, isSuper, branchId);
  if (!admin) {
    throw new Error("Admin not found");
  }

  const isMatch = await bcrypt.compare(password, admin.Password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return admin;
};

// Generate JWT token (includes role and branch_id for RBAC + branch scoping)
export const generateAuthToken = (adminID, role, branch_id) => {
  const payload = {
    adminID,
    role: role || "branch_admin",
    branch_id: branch_id ?? null,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token; // Return the JWT token
};

export const getAdminById = async (adminId) => {
  const sql = `SELECT * FROM "Admin" WHERE "AdminID" = ?`;
  const { rows } = await db.query(sql, [adminId]);
  return rows[0];
};

// Updates only the fields provided. Password must already be hashed.
export const updateAdmin = async (adminId, adminData) => {
  const updates = [];
  const params = [];
  for (const field of ["Email", "Password"]) {
    if (adminData[field] !== undefined && adminData[field] !== "") {
      updates.push(`${field} = ?`);
      params.push(adminData[field]);
    }
  }
  if (updates.length === 0) throw new Error("No fields to update");

  const result = await db.query(
    `UPDATE "Admin" SET ${updates.join(", ")} WHERE "AdminID" = ?`,
    [...params, adminId],
  );
  if (result.rowCount === 0) {
    throw new Error("No admin found with that ID");
  }
  return { success: true };
};

export const countAdmins = async () => {
  const row = await db.one(`SELECT COUNT(*) AS total FROM "Admin"`);
  return Number(row.total);
};
