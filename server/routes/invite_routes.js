import { Router } from "express";
import {
  sendInvite,
  getReceivedInvites,
  getSentInvites,
  acceptInvite,
  declineInvite,
} from "../controllers/invite_controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Create invite
router.post("/send", protect, sendInvite);

// Invites receiver can see
router.get("/received", protect, getReceivedInvites);

// Sender can see invites they sent
router.get("/sent", protect, getSentInvites);

// Accept invite
router.post("/:inviteId/accept", protect, acceptInvite);

// Decline invite
router.post("/:inviteId/decline", protect, declineInvite);

export default router;
