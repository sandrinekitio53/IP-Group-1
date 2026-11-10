const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Session = require("../models/Session");
const User = require("../models/User");

// Session policy, adjustable in .env
const ACCESS_SECONDS = Number(process.env.ACCESS_TOKEN_SECONDS) || 15 * 60;
const SESSION_SECONDS = (Number(process.env.SESSION_MAX_DAYS) || 7) * 24 * 60 * 60;

const baseCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const secondsLeft = (date) => Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000));

function signAccess(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: ACCESS_SECONDS });
}

function signRefresh(userId, family, expiresAt) {
  return jwt.sign(
    { id: userId, fam: family, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: secondsLeft(expiresAt) }
  );
}

// Creates a new refresh token, stores its hash, and sets both cookies
async function startToken(req, res, user, family, expiresAt) {
  const refreshToken = signRefresh(user._id, family, expiresAt);
  await Session.create({
    user: user._id,
    family,
    tokenHash: sha256(refreshToken),
    userAgent: req.get("user-agent") || "",
    ip: req.ip || "",
    expiresAt,
  });
  res.cookie("accessToken", signAccess(user), { ...baseCookie, maxAge: ACCESS_SECONDS * 1000 });
  res.cookie("refreshToken", refreshToken, {
    ...baseCookie,
    path: "/api/auth", // the browser sends this cookie only to the auth routes
    maxAge: secondsLeft(expiresAt) * 1000,
  });
}

// A fresh login: new family, new 7-day clock
exports.issueTokens = (req, res, user) =>
  startToken(req, res, user, crypto.randomUUID(), new Date(Date.now() + SESSION_SECONDS * 1000));

// Exchange the refresh token for a new pair (rotation) with theft checks
exports.rotateSession = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return { ok: false, reason: "missing-token" };

  try {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return { ok: false, reason: "invalid-or-expired-signature" };
  }

  const session = await Session.findOne({ tokenHash: sha256(token) });
  if (!session) return { ok: false, reason: "unknown-token" };

  if (session.revoked) {
    // An already-used token came back: someone copied it. Kill the whole session.
    await Session.updateMany({ family: session.family }, { revoked: true });
    return { ok: false, reason: "REUSE-DETECTED (token theft suspected)" };
  }

  if (session.expiresAt <= new Date()) return { ok: false, reason: "session-expired" };

  if (session.userAgent !== (req.get("user-agent") || "")) {
    await Session.updateMany({ family: session.family }, { revoked: true });
    return { ok: false, reason: "DEVICE-MISMATCH (different browser)" };
  }

  const user = await User.findById(session.user);
  if (!user) return { ok: false, reason: "user-missing" };

  session.revoked = true; // the old token can never be used again
  await session.save();
  await startToken(req, res, user, session.family, session.expiresAt); // same family, same absolute deadline
  return { ok: true, user };
};

exports.revokeByToken = async (token) => {
  const session = await Session.findOne({ tokenHash: sha256(token) });
  if (session) await Session.updateMany({ family: session.family }, { revoked: true });
};

exports.clearAuthCookies = (res) => {
  res.clearCookie("accessToken", baseCookie);
  res.clearCookie("refreshToken", { ...baseCookie, path: "/api/auth" });
};