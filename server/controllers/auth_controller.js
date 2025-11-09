import User from "../models/user_model.js";
import jwt from "jsonwebtoken";

// helper to create token
const create_token = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
export const register_user = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already in use" });

  const user = await User.create({ username, email, password });

  res.status(201).json({
    _id: user.id,
    username: user.username,
    email: user.email,
    token: create_token(user.id),
  });
};

// POST /api/auth/login
export const login_user = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      token: create_token(user.id),
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// GET /api/auth/me
export const get_me = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -__v -updatedAt"
  );
  res.json(user);
};
