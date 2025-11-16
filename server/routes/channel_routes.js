import express from "express";
import Channel from "../models/Channel.js";
import Workspace from "../models/Workspace.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/channels/:workspaceId
router.get("/:workspaceId", protect, async (req, res) => {
  try {
    const { workspaceId } = req.params;

    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }

    const channels = await Channel.find({ workspaceId }).select("-__v -updatedAt");
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get channel by workspace + channel name
router.get(
  "/by-name/:workspaceName/:channelName",
  protect,
  async (req, res) => {
    try {
      const { workspaceName, channelName } = req.params;

      // Find workspace first
      const workspace = await Workspace.findOne({ name: workspaceName });
      if (!workspace)
        return res.status(404).json({ message: "Workspace not found" });

      // Find channel inside that workspace
      const channel = await Channel.findOne({
        name: channelName,
        workspaceId: workspace._id,
      });

      if (!channel)
        return res.status(404).json({ message: "Channel not found" });

      res.json(channel);
    } catch (err) {
      console.error("Error fetching channel by name:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


router.post("/", protect, async (req, res) => {
  try {
    const { name, workspaceId } = req.body;

    if (!name || !workspaceId) {
      return res
        .status(400)
        .json({ error: "Name and workspaceId are required" });
    }

    // Check for existing channel with the same name in the workspace
    const existingChannel = await Channel.findOne({ name, workspaceId });
    if (existingChannel) {
      return res
        .status(400)
        .json({ error: "Channel with this name already exists in the workspace" });
    }

    const newChannel = new Channel({
      name,
      workspaceId,
    });

    const savedChannel = await newChannel.save();
    res.status(201).json(savedChannel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
