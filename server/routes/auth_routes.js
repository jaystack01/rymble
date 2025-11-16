import express from "express";
import {
  register_user,
  login_user,
  get_me,
  update_me,
} from "../controllers/auth_controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register_user);
router.post("/login", login_user);
router.get("/me", protect, get_me);
router.patch("/me", protect, update_me);

export default router;
