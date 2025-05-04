// filepath: /home/meraj/Dev/SchoolProject/server/models/admin.model.js
import db from "../config/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Find an admin by email
export const findAdminByEmail = async (email) => {
  const sql = "SELECT * FROM Admins WHERE Email = ?";
  const [rows] = await db.query(sql, [email]);
  return rows[0]; // Return the admin row
};

// Create a new admin
export const createAdmin = async (adminData) => {
  const { Username, Email, Password } = adminData;
  const hashedPassword = await bcrypt.hash(Password, 10); // Encrypt password
  console.log(hashedPassword);
  const sql = "INSERT INTO Admins (Username, Email, Password) VALUES (?, ?, ?)";
  try {
    const [result] = await db.query(sql, [Username, Email, hashedPassword]);
    return { message: "Admin created successfully", adminID: result.insertId };
  } catch (err) {
    throw new Error("Error creating admin: " + err.message);
  }
};

// Authenticate admin
export const authenticateAdmin = async (email, password) => {
  const admin = await findAdminByEmail(email);
  if (!admin) {
    throw new Error("Admin not found");
  }

  const isMatch = await bcrypt.compare(password, admin.Password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return admin; // Return the admin object if credentials are valid
};

// Generate JWT token
export const generateAuthToken = (adminID) => {
  const payload = { adminID };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token; // Return the JWT token
};



// Delete admin
export const deleteAdmin = async (adminID) => {
  const sql = "DELETE FROM Admins WHERE AdminID = ?";
  try {
    const [result] = await db.query(sql, [adminID]);
    return { message: "Admin deleted successfully", affectedRows: result.affectedRows };
  } catch (err) {
    throw new Error("Error deleting admin: " + err.message);
  }
};


export const getAdminById = async (adminId) => {
  const sql = "SELECT * FROM Admins WHERE AdminID = ?";
  const [rows] = await db.query(sql, [adminId]);
  return rows[0];
};

export const updateAdmin = async (adminId, adminData) => {
  const { Email, Password } = adminData;
  const sql = "UPDATE Admins SET Email = ?, Password = ? WHERE AdminID = ?";
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