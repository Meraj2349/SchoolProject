import bcrypt from "bcryptjs";
import { t } from "../config/i18n.js";
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
  const lang = req.language;
  const { Username, Email, Password, role, branch_id } = req.body;
  if (!Username || !Email || !Password) {
    return res
      .status(400)
      .json({ error: t("username_email_password_required", lang) });
  }

  // branch_admin must have a branch_id
  if (role === "branch_admin" && !branch_id) {
    return res
      .status(400)
      .json({ error: "branch_id is required for branch_admin role" });
  }

  try {
    const result = await createAdmin({ Username, Email, Password, role, branch_id });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login admin
const loginAdminController = async (req, res) => {
  const lang = req.language;
  try {
    const { Email, Password } = req.body;
    const admin = await authenticateAdmin(Email, Password);
    const token = generateAuthToken(admin.AdminID, admin.role, admin.branch_id);

    // For branch_admin, also resolve the branch display name
    let branchName = null;
    if (admin.role === "branch_admin" && admin.branch_id != null) {
      try {
        const { getBranchById } = await import("../models/branch.model.js");
        const branch = await getBranchById(admin.branch_id);
        branchName = branch?.name_en || branch?.name_bn || `Branch ${admin.branch_id}`;
      } catch {
        branchName = `Branch ${admin.branch_id}`;
      }
    }

    res.json({
      token,
      message: t("login_success", lang),
      role: admin.role,
      branch_id: admin.branch_id,
      branchName,
    });
  } catch (error) {
    res.status(401).json({ error: t("invalid_credentials", lang) });
  }
};

// Update admin
const updateAdminController = async (req, res) => {
  const lang = req.language;
  try {
    const result = await updateAdmin(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t("internal_server_error", lang) });
  }
};

// Delete admin
const deleteAdminController = async (req, res) => {
  const lang = req.language;
  try {
    const result = await deleteAdmin(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: t("internal_server_error", lang) });
  }
};

const handleLogout = async (req, res) => {
  const lang = req.language;
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: t("logout_success", lang) });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: t("logout_failed", lang) });
  }
};

const updateEmailPassword = async (req, res) => {
  const lang = req.language;
  const { email, currentPassword, newPassword } = req.body;
  const adminId = req.adminId;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: t("all_fields_required", lang) });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: t("password_too_short", lang) });
  }

  try {
    const admin = await getAdminById(adminId);
    if (!admin) {
      return res.status(404).json({ error: t("admin_not_found", lang) });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.Password,
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: t("current_password_incorrect", lang) });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateAdmin(adminId, {
      Email: email,
      Password: hashedPassword,
    });

    res.status(200).json({
      message: t("email_password_updated", lang),
      email: email,
    });
  } catch (error) {
    console.error("Error updating email/password:", error);
    res.status(500).json({ error: t("email_password_update_failed", lang) });
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
