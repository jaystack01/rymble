import express from "express";
import { searchUsers } from "../controllers/user_controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Search users (must be logged in)
router.get("/search", protect, searchUsers);

export default router;
