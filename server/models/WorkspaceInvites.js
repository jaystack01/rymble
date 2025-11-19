import mongoose from "mongoose";

const workspaceInviteSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate active invites
workspaceInviteSchema.index(
  { workspaceId: 1, toUserId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

const WorkspaceInvite =
  mongoose.models.WorkspaceInvite ||
  mongoose.model("workspace_invites", workspaceInviteSchema);

export default WorkspaceInvite;
