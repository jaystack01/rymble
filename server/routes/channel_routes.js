import express from "express";
import Channel from "../models/Channel.js";

const router = express.Router();

// GET /api/channels
router.get("/", async (req, res) => {
  try {
    const channels = await Channel.find();
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
