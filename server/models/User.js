import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, or underscores",
      ],
    },

    displayName: {
      type: String,
      required: false,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    lastWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    lastChannelIds: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      validate: {
        validator: function (obj) {
          return Object.values(obj).every((v) => mongoose.isValidObjectId(v));
        },
        message: "All lastChannelIds values must be valid ObjectIds",
      },
    },
  },
  { timestamps: true }
);

// Hash before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
