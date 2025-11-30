import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "workspaces",
    },

    description: { type: String, default: "" },

    archived: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique per workspace
channelSchema.index({ name: 1, workspaceId: 1 }, { unique: true });

const Channel =
  mongoose.models.Channel || mongoose.model("channels", channelSchema);

export default Channel;
