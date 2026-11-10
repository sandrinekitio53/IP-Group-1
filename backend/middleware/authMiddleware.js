const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { touchSession } = require("../utils/tokens");

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const user = await User.findById(decoded.id).select("_id name email role tokenVersion");

    if (!user || (user.tokenVersion ?? 0) !== (decoded.tv ?? 0)) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const validSession = await touchSession(decoded.sid, user._id);
    if (!validSession) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.user = user;
    req.sid = decoded.sid;
    next();
  } catch {
    res.status(401).json({ message: "Not authenticated" });
  }
};

exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: "Forbidden" });