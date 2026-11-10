const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const crypto = require("crypto");
const passport = require("../config/passport");
const {
  register,
  login,
  session,
  refresh,
  logout,
  logoutAll,
  changePassword,
  socialCallback,
  forgotPassword,
  resetPassword,
  listSessions,
  revokeSession,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const tooMany = { message: "Too many attempts. Please try again later." };

// Per IP: failed logins only
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});

// Per target email, so many IPs can't hammer one account
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: false,
  legacyHeaders: false,
  message: tooMany,
  skip: (req) => typeof req.body?.email !== "string",
  keyGenerator: (req) => `email:${req.body.email.trim().toLowerCase()}`,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});
const enabled = {
  google: !!process.env.GOOGLE_CLIENT_ID,
  facebook: !!process.env.FACEBOOK_APP_ID,
};
const fail = `${process.env.CLIENT_URL}/login?error=oauth_failed`;

// Sends the user to the provider, with a random "state" saved in a cookie
const oauthStart = (provider, scope) => (req, res, next) => {
  if (!enabled[provider]) return res.status(404).json({ message: "Provider not configured." });
  const state = crypto.randomBytes(24).toString("hex");
  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });
  passport.authenticate(provider, { scope, state, session: false })(req, res, next);
};

// Rejects the callback unless the returned state matches the cookie
const oauthCallback = (provider) => [
  (req, res, next) => {
    const ok =
      enabled[provider] &&
      req.cookies.oauth_state &&
      req.cookies.oauth_state === req.query.state;
    return ok ? next() : res.redirect(fail);
  },
  passport.authenticate(provider, { session: false, failureRedirect: fail }),
  socialCallback,
];

// bcrypt reads only 72 BYTES, and emoji or accented letters use several bytes each
const maxBytes72 = (v) => Buffer.byteLength(v, "utf8") <= 72;

const emailRule = () =>
  body("email")
    .isString().withMessage("Enter a valid email").bail()
    .trim()
    .isEmail().withMessage("Enter a valid email")
    .isLength({ max: 254 }).withMessage("Enter a valid email")
    .customSanitizer((v) => v.toLowerCase());

const newPasswordRule = (field) =>
  body(field).isString().withMessage("Password is required").bail()
    .isLength({ min: 8, max: 72 }).withMessage("Password must be 8 to 72 characters")
    .custom(maxBytes72).withMessage("Password is too long")
    .matches(/[a-z]/).withMessage("Password needs a lowercase letter")
    .matches(/[A-Z]/).withMessage("Password needs an uppercase letter")
    .matches(/\d/).withMessage("Password needs a number");

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3, // Max 3 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany,
});
router.post(
  "/register",
  registerLimiter,
  [
    body("name").isString().withMessage("Name is required").bail()
      .trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2 to 50 characters"),
    emailRule(),
    newPasswordRule("password"),
  ],
  register
);

router.post(
  "/login",
  loginLimiter,
  emailLimiter,
  [
    emailRule(),
    body("password").isString().isLength({ min: 1, max: 72 }).custom(maxBytes72),
  ],
  login
);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  [emailRule()],
  forgotPassword
);

router.post(
  "/reset-password/:token",
  passwordLimiter,
  [newPasswordRule("password")],
  resetPassword
);

router.get("/session", session);
router.get("/sessions", protect, listSessions);
router.delete("/sessions/:sid", protect, revokeSession);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAll);
router.post(
  "/change-password",
  protect,
  passwordLimiter,
  [
    body("currentPassword").isString().isLength({ min: 1, max: 72 }),
    newPasswordRule("newPassword"),
  ],
  changePassword
);
router.get("/google", oauthStart("google", ["profile", "email"]));
router.get("/google/callback", ...oauthCallback("google"));
// 
// router.get("/facebook", oauthStart("facebook", ["email"]));
// router.get("/facebook/callback", ...oauthCallback("facebook"));
// 
module.exports = router;