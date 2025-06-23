import express from "express";
import { getAllUserController } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getAllUserController);

export default router;
