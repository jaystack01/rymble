import express from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceMembers,
  rename_workspace,
  remove_member,
  transfer_ownership,
  leave_workspace,
  delete_workspace,
} from "../controllers/workspace_controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create new workspace
router.post("/", protect, createWorkspace);

// Get all workspaces for current user
router.get("/", protect, getWorkspaces);

// Get members of a workspace
router.get("/:id/members", protect, getWorkspaceMembers);

// Workspace Settings APIs

// Rename workspace
router.patch("/:id", protect, rename_workspace);

// Remove member from workspace
router.delete("/:id/members/:memberId", protect, remove_member);

// Transfer ownership
router.post("/:id/transfer-ownership", protect, transfer_ownership);

// Leave workspace
router.post("/:id/leave", protect, leave_workspace);

// Delete workspace
router.delete("/:id", protect, delete_workspace);
  
export default router;
