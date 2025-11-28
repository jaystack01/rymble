import Workspace from "../models/Workspace.js";
import Channel from "../models/Channel.js";
import WorkspaceMember from "../models/WorkspaceMember.js";

// ---------------------------
// CREATE WORKSPACE
// ---------------------------

export const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user._id;

  try {
    const workspace = await Workspace.create({ name });

    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: ownerId,
      role: "owner",
    });

    const defaultChannels = [
      { name: "general", workspaceId: workspace._id },
      { name: "random", workspaceId: workspace._id },
    ];

    const channels = await Channel.insertMany(defaultChannels);

    return res.status(201).json({ workspace, channels });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return res.status(500).json({
      message: "Error creating workspace",
      error: error.message,
    });
  }
};

// ---------------------------
// GET USER WORKSPACES
// ---------------------------

export const getWorkspaces = async (req, res) => {
  const userId = req.user._id;

  try {
    const memberships = await WorkspaceMember.find({ userId }).select(
      "workspaceId"
    );
    const workspaceIds = memberships.map((m) => m.workspaceId);

    if (workspaceIds.length === 0) return res.status(200).json([]);

    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } });
    const allMembers = await WorkspaceMember.find({
      workspaceId: { $in: workspaceIds },
    }).populate("userId", "username email status");
    const allChannels = await Channel.find({
      workspaceId: { $in: workspaceIds },
    });

    const membersByWS = {};
    const channelsByWS = {};

    for (const m of allMembers) {
      const wsId = m.workspaceId.toString();
      if (!membersByWS[wsId]) membersByWS[wsId] = [];
      membersByWS[wsId].push({
        _id: m.userId?._id,
        username: m.userId?.username,
        email: m.userId?.email,
        status: m.userId?.status,
        role: m.role,
        displayName: m.displayName,
      });
    }

    for (const c of allChannels) {
      const wsId = c.workspaceId.toString();
      if (!channelsByWS[wsId]) channelsByWS[wsId] = [];
      channelsByWS[wsId].push({
        _id: c._id,
        name: c.name,
      });
    }

    const result = workspaces.map((ws) => {
      const wsId = ws._id.toString();
      const members = membersByWS[wsId] || [];
      const owner = members.find((m) => m.role === "owner") || null;

      return {
        ...ws.toObject(),
        owner,
        members,
        channels: channelsByWS[wsId] || [],
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching workspaces:", err);
    res.status(500).json({
      message: "Error fetching workspaces",
      error: err.message,
    });
  }
};

// ---------------------------
// GET MEMBERS FOR ONE WORKSPACE
// ---------------------------

export const getWorkspaceMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const members = await WorkspaceMember.find({ workspaceId: id }).populate(
      "userId",
      "username email avatar status displayName"
    );

    return res.json({
      members: members.map((m) => ({
        _id: m.userId._id,
        username: m.userId.username,
        email: m.userId.email,
        status: m.userId.status,
        avatar: m.userId.avatar,
        displayName: m.userId.displayName,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch workspace members:", error);
    res.status(500).json({ message: "Error fetching members" });
  }
};

// ===================================================================
// WORKSPACE SETTINGS CONTROLLERS
// ===================================================================

// ---------------------------
// RENAME WORKSPACE
// ---------------------------

export const rename_workspace = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user._id;

  try {
    const membership = await WorkspaceMember.findOne({
      workspaceId: id,
      userId,
    });

    if (!membership || membership.role !== "owner") {
      return res
        .status(403)
        .json({ message: "Only the workspace owner can rename it" });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    res.json({ workspace });
  } catch (error) {
    console.error("Rename error:", error);
    res.status(500).json({ message: "Error renaming workspace" });
  }
};

// ---------------------------
// REMOVE MEMBER
// ---------------------------

export const remove_member = async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user._id;

  try {
    const actor = await WorkspaceMember.findOne({
      workspaceId: id,
      userId,
    });

    if (!actor) return res.status(403).json({ message: "Not a member" });

    if (actor.role !== "owner" && memberId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only owner can remove others" });
    }

    if (actor.role !== "owner" && memberId !== userId.toString()) {
      return res.status(403).json({ message: "Permission denied" });
    }

    await WorkspaceMember.findOneAndDelete({
      workspaceId: id,
      userId: memberId,
    });

    res.json({ message: "Member removed" });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Error removing member" });
  }
};

// ---------------------------
// TRANSFER OWNERSHIP
// ---------------------------

export const transfer_ownership = async (req, res) => {
  const { id } = req.params;
  const { newOwnerId } = req.body;
  const userId = req.user._id;

  try {
    const owner = await WorkspaceMember.findOne({
      workspaceId: id,
      userId,
      role: "owner",
    });

    if (!owner)
      return res
        .status(403)
        .json({ message: "Only the owner can transfer ownership" });

    const target = await WorkspaceMember.findOne({
      workspaceId: id,
      userId: newOwnerId,
    });

    if (!target)
      return res.status(400).json({ message: "New owner must be a member" });

    owner.role = "member";
    target.role = "owner";

    await owner.save();
    await target.save();

    res.json({ message: "Ownership transferred" });
  } catch (error) {
    console.error("Transfer ownership error:", error);
    res.status(500).json({ message: "Error transferring ownership" });
  }
};

// ---------------------------
// LEAVE WORKSPACE
// ---------------------------

export const leave_workspace = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const membership = await WorkspaceMember.findOne({
      workspaceId: id,
      userId,
    });

    if (!membership)
      return res
        .status(400)
        .json({ message: "Not a member of this workspace" });

    if (membership.role === "owner") {
      return res.status(403).json({
        message: "Owner cannot leave. Transfer ownership first.",
      });
    }

    await WorkspaceMember.findOneAndDelete({
      workspaceId: id,
      userId,
    });

    res.json({ message: "You left the workspace" });
  } catch (error) {
    console.error("Leave error:", error);
    res.status(500).json({ message: "Error leaving workspace" });
  }
};

// ---------------------------
// DELETE WORKSPACE
// ---------------------------

export const delete_workspace = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const owner = await WorkspaceMember.findOne({
      workspaceId: id,
      userId,
      role: "owner",
    });

    if (!owner)
      return res
        .status(403)
        .json({ message: "Only the owner can delete workspace" });

    await Workspace.findByIdAndDelete(id);
    await Channel.deleteMany({ workspaceId: id });
    await WorkspaceMember.deleteMany({ workspaceId: id });

    res.json({ message: "Workspace deleted" });
  } catch (error) {
    console.error("Delete workspace error:", error);
    res.status(500).json({ message: "Error deleting workspace" });
  }
};
