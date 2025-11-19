import Invite from "../models/WorkspaceInvites.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import WorkspaceMember from "../models/WorkspaceMember.js";

// SEND INVITE
export const sendInvite = async (req, res) => {
  try {
    const { workspaceId, receiverId } = req.body;
    const senderId = req.user._id;

    if (!workspaceId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Missing workspaceId or receiverId" });
    }

    if (receiverId === senderId.toString()) {
      return res.status(400).json({ message: "You cannot invite yourself" });
    }

    // Validate workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver)
      return res.status(404).json({ message: "Receiver not found" });

    // Check if receiver already part of workspace
    const existingMember = await WorkspaceMember.findOne({
      workspaceId,
      userId: receiverId,
    });

    if (existingMember) {
      return res.status(400).json({ message: "User already in workspace" });
    }

    // Check if a pending invite already exists
    const existingInvite = await Invite.findOne({
      workspaceId,
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Pending invite already exists" });
    }

    // Create invite
    const invite = await Invite.create({
      workspaceId,
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    return res.status(201).json(invite);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// RECEIVED INVITES
export const getReceivedInvites = async (req, res) => {
  try {
    const invites = await Invite.find({
      receiver: req.user._id,
    })
      .populate("sender", "username avatar")
      .populate("workspaceId", "name icon");

    return res.json(invites);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// SENT INVITES
export const getSentInvites = async (req, res) => {
  try {
    const invites = await Invite.find({
      sender: req.user._id,
    })
      .populate("receiver", "username avatar")
      .populate("workspaceId", "name icon");

    return res.json(invites);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ACCEPT INVITE
export const acceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    if (invite.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Invite already handled" });
    }

    // Mark accepted
    invite.status = "accepted";
    await invite.save();

    // Add user to workspace as MEMBER
    await WorkspaceMember.create({
      workspaceId: invite.workspaceId,
      userId: invite.receiver,
      role: "member",
    });

    return res.json({ message: "Invite accepted and joined workspace" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DECLINE INVITE
export const declineInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    const invite = await Invite.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    if (invite.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Invite already handled" });
    }

    invite.status = "declined";
    await invite.save();

    return res.json({ message: "Invite declined" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
