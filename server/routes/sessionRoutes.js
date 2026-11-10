const express = require("express");
const { body } = require("express-validator");
const { loginLimiter } = require("../middleware/authLimiters");
const requireAuth = require("../middleware/requireAuth");
const session = require("../controllers/sessionController");

const router = express.Router();

router.post(
  "/login",
  loginLimiter,
  body("email").isString().trim().isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 72 }),
  session.login
);
router.post("/refresh", session.refresh);
router.post("/logout", session.logout);
router.get("/me", requireAuth, session.me);

module.exports = router;