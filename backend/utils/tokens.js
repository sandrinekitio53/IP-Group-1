const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Session = require("../models/Session");
const RefreshToken = require("../models/RefreshToken");

const ACCESS_MS = 15 * 60 * 1000;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_PATH = "/api/auth";
const parseNumber = (value, fallback) => {
  const cleaned = String(value ?? '').replace(/[^0-9.-]/g, '');
  if (!cleaned) return fallback;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const SESSION_IDLE_MS = () => (parseNumber(process.env.SESSION_IDLE_MINUTES, 15) * 60 * 1000);
const MAX_SESSIONS = () => Math.max(1, Math.floor(parseNumber(process.env.MAX_SESSIONS, 3)));

const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
exports.sha256 = sha256;

const baseCookie = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

const endSession = async (sid) => {
  if (!sid) return false;
  await Session.deleteMany({ sid });
  await RefreshToken.deleteMany({ family: sid });
  return true;
};
exports.endSession = endSession;

const touchSession = async (sid, userId, { bump = true } = {}) => {
  if (!sid) return false;

  const session = await Session.findOne({ sid, user: userId }).select("_id lastActiveAt");
  if (!session) return false;

  const now = Date.now();
  const lastActive = new Date(session.lastActiveAt).getTime();

  if (now - lastActive > SESSION_IDLE_MS()) {
    await endSession(sid);
    return false;
  }

  if (bump) {
    const elapsed = now - lastActive;
    if (elapsed >= 5000) {
      await Session.updateOne(
        { _id: session._id },
        { $set: { lastActiveAt: new Date(now), expiresAt: new Date(now + SESSION_IDLE_MS()) } }
      );
    }
  }

  return true;
};
exports.touchSession = touchSession;

const issueAccessToken = (res, user, sid) => {
  const token = jwt.sign(
    { id: user._id, tv: user.tokenVersion ?? 0, sid },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: "15m" }
  );
  res.cookie("accessToken", token, { ...baseCookie(), maxAge: ACCESS_MS });
};

const issueRefreshToken = async (res, user, family) => {
  const jti = crypto.randomBytes(32).toString("hex");
  const token = jwt.sign(
    { id: user._id, tv: user.tokenVersion ?? 0, fam: family, jti },
    process.env.JWT_REFRESH_SECRET,
    { algorithm: "HS256", expiresIn: "7d" }
  );

  await RefreshToken.create({
    user: user._id,
    family,
    tokenHash: sha256(jti),
    expiresAt: new Date(Date.now() + REFRESH_MS),
  });

  res.cookie("refreshToken", token, { ...baseCookie(), path: REFRESH_PATH, maxAge: REFRESH_MS });
};

const enforceMaxSessions = async (userId) => {
  const limit = MAX_SESSIONS();
  const sessions = await Session.find({ user: userId }).sort({ lastActiveAt: -1, createdAt: -1 }).select("sid");

  if (sessions.length <= limit) return;

  for (const oldSession of sessions.slice(limit)) {
    await endSession(oldSession.sid);
  }
};

exports.issueAccessToken = issueAccessToken;
exports.issueRefreshToken = issueRefreshToken;

exports.issueTokens = async (req, res, user) => {
  const sid = crypto.randomBytes(16).toString("hex");

  await Session.create({
    user: user._id,
    sid,
    userAgent: req.get("User-Agent") || "",
    ip: req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
    lastActiveAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_IDLE_MS()),
  });

  await enforceMaxSessions(user._id);

  issueAccessToken(res, user, sid);
  await issueRefreshToken(res, user, sid);
};

exports.clearTokens = (res) => {
  res.clearCookie("accessToken", baseCookie());
  res.clearCookie("refreshToken", { ...baseCookie(), path: REFRESH_PATH });
};

exports.revokeAllSessions = async (userId) => {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
  await Session.deleteMany({ user: userId });
  await RefreshToken.deleteMany({ user: userId });
};