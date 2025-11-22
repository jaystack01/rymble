import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { z } from "zod";

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  displayName: user.displayName || null,
  email: user.email,
  avatar: user.avatar || null,
  lastWorkspaceId: user.lastWorkspaceId || null,
  lastOpened: user.lastOpened || null,
});

const sendUserResponse = (user, res) => {
  const token = createToken(user._id);

  // set httpOnly cookie
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const secure = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: maxAge * 1000, // ms
    path: "/",
  });

  res.json({
    success: true,
    user: formatUser(user),
    token,
    expiresIn: maxAge,
  });
};

// Zod schemas
const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Invalid username"),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Invalid username")
    .optional(),
});

// ------------------------
// POST /auth/register
// ------------------------
export const register_user = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      const path = first.path?.[0] || "form";
      return res
        .status(400)
        .json({ success: false, field: path, message: first.message });
    }

    const { username, email, password } = parsed.data;

    // normalize
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicates
    const [emailExists, usernameExists] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username: normalizedUsername }),
    ]);

    if (emailExists) {
      return res
        .status(409)
        .json({
          success: false,
          field: "email",
          message: "Email already in use",
        });
    }
    if (usernameExists) {
      return res
        .status(409)
        .json({
          success: false,
          field: "username",
          message: "Username already taken",
        });
    }

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });

    sendUserResponse(user, res);
  } catch (err) {
    console.error("Register error:", err);

    // Mongo duplicate key
    if (err.code === 11000) {
      const conflictField = Object.keys(err.keyPattern || {})[0] || "form";
      return res
        .status(409)
        .json({
          success: false,
          field: conflictField,
          message: `${conflictField} already in use`,
        });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------
// POST /auth/login
// ------------------------
export const login_user = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      const path = first.path?.[0] || "form";
      return res
        .status(400)
        .json({ success: false, field: path, message: first.message });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, field: "email", message: "Email not found" });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res
        .status(401)
        .json({
          success: false,
          field: "password",
          message: "Incorrect password",
        });
    }

    sendUserResponse(user, res);
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------
// GET /auth/me
// ------------------------
export const get_me = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, field: "auth", message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, field: "user", message: "User not found" });
    }

    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------------
// PATCH /auth/me
// ------------------------
export const update_me = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, field: "auth", message: "Not authenticated" });
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      const path = first.path?.[0] || "form";
      return res
        .status(400)
        .json({ success: false, field: path, message: first.message });
    }

    const { username, displayName } = parsed.data;

    const updates = {};
    if (typeof displayName === "string")
      updates.displayName = displayName.trim();
    if (typeof username === "string")
      updates.username = username.trim().toLowerCase();

    // if username changing, ensure uniqueness
    if (updates.username) {
      const existing = await User.findOne({ username: updates.username });
      if (existing && existing._id.toString() !== req.user.id) {
        return res
          .status(409)
          .json({
            success: false,
            field: "username",
            message: "Username already taken",
          });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, field: "user", message: "User not found" });
    }

    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    console.error("Update me error:", err);

    if (err.code === 11000) {
      const conflictField = Object.keys(err.keyPattern || {})[0] || "form";
      return res
        .status(409)
        .json({
          success: false,
          field: conflictField,
          message: `${conflictField} already in use`,
        });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};
