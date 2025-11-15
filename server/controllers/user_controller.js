import User from "../models/User.js";

export const update_me = async (req, res) => {
  try {
    const allowed = [
      "username",
      "avatar",
      "status",
      "lastWorkspaceId",
      "lastChannelIds", // add new field
    ];

    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Ensure lastChannelIds is an object before saving
    if (updates.lastChannelIds && typeof updates.lastChannelIds !== "object") {
      return res.status(400).json({ message: "Invalid lastChannelIds format" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

