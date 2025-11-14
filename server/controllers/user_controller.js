import User from "../models/user_model.js";

export const update_me = async (req, res) => {
  try {
    const allowed = [
      "username",
      "avatar",
      "status",
      "lastWorkspaceId",
      "lastChannelId",
    ];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
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
