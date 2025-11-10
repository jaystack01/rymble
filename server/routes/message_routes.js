import express from "express";
import Message from "../models/Message.js";
import { protect } from "../middleware/auth_middleware.js";

const router = express.Router();

// GET messages for a room
router.get("/:roomId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate("sender", "username") // populate sender details
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
