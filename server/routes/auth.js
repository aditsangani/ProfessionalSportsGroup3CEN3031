const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const { makeToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async function (req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email and password are all needed" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "password must be at least 8 characters" });
  }

  const taken = await User.findOne({ email: email.toLowerCase() });
  if (taken) {
    return res.status(400).json({ message: "that email already has an account" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash });

  res.status(201).json({
    token: makeToken(user._id),
    user: { id: user._id, username: user.username, email: user.email },
  });
});

// POST /api/auth/login
router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user) {
    return res.status(400).json({ message: "wrong email or password" });
  }

  const matches = await bcrypt.compare(password || "", user.passwordHash);
  if (!matches) {
    return res.status(400).json({ message: "wrong email or password" });
  }

  res.json({
    token: makeToken(user._id),
    user: { id: user._id, username: user.username, email: user.email },
  });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async function (req, res) {
  const email = (req.body.email || "").toLowerCase().trim();
  const user = await User.findOne({ email: email });

  const reply = { message: "if that email has an account, a reset link was sent" };

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const link = "http://localhost:5173/reset-password?token=" + token;
    console.log("Password reset link:", link);
    if (process.env.NODE_ENV !== "production") {
      reply.devResetLink = link;
    }
  }

  res.json(reply);
});

// POST /api/auth/reset-password
router.post("/reset-password", async function (req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "token and new password are needed" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "password must be at least 8 characters" });
  }

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) {
    return res.status(400).json({ message: "this reset link is not valid or has expired" });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.json({ message: "password updated, you can log in now" });
});

module.exports = router;
