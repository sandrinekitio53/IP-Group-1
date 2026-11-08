const crypto = require("crypto");

// A few very common passwords, checked instantly without any network call
const COMMON = ["password", "12345678", "123456789", "qwertyuiop", "iloveyou", "admin123", "password1", "welcome1"];

async function isBreachedPassword(password) {
  if (COMMON.includes(password.toLowerCase())) return true;

  // 1. Fingerprint the password (SHA-1), uppercase hex
  const hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = hash.slice(0, 5);     // the only part we send out
  const suffix = hash.slice(5);        // stays on our server

  // 2. Never wait more than 3 seconds for the outside service
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },   // adds fake entries so observers learn nothing
      signal: controller.signal,
    });
    if (!res.ok) return false;              // service problem: fail open
    const text = await res.text();

    // 3. Each line looks like "SUFFIX:COUNT". Compare locally.
    return text.split("\n").some((line) => {
      const [lineSuffix, count] = line.trim().split(":");
      return lineSuffix === suffix && Number(count) > 0;   // count 0 = padding
    });
  } catch {
    return false;                            // unreachable or timed out: fail open
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { isBreachedPassword };