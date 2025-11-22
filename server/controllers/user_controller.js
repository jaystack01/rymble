import User from "../models/User.js";

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";

    if (!query) {
      return res.json([]);
    }

    const regex = new RegExp(query, "i");

    const users = await User.find(
      {
        $or: [
          { username: regex },
          { displayName: regex },
        ],
      },
      {
        password: 0,
        email: 0,
      }
    ).limit(15);

    return res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      message: "Error searching users",
      error: error.message,
    });
  }
};

export const updateContext = async (req, res) => {
  try {
    const userId = req.user._id;
    const { workspaceId, contextType, contextId } = req.body;

    if (!workspaceId || !contextType || !contextId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["channel", "member"].includes(contextType)) {
      return w.status(400).json({ message: "Invalid context type" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.lastOpened.set(workspaceId, { type: contextType, id: contextId });
    await user.save();

    return res.json({ message: "Last opened context updated successfully" });
  } catch (error) {
    console.error("Update last opened error:", error);
    return res.status(500).json({
      message: "Error updating last opened context",
      error: error.message,
    });
  }
}