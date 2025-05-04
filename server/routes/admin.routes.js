import express from "express";
import {
  createAdminController,
  loginAdminController,
  handleLogout,
  updateAdminController,
  updateEmailPassword,
  deleteAdminController,
} from '../controllers/admin.controller.js';

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create a new admin
router.post("/createAdmin", createAdminController);
//login admin
router.post("/login", loginAdminController);
//logout admin
router.post("/logout", handleLogout);
// Update admin
router.put("/update/:id", authMiddleware, updateAdminController);
//delete admin
router.delete("/delete/:id", authMiddleware, deleteAdminController);
//updateEmallpassword 
router.put("/updateEmailPassword", authMiddleware, updateEmailPassword);


export default router;
