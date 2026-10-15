import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { noticesController as notices } from "../src/modules/content/index.js";

// Notices belong to a branch or the whole school. Visitors see shown notices
// of the chosen branch (?branch_id) plus whole-school ones; admins also see
// hidden ones in their scope.
const router = express.Router();

router.get("/", optionalAuth, notices.list);
router.post("/add", authMiddleware, notices.create);
router.put("/edit/:id", authMiddleware, notices.update);
router.put("/show/:id", authMiddleware, notices.show);
router.put("/toggle-visibility/:id", authMiddleware, notices.setVisibility);
router.delete("/delete/:id", authMiddleware, notices.remove);

export default router;
