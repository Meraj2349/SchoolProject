import express from "express";
import authMiddleware, { authorize } from "../middlewares/auth.middleware.js";
import { adminController } from "../src/modules/admins/index.js";

// Managing admin accounts — super admins only.
const router = express.Router();

router.use(authMiddleware, authorize("super_admin"));

router.get("/", adminController.list);
router.post("/", adminController.create);
router.put("/:id", adminController.update);
router.delete("/:id", adminController.remove);

export default router;
