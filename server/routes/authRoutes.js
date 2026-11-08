const router = require("express").Router();
const { body } = require("express-validator");
const passport = require("../config/passport");
const { register, socialCallback } = require("../controllers/authController");
const { registerLimiter } = require("../middleware/rateLimiters");
const { isBreachedPassword } = require("../utils/passwordCheck");

router.post(
  "/register",
  registerLimiter,
  [
    body("name")
      .isString().withMessage("Name must be text").bail()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .isString().withMessage("Email must be text").bail()
      .trim()
      .isEmail().withMessage("Enter a valid email").bail()
      .isLength({ max: 254 }).withMessage("Email is too long")
      .normalizeEmail(),
        body("password")
      .isString().withMessage("Password must be text").bail()
      .isLength({ min: 8, max: 72 }).withMessage("Password must be between 8 and 72 characters").bail()
      .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter").bail()
      .matches(/\d/).withMessage("Password must contain at least one number").bail()
      .custom(async (value) => {
        if (await isBreachedPassword(value)) {
          throw new Error("This password appears in known data breaches. Please choose a different one.");
        }
        return true;
      }),
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