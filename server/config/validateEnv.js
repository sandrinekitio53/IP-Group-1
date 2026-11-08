const REQUIRED = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "CLIENT_URL"];

function validateEnv() {
  const problems = [];

  // 1. Every required variable must exist
  for (const name of REQUIRED) {
    if (!process.env[name]) problems.push(`${name} is missing`);
  }

  // 2. Secrets must be long enough and not placeholders
  for (const name of ["JWT_SECRET", "JWT_REFRESH_SECRET"]) {
    const value = process.env[name];
    if (!value) continue;
    if (value.length < 32) {
      problems.push(`${name} must be at least 32 characters (it has ${value.length})`);
    }
    if (/change_me|placeholder|example/i.test(value)) {
      problems.push(`${name} still looks like a placeholder`);
    }
  }

  // 3. The two secrets must differ
  if (process.env.JWT_SECRET && process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    problems.push("JWT_SECRET and JWT_REFRESH_SECRET must be different");
  }

  // 4. Any problem: explain and stop (the values themselves are never printed)
  if (problems.length > 0) {
    console.error("\nSecurity check failed. The server will not start:");
    problems.forEach((p) => console.error("  - " + p));
    console.error("\nFix your server/.env file and restart.\n");
    process.exit(1);
  }
}

module.exports = { validateEnv };