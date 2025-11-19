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
