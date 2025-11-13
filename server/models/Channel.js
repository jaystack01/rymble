import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Workspace",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique per workspace
channelSchema.index({ name: 1, workspaceId: 1 }, { unique: true });

// Remove old indexes on dev rebuilds
channelSchema.pre("save", function (next) {
  this.model("Channel")
    .ensureIndexes()
    .catch(() => {});
  next();
});

const Channel =
  mongoose.models.Channel || mongoose.model("Channel", channelSchema);
export default Channel;
