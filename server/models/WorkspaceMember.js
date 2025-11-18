import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate membership
workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

const WorkspaceMember =
  mongoose.models.WorkspaceMember ||
  mongoose.model("workspace_members", workspaceMemberSchema);

export default WorkspaceMember;
