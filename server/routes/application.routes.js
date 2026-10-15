import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { applicationController as applications } from "../src/modules/applications/index.js";

const router = express.Router();

// Public: families apply to one branch (campus).
router.post("/", applications.submit);

// Admins: a branch admin handles their branch's applications, the super admin all.
router.get("/", authMiddleware, applications.list);
router.get("/:id", authMiddleware, applications.get);
router.put("/:id/status", authMiddleware, applications.setStatus);
router.delete("/:id", authMiddleware, applications.remove);

export default router;
