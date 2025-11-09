import express from "express";
import {
  register_user,
  login_user,
  get_me,
} from "../controllers/auth_controller.js";
import { protect } from "../middleware/auth_middleware.js";

const router = express.Router();

// Public
router.post("/register", register_user);
router.post("/login", login_user);

// Private
router.get("/me", protect, get_me);

export default router;
