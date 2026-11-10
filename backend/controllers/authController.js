const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Session = require("../models/Session");
const RefreshToken = require("../models/RefreshToken");
const {
  issueTokens,
  issueAccessToken,
  issueRefreshToken,
  clearTokens,
  revokeAllSessions,
  sha256,
  endSession,
  touchSession,
} = require("../utils/tokens");

const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

// Two refreshes fired at the same moment (two tabs) should not be mistaken for theft
const REUSE_GRACE_MS = 10 * 1000;

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const notAuth = (res) => res.status(401).json({ message: "Not authenticated" });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, email, password } = req.body;

    if (await User.exists({ email })) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    await issueTokens(req, res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !user.passwordHash) {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isLocked()) {
      return res.status(429).json({ message: "Too many failed attempts. Try again in 15 minutes." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await user.registerFailedAttempt();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await user.resetAttempts();
    await issueTokens(req, res, user);
    return res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.session = async (req, res) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.json({ success: false, user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const user = await User.findById(decoded.id).select("_id name email role tokenVersion");
    if (!user || (user.tokenVersion ?? 0) !== (decoded.tv ?? 0)) {
      return res.json({ success: false, user: null });
    }
    const validSession = await touchSession(decoded.sid, user._id);
    if (!validSession) {
      return res.json({ success: false, user: null });
    }
    return res.json({ success: true, user: publicUser(user) });
  } catch {
    return res.json({ success: false, user: null });
  }
};

exports.refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return notAuth(res);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
    if (!decoded.jti || !decoded.fam) throw new Error("Old token format");

    const validSession = await touchSession(decoded.fam, decoded.id, { bump: false });
    if (!validSession) {
      clearTokens(res);
      return notAuth(res);
    }

    const tokenHash = sha256(decoded.jti);

    // Atomically claim the token: only one request can win this
    const claimed = await RefreshToken.findOneAndUpdate(
      { tokenHash, usedAt: null },
      { usedAt: new Date() }
    );

    if (!claimed) {
      const existing = await RefreshToken.findOne({ tokenHash }).select("usedAt");

      // Used a moment ago: a parallel request, not theft
      if (existing?.usedAt && Date.now() - existing.usedAt.getTime() < REUSE_GRACE_MS) {
        return notAuth(res);
      }

      // Used long ago, or unknown: treat as theft and kill the whole family
      await endSession(decoded.fam);
      clearTokens(res);
      return notAuth(res);
    }

    const user = await User.findById(decoded.id).select("_id tokenVersion");
    if (!user || (user.tokenVersion ?? 0) !== (decoded.tv ?? 0)) {
      await endSession(decoded.fam);
      clearTokens(res);
      return notAuth(res);
    }

    issueAccessToken(res, user, decoded.fam);
    await issueRefreshToken(res, user, decoded.fam); // rotation: same family, new token
    return res.json({ success: true });
  } catch {
    clearTokens(res);
    return notAuth(res);
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
      if (decoded.fam) await endSession(decoded.fam);
    } catch {      /* invalid or expired: nothing to delete */ }
  }
  clearTokens(res);
  return res.json({ success: true, message: "Logged out" });
};

exports.logoutAll = async (req, res) => {
  try {
    await revokeAllSessions(req.user._id);
    clearTokens(res);
    return res.json({ success: true, message: "Logged out everywhere" });
  } catch (err) {
    console.error("Logout-all error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+passwordHash");

    if (!user?.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    await revokeAllSessions(user._id);
    const fresh = await User.findById(user._id).select("_id tokenVersion");
    await issueTokens(req, res, fresh);

    return res.json({ success: true, message: "Password changed" });
  } catch (err) {
    console.error("Change-password error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
// SOCIAL LOGIN: uncomment later
exports.socialCallback = async (req, res) => {
  try {
    res.clearCookie("oauth_state");
    await issueTokens(req, res, req.user); // must be awaited: it writes to the database
    res.redirect(`${process.env.CLIENT_URL}/`); // landing page; never put a token in the URL
  } catch (err) {
    console.error("Social callback error:", err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Find user by email using Mongoose
    const user = await User.findOne({ email });

    // SECURITY BEST PRACTICE: Return a generic message to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // 2. Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3. Hash the token before saving it to the database for security
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4. Set token expiration (10 minutes from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Milliseconds timestamp for MongoDB

    await user.save();

    // 5. Construct the reset URL for your frontend
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // For local development: Check your backend terminal for this link
    console.log(`[DEV] Password Reset URL: ${resetUrl}`);

    return res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Handle resetting the password using the token sent via email.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1. Hash the incoming token from params to match the database record
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Find user with valid token and check if expiration ($gt) is still in the future
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token." });
    }

    // 3. Update password
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password successfully reset. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.listSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ lastActiveAt: -1, createdAt: -1 })
      .select("sid userAgent ip lastActiveAt");

    const payload = sessions.map((session) => ({
      id: session.sid,
      device: session.userAgent || "Unknown device",
      ip: session.ip || "Unknown IP",
      lastActiveAt: session.lastActiveAt,
      current: session.sid === req.sid,
    }));

    return res.json({ success: true, sessions: payload });
  } catch (err) {
    console.error("List sessions error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.revokeSession = async (req, res) => {
  try {
    const session = await Session.findOne({ user: req.user._id, sid: req.params.sid }).select("sid");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    await endSession(session.sid);
    return res.json({ success: true, message: "Session revoked" });
  } catch (err) {
    console.error("Revoke session error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
// socialCallback is parked with the Google and Facebook routes.
// Add it back only when you uncomment those routes.