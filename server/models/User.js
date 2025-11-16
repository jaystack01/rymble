import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
      match: [
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, or underscores",
      ],
    },

    displayName: {
      type: String,
      required: false,
      trim: true,
      minlength: 1,
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
      minlength: 8,
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
          // allow empty object
          if (!obj || typeof obj !== "object") return false;
          return Object.values(obj).every((v) =>
            v ? mongoose.isValidObjectId(v) : true
          );
        },
        message: "All lastChannelIds values must be valid ObjectIds",
      },
    },

    avatar: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

// Trim and normalize values before save
userSchema.pre("save", function (next) {
  if (this.isModified("username") && typeof this.username === "string") {
    this.username = this.username.trim().toLowerCase();
  }
  if (this.isModified("email") && typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }
  if (this.isModified("displayName") && typeof this.displayName === "string") {
    this.displayName = this.displayName.trim();
  }
  next();
});

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
