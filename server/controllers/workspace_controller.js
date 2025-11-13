import Workspace from "../models/Workspace.js";
import Channel from "../models/Channel.js";

// Create a new workspace
export const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user._id;
  try {
    const newWorkspace = new Workspace({
      name,
      ownerId,
      members: [ownerId], 
    });

    await newWorkspace.save();

    // Create default channels for the workspace
    const defaultChannels = [
      { name: "general", workspaceId: newWorkspace._id },
      { name: "random", workspaceId: newWorkspace._id },
    ];

    await Channel.insertMany(defaultChannels);

    return res.status(201).json(newWorkspace);
  } catch (error) {
    return res.status(500).json({ message: "Error creating workspace", error });
  }
};

// Get all workspaces user is a member of (with members + channels)
export const getWorkspaces = async (req, res) => {
  const userId = req.user._id;

  try {
    // Fetch all workspaces user is part of, populate owner & members
    const workspaces = await Workspace.find({ members: userId })
      .select("-__v -updatedAt")
      .populate("ownerId", "username email")
      .populate("members", "username email status");

    // Fetch channels for each workspace (in parallel)
    const workspaceData = await Promise.all(
      workspaces.map(async (workspace) => {
        const channels = await Channel.find({ workspaceId: workspace._id })
          .select("-__v -updatedAt");

        return {
          ...workspace.toObject(),
          channels, // attach list of channels
        };
      })
    );

    return res.status(200).json(workspaceData);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return res
      .status(500)
      .json({ message: "Error fetching workspaces", error: error.message });
  }
};

