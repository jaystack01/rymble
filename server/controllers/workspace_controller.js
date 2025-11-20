import Workspace from "../models/Workspace.js";
import Channel from "../models/Channel.js";
import WorkspaceMember from "../models/WorkspaceMember.js";

// Create a new workspace
export const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user._id;

  try {
    // 1. Create workspace
    const workspace = await Workspace.create({
      name,
    });

    // 2. Insert creator as OWNER in WorkspaceMembers
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: ownerId,
      role: "owner",
    });

    // 3. Create default channels
    const defaultChannels = [
      { name: "general", workspaceId: workspace._id },
      { name: "random", workspaceId: workspace._id },
    ];

    const channels = await Channel.insertMany(defaultChannels);

    // 4. Structured response
    return res.status(201).json({
      workspace,
      channels,
    });

  } catch (error) {
    console.error("Error creating workspace:", error);
    return res
      .status(500)
      .json({ message: "Error creating workspace", error: error.message });
  }
};

// Get all workspaces user is a member of (with members + channels)
export const getWorkspaces = async (req, res) => {
  const userId = req.user._id;

  try {
    // 1. Find all workspace memberships for this user
    const memberships = await WorkspaceMember.find({ userId }).select(
      "workspaceId"
    );
    const workspaceIds = memberships.map((m) => m.workspaceId);

    if (workspaceIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Fetch all workspaces
    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } });

    // 3. Fetch ALL members for ALL workspaces
    const allMembers = await WorkspaceMember.find({
      workspaceId: { $in: workspaceIds },
    }).populate("userId", "username email status");

    // 4. Fetch ALL channels for ALL workspaces
    const allChannels = await Channel.find({
      workspaceId: { $in: workspaceIds },
    });

    // 5. Group members + channels by workspace
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

    // 6. Build final workspace response
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

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching workspaces:", err);
    res.status(500).json({
      message: "Error fetching workspaces",
      error: err.message,
    });
  }
};

export const getWorkspaceMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const members = await WorkspaceMember.find({ workspaceId: id }).populate(
      "userId",
      "username email avatar status displayName"
    );
    console.log("Fetched members:", members);
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
