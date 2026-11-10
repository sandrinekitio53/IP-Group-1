const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    family: { type: String, required: true, index: true },       // one login = one family
    tokenHash: { type: String, required: true, unique: true },   // SHA-256 of the refresh token
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB deletes the record automatically once expiresAt has passed
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Session", sessionSchema);