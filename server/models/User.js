const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
    providerId: { type: String },
    role: {
      type: String,
      enum: ["Super Admin", "Project Manager", "Developer", "Tester", "Viewer"],
      default: "Developer",
    },
    avatar: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verifyTokenHash: { type: String, select: false },
    verifyTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);