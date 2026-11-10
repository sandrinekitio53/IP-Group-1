const bcrypt = require("bcryptjs");
const { validationResult, matchedData } = require("express-validator");
const User = require("../models/User");
const { issueTokens } = require("../utils/tokens");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const { name, email, password } = matchedData(req);

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    issueTokens(req, res, user);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.socialCallback = async (req, res) => {
  try {
    await issueTokens(req, res, req.user);
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.CLIENT_URL}/signup?error=google`);
  }
};