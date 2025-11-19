import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

// Unique workspace name per owner
workspaceSchema.index({ name: 1, ownerId: 1 }, { unique: true });

const Workspace =
  mongoose.models.Workspace || mongoose.model("workspaces", workspaceSchema);

export default Workspace;
