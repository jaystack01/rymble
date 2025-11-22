import express from "express";
import { searchUsers, updateContext } from "../controllers/user_controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Search users (must be logged in)
router.get("/search", protect, searchUsers);

// Update last opened context (channel/member) for user in a workspace
router.patch("/context", protect, updateContext);
export default router;
