import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { messagesController as messages } from "../src/modules/content/index.js";

// The chairman's messages, per branch or for the whole school.
const router = express.Router();

router.get("/", optionalAuth, messages.list);
router.post("/add", authMiddleware, messages.create);
router.put("/edit/:id", authMiddleware, messages.update);
router.put("/toggle-visibility/:id", authMiddleware, messages.setVisibility);
router.delete("/delete/:id", authMiddleware, messages.remove);

export default router;
