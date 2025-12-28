// controllers/demoController.js
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Channel from "../models/Channel.js";

const DEMO_WORKSPACE_NAME = "Demo Workspace";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const createDemoSession = async (req, res) => {
  try {
    console.log("Creating demo session...");
    const suffix = crypto.randomBytes(4).toString("hex");
    console.log("Creating demo user with suffix:", suffix);

    const demoUser = await User.create({
      username: `demo_${suffix}`,
      displayName: "Demo User",
      email: `demo_${suffix}@demo.local`,
      password: crypto.randomBytes(16).toString("hex"),
      avatar: null,
    });

    console.log("Demo user created:", demoUser.username);

    const workspace = await Workspace.create({
      name: `Demo Workspace ${suffix}`,
      avatar: null,
      owner: demoUser._id,
    });

    // Add the user as member
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: demoUser._id,
      role: "owner",
    });

    const channelsToSeed = [
      { name: "general", description: "General discussion" },
      { name: "random", description: "Off-topic chatter" },
    ];

    let generalChannel = null;

    for (const channel of channelsToSeed) {
      const created = await Channel.findOneAndUpdate(
        {
          name: channel.name,
          workspaceId: workspace._id,
        },
        {
          name: channel.name,
          workspaceId: workspace._id,
          description: channel.description,
        },
        { upsert: true, new: true }
      );

      if (channel.name === "general") {
        generalChannel = created;
      }
    }

    demoUser.lastWorkspaceId = workspace._id;
    demoUser.lastOpened.set(workspace._id.toString(), {
      type: "channel",
      id: generalChannel._id,
    });

    await demoUser.save();

    const token = generateToken(demoUser._id);

    return res.status(201).json({
      success: true,
      token,
      user: demoUser,
      workspaceId: workspace._id,
    });
  } catch (err) {
    console.error("Demo session error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create demo session",
    });
  }
};
