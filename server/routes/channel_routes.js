import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  toggleArchive,
} from "../controllers/channel_controller.js";

const router = express.Router();

// GET all channels in a workspace
router.get("/:workspaceId", protect, getChannels);

// CREATE channel
router.post("/", protect, createChannel);

// UPDATE channel settings (name, description)
router.patch("/:id", protect, updateChannel);

// DELETE channel
router.delete("/:id", protect, deleteChannel);

// ARCHIVE / UNARCHIVE
router.patch("/:id/archive", protect, toggleArchive);

export default router;
