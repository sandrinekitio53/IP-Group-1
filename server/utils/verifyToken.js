const crypto = require("crypto");

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function createVerifyToken() {
  const raw = crypto.randomBytes(32).toString("hex");      // goes in the email
  const hash = hashToken(raw);                              // goes in the database
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { raw, hash, expires };
}

module.exports = { createVerifyToken, hashToken };