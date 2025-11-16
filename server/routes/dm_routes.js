import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/dms - get all users except the current logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const users = await User.find({ _id: { $ne: currentUserId } }).select(
      "_id username"
    ); // only return id and username

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
