import Channel from "../models/Channel.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";


// Helper: validate workspace & permissions
const validateWorkspaceAccess = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return { error: "Workspace not found" };

  const memberRecord = await WorkspaceMember.findOne({
    workspaceId,
    userId,
  });

  const role = memberRecord ? memberRecord.role : null;
  const isOwner = role === "owner";
  if (!memberRecord)
    return { error: "You are not a member of this workspace" };

  return { workspace, isOwner };
};

// ----------------------------------------------------
// GET CHANNELS
// ----------------------------------------------------
export const getChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const check = await validateWorkspaceAccess(workspaceId, req.user._id);
    if (check.error) return res.status(403).json({ error: check.error });

    const channels = await Channel.find({ workspaceId }).select(
      "-__v -updatedAt"
    );
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------
// CREATE CHANNEL (Owner only)
// ----------------------------------------------------
export const createChannel = async (req, res) => {
  try {
    const { name, workspaceId } = req.body;

    if (!name || !workspaceId)
      return res
        .status(400)
        .json({ error: "Name and workspaceId are required" });

    const check = await validateWorkspaceAccess(workspaceId, req.user._id);
    if (check.error) return res.status(403).json({ error: check.error });
    if (!check.isOwner)
      return res.status(403).json({ error: "Only owner can create channels" });

    const exists = await Channel.findOne({ name, workspaceId });
    if (exists)
      return res
        .status(400)
        .json({ error: "Channel name already exists in this workspace" });

    const channel = await Channel.create({ name, workspaceId });
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------
// UPDATE CHANNEL (rename, description) — Owner only
// ----------------------------------------------------
export const updateChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description,archived } = req.body;

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const check = await validateWorkspaceAccess(
      channel.workspaceId,
      req.user._id
    );
    if (check.error) return res.status(403).json({ error: check.error });
    if (!check.isOwner)
      return res.status(403).json({ error: "Only owner can update channels" });

    if (name) channel.name = name;
    if (description !== undefined) channel.description = description;
    if (archived !== undefined) channel.archived = archived;
    await channel.save();
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------
// DELETE CHANNEL — Owner only
// ----------------------------------------------------
export const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const check = await validateWorkspaceAccess(
      channel.workspaceId,
      req.user._id
    );
    if (check.error) return res.status(403).json({ error: check.error });
    if (!check.isOwner)
      return res.status(403).json({ error: "Only owner can delete channels" });

    await channel.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------------------------------
// ARCHIVE CHANNEL — Owner only
// ----------------------------------------------------
export const toggleArchive = async (req, res) => {
  try {
    const { id } = req.params;

    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const check = await validateWorkspaceAccess(
      channel.workspaceId,
      req.user._id
    );
    if (check.error) return res.status(403).json({ error: check.error });
    if (!check.isOwner)
      return res.status(403).json({ error: "Only owner can archive channels" });

    channel.archived = !channel.archived;
    await channel.save();

    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
