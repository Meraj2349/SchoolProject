import bcrypt from "bcryptjs";
import { t } from "../config/i18n.js";
import {
  authenticateAdmin,
  generateAuthToken,
  updateAdmin,
  getAdminById,
} from "../models/admin.model.js";

// Login admin
const loginAdminController = async (req, res) => {
  const lang = req.language;
  try {
    const { Email, Password, branch_id: rawBranchId } = req.body;

    // Determine intent from what the frontend sent:
    // null / undefined / "super" → super_admin login
    // numeric string / number   → branch_admin login for that branch
    const isSuper = rawBranchId == null || rawBranchId === "" || rawBranchId === "super";
    const branchId = isSuper ? null : parseInt(rawBranchId, 10);

    // findAdminByEmail now queries the exact row (super_admin OR branch_admin+branch_id)
    // so a wrong branch or wrong role simply returns "Admin not found"
    const admin = await authenticateAdmin(Email, Password, isSuper, branchId);

    const token = generateAuthToken(admin.AdminID, admin.role, admin.branch_id);

    // Resolve the branch display name
    let branchName = null;
    if (admin.branch_id != null) {
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
  loginAdminController,
  updateEmailPassword,
  handleLogout,
};
