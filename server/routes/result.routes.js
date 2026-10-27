import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { requireWriteBranch } from "../src/shared/http/requireWriteBranch.js";
import { resultController as results } from "../src/modules/results/index.js";

const router = express.Router();

// Public: students look up their results without signing in. optionalAuth
// scopes the search to an admin's branch, or to the ?branch_id a visitor picked.
router.get("/search", optionalAuth, results.search);

router.use(authMiddleware);

// Marks are entered for the branch the admin works in (a super admin picks one).
router.post("/", requireWriteBranch, results.create);
router.put("/:id", results.update);
router.delete("/:id", results.remove);

export default router;
