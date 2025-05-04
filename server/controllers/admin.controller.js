// filepath: /home/meraj/Dev/SchoolProject/server/controllers/admin.controller.js
import bcrypt from "bcryptjs";
import {
  createAdmin,
  authenticateAdmin,
  generateAuthToken,
  updateAdmin,
  deleteAdmin,
  getAdminById,
} from "../models/admin.model.js";

// Create a new admin
const createAdminController = async (req, res) => {
  const { Username, Email, Password } = req.body;
  if (!Username || !Email || !Password) {
    return res
      .status(400)
      .json({ error: "Username, Email, and Password are required" });
  }

  try {
    const result = await createAdmin(req.body);
    res.status(201).json(result); // Send 201 status code for successful creation
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login admin
const loginAdminController = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const admin = await authenticateAdmin(Email, Password);
    const token = generateAuthToken(admin.AdminID);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Update admin
const updateAdminController = async (req, res) => {
  try {
    const result = await updateAdmin(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete admin
const deleteAdminController = async (req, res) => {
  try {
    const result = await deleteAdmin(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleLogout = async (req, res) => {
  try {
    // Clear the authentication token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
    });

    // Optionally, invalidate the token on the server side (if implemented)
    // const token = req.headers.authorization?.split(" ")[1];
    // if (token) {
    //   blacklist.add(token); // Add the token to your blacklist
    // }

    res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Failed to log out" });
  }
};

const updateEmailPassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const adminId = req.adminId;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters." });
  }

  try {
    // Verify the current password
    const admin = await getAdminById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found." });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.Password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    // Update email and password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateAdmin(adminId, {
      Email: email,
      Password: hashedPassword,
    });

    res.status(200).json({
      message: "Email and password updated successfully.",
      email: email,
    });
  } catch (error) {
    console.error("Error updating email/password:", error);
    res.status(500).json({ error: "Failed to update email/password." });
  }
};

export {
  createAdminController,
  loginAdminController,
  updateAdminController,
  deleteAdminController,
  updateEmailPassword,
  handleLogout,
};
