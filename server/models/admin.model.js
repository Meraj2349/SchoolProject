// filepath: /home/meraj/Dev/SchoolProject/server/models/admin.model.js
import db from "../config/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Find an admin by email + login context (role + branch)
// - isSuper=true  → look for super_admin row
// - isSuper=false → look for branch_admin row with matching branch_id
export const findAdminByEmail = async (email, isSuper = false, branchId = null) => {
  let sql, params;
  if (isSuper) {
    sql = "SELECT * FROM Admin WHERE Email = ? AND role = 'super_admin' LIMIT 1";
    params = [email];
  } else if (branchId != null) {
    sql = "SELECT * FROM Admin WHERE Email = ? AND role = 'branch_admin' AND branch_id = ? LIMIT 1";
    params = [email, branchId];
  } else {
    // Fallback — original behaviour (used by updateEmailPassword etc.)
    sql = "SELECT * FROM Admin WHERE Email = ? LIMIT 1";
    params = [email];
  }
  const [rows] = await db.query(sql, params);
  return rows[0] ?? null;
};

// Create a new admin
export const createAdmin = async (adminData) => {
  const { Username, Email, Password, role, branch_id } = adminData;
  const hashedPassword = await bcrypt.hash(Password, 10); // Encrypt password
  const adminRole = role || "branch_admin";
  const adminBranchId = branch_id ?? null;
  const sql =
    "INSERT INTO Admin (Username, Email, Password, role, branch_id) VALUES (?, ?, ?, ?, ?)";
  try {
    const [result] = await db.query(sql, [
      Username,
      Email,
      hashedPassword,
      adminRole,
      adminBranchId,
    ]);
    return { message: "Admin created successfully", adminID: result.insertId };
  } catch (err) {
    throw new Error("Error creating admin: " + err.message);
  }
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

// Delete admin
export const deleteAdmin = async (adminID) => {
  const sql = "DELETE FROM Admin WHERE AdminID = ?";
  try {
    const [result] = await db.query(sql, [adminID]);
    return {
      message: "Admin deleted successfully",
      affectedRows: result.affectedRows,
    };
  } catch (err) {
    throw new Error("Error deleting admin: " + err.message);
  }
};

export const getAdminById = async (adminId) => {
  const sql = "SELECT * FROM Admin WHERE AdminID = ?";
  const [rows] = await db.query(sql, [adminId]);
  return rows[0];
};

export const updateAdmin = async (adminId, adminData) => {
  const { Email, Password } = adminData;
  const sql = "UPDATE Admin SET Email = ?, Password = ? WHERE AdminID = ?";
  try {
    const [result] = await db.query(sql, [Email, Password, adminId]);
    if (result.affectedRows === 0) {
      throw new Error("No admin found with that ID");
    }
    return { success: true };
  } catch (err) {
    console.error("Error updating admin:", err);
    throw err;
  }
};
