import express from "express";
import {
  createAdminController,
  loginAdminController,
  handleLogout,
  updateAdminController,
  updateEmailPassword,
  deleteAdminController,
} from "../controllers/admin.controller.js";

import authMiddleware, { authorize } from "../middlewares/auth.middleware.js";
import { countAdmins } from "../models/admin.model.js";

const router = express.Router();

const superAdminOnly = [authMiddleware, authorize("super_admin")];

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
  authMiddleware(req, res, () => authorize("super_admin")(req, res, next));
};

// Create a new admin
router.post("/createAdmin", firstAdminOrSuperAdmin, createAdminController);
//login admin
router.post("/login", loginAdminController);
//logout admin
router.post("/logout", handleLogout);
// Update admin
router.put("/update/:id", ...superAdminOnly, updateAdminController);
//delete admin
router.delete("/delete/:id", ...superAdminOnly, deleteAdminController);
//updateEmallpassword
router.put("/updateEmailPassword", authMiddleware, updateEmailPassword);

export default router;
