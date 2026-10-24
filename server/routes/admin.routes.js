import express from "express";
import {
  loginAdminController,
  handleLogout,
  updateEmailPassword,
} from "../controllers/admin.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import { countAdmins } from "../models/admin.model.js";
import { adminController } from "../src/modules/admins/index.js";

const router = express.Router();

// Anyone may register while no admin exists yet (first-time setup).
// After that only a logged-in super_admin can create admins.
const firstAdminOrSuperAdmin = async (req, res, next) => {
  try {
    if ((await countAdmins()) === 0) return next();
  } catch (error) {
    return res.status(500).json({ error: "Could not verify admin setup" });
  }
  if (!req.headers.authorization) {
    return res.status(401).json({
      error: "Only a super admin can create admin accounts. Please log in as super admin first.",
    });
  }
  authMiddleware(req, res, () => adminController.requireSuperAdmin(req, res, next));
};

// Account management lives in src/modules/admins at /api/admins; createAdmin
// stays here for the register page (first-time setup).
router.post("/createAdmin", firstAdminOrSuperAdmin, adminController.create);
//login admin
router.post("/login", loginAdminController);
//logout admin
router.post("/logout", handleLogout);
//updateEmallpassword
router.put("/updateEmailPassword", authMiddleware, updateEmailPassword);

export default router;
