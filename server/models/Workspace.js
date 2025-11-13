import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    avatar: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique per owner
workspaceSchema.index({ name: 1, ownerId: 1 }, { unique: true });

// Defensive index check
workspaceSchema.pre("save", function (next) {
  this.model("Workspace")
    .ensureIndexes()
    .catch(() => {});
  next();
});

const Workspace =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
export default Workspace;
