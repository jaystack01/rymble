import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceMembers,
} from "../controllers/workspace_controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Private
router.post("/", protect, createWorkspace);
router.get("/", protect, getWorkspaces);
router.get("/:id/members", protect, getWorkspaceMembers);

export default router;
