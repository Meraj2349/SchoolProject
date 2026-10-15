import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { newsController as news } from "../src/modules/content/index.js";

// News, per branch or for the whole school.
const router = express.Router();

router.get("/", optionalAuth, news.listVisible); // the website: active news only
router.get("/all", authMiddleware, news.list);
router.post("/", authMiddleware, news.create);
router.put("/:id", authMiddleware, news.update);
router.delete("/:id", authMiddleware, news.remove);

export default router;
