const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log('Inside /register route');
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      user = new User({ name, email, password });
      await user.save();
      res.status(201).json({ message: "User registered" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const accessToken = jwt.sign(
        { id: user._id, email, role: user.role, rooms: user.rooms },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: user._id, email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      const isProd = process.env.NODE_ENV === "production";

      res.cookie("token", accessToken, { httpOnly: true, secure: isProd, sameSite: isProd ? "strict" : "lax" });
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: isProd, sameSite: isProd ? "strict" : "lax" });

      res.json({ message: "Logged in" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Refresh token
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id, email: decoded.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.cookie("token", accessToken, { httpOnly: true, secure: true, sameSite: "strict" });
    res.json({ message: "Token refreshed" });
  } catch {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

module.exports = router;
