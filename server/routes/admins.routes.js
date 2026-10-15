import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { adminController } from "../src/modules/admins/index.js";

// Managing admin accounts — super admins only, checked against the database.
const router = express.Router();

router.use(authMiddleware, adminController.requireSuperAdmin);

router.get("/", adminController.list);
router.post("/", adminController.create);
router.put("/:id", adminController.update);
router.delete("/:id", adminController.remove);

export default router;
