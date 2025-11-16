import express from "express";
import { createWorkspace, getWorkspaces } from "../controllers/workspace_controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Private
router.post("/", protect, createWorkspace);
router.get("/", protect, getWorkspaces);

export default router;
