const router = require("express").Router();
const { body } = require("express-validator");
const passport = require("../config/passport");
const { register, socialCallback } = require("../controllers/authController");
const { registerLimiter } = require("../middleware/rateLimiters");   // NEW

router.post(
  "/register",
  registerLimiter,                                                    // NEW: runs before the validators
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  register
);

// Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/signup?error=google` }),
  socialCallback
);

// Facebook
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"], session: false }));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: `${process.env.CLIENT_URL}/signup?error=facebook` }),
  socialCallback
);

module.exports = router;