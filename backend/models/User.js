const mongoose = require("mongoose");

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, select: false }, // never returned unless asked for
    provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
    providerId: { type: String },
    role: {
      type: String,
      enum: ["Super Admin", "Project Manager", "Developer", "Tester", "Viewer"],
      default: "Developer",
    },
    avatar: { type: String, default: "" },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
    //SOCIAL LOGIN: uncomment later
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    resetPasswordToken: {type: String, default: null, select: false},
  resetPasswordExpires: {type: Date,default: null, select: false},

  },
  { timestamps: true }
);

userSchema.methods.isLocked = function () {
  return !!this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.registerFailedAttempt = async function () {
  const lockExpired = this.lockUntil && this.lockUntil <= Date.now();
  const attempts = (lockExpired ? 0 : this.failedLoginAttempts) + 1;
  await this.constructor.updateOne(
    { _id: this._id },
    {
      failedLoginAttempts: attempts,
      lockUntil: attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_TIME) : null,
    }
  );
};

userSchema.methods.resetAttempts = async function () {
  if (!this.failedLoginAttempts && !this.lockUntil) return;
  await this.constructor.updateOne(
    { _id: this._id },
    { failedLoginAttempts: 0, lockUntil: null }
  );
};

module.exports = mongoose.model("User", userSchema);