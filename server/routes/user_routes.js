import express from "express";
import { protect } from "../middleware/auth_middleware.js";
import { update_me } from "../controllers/user_controller.js";

const router = express.Router();

// Private - UPDATE USER FIELDS
router.patch("/me", protect, update_me);

export default router;
