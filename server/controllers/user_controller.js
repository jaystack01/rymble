import User from "../models/User.js";

export const update_me = async (req, res) => {
  try {
    const allowed = [
      "username",
      "avatar",
      "status",
      "lastWorkspaceId",
      "lastChannelIds",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.lastChannelIds && typeof updates.lastChannelIds !== "object") {
      return res.status(400).json({
        field: "lastChannelIds",
        message: "Invalid channel map",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        lastWorkspaceId: user.lastWorkspaceId,
        lastChannelIds: user.lastChannelIds,
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
