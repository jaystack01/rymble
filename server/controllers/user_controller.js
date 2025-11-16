import User from "../models/User.js";

export const update_me = async (req, res) => {
  try {
    const allowed = [
      "username",
      "avatar",
      "status",
      "lastWorkspaceId",
      "lastChannelIds", // special merge behavior
    ];

    const updates = {};

    // Normal fields except lastChannelIds
    for (const key of allowed) {
      if (key === "lastChannelIds") continue;
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Handle lastChannelIds merge
    if (req.body.lastChannelIds) {
      if (typeof req.body.lastChannelIds !== "object") {
        return res.status(400).json({
          field: "lastChannelIds",
          message: "Invalid lastChannelIds map",
        });
      }

      const user = await User.findById(req.user.id);

      // Convert Mongoose Map -> plain object
      const existing = user.lastChannelIds
        ? user.lastChannelIds
        : {};

      console.log("Existing lastChannelIds:", existing);
      console.log("New lastChannelIds:", req.body.lastChannelIds);

      // Merge new partial map
      const merged = {
        ...existing,
        ...req.body.lastChannelIds,
      };

      console.log("Merged lastChannelIds:", merged);

      updates.lastChannelIds = merged;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        lastWorkspaceId: updatedUser.lastWorkspaceId,
        lastChannelIds: updatedUser.lastChannelIds,
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
