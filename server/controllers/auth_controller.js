import User from "../models/User.js";
import jwt from "jsonwebtoken";

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendUserResponse = (user, res) => {
  res.json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      lastWorkspaceId: user.lastWorkspaceId,
      lastChannelIds: user.lastChannelIds,
    },
    token: createToken(user._id),
    expiresIn: 604800, // 7 days in seconds
  });
};

// POST /auth/register
export const register_user = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({
        field: "form",
        message: "All fields are required",
      });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({
        field: "email",
        message: "Email already in use",
      });

    const user = await User.create({ username, email, password });

    sendUserResponse(user, res);
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /auth/login
export const login_user = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        field: "form",
        message: "All fields are required",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        field: "email",
        message: "Email not found",
      });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(401).json({
        field: "password",
        message: "Incorrect password",
      });

    sendUserResponse(user, res);
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/me
export const get_me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    sendUserResponse(user, res);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
