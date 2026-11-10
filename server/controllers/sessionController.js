const bcrypt = require("bcryptjs");
const { validationResult, matchedData } = require("express-validator");
const User = require("../models/User");
const { issueTokens, rotateSession, revokeByToken, clearAuthCookies } = require("../utils/tokens");

// Used so a wrong email takes as long to reject as a wrong password
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Enter a valid email and password." });

  try {
    const { email, password } = matchedData(req);
    const user = await User.findOne({ email });
    const ok = await bcrypt.compare(password, (user && user.passwordHash) || DUMMY_HASH);

    if (!user || !user.passwordHash || !ok) {
      console.warn(`[security] failed login for ${email} from ${req.ip}`);
      return res.status(401).json({ message: "Invalid email or password." }); // same message either way
    }

    await issueTokens(req, res, user);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const result = await rotateSession(req, res);
    if (!result.ok) {
      console.warn(`[security] refresh rejected: ${result.reason} (ip ${req.ip})`); // the reason stays in our log only
      clearAuthCookies(res);
      return res.status(401).json({ message: "Session ended. Please sign in again." });
    }
    res.json({ user: publicUser(result.user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.cookies.refreshToken) await revokeByToken(req.cookies.refreshToken);
  } catch (err) {
    console.error(err);
  }
  clearAuthCookies(res);
  res.json({ message: "Signed out." });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.auth.id);
  if (!user) return res.status(401).json({ message: "Session ended. Please sign in again." });
  res.json({ user: publicUser(user), accessTokenExpiresAt: new Date(req.auth.exp * 1000).toISOString() });
};