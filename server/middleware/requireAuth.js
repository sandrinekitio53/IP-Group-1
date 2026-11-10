const jwt = require("jsonwebtoken");

// Put this in front of any route that needs a logged-in user
module.exports = function requireAuth(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Not signed in, or the access token expired. Call /refresh.", code: "NO_TOKEN" });
  }
  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    res.status(401).json({
      message: expired ? "Access token expired. Call /refresh." : "Invalid token.",
      code: expired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
    });
  }
};