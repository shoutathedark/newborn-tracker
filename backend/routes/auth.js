const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Caregiver = require("../models/caregiver");
const router = express.Router();
const isProd = process.env.NODE_ENV === "production";

// Register
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("username").notEmpty(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["parent", "grandparent", "nanny", "other"])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, username, password, role } = req.body;

    try {
      let caregiver = await Caregiver.findOne({ username });
      if (caregiver) return res.status(400).json({ message: "Username already taken" });

      caregiver = new Caregiver({
        name,
        username,
        role: role || "parent",
        password
      });

      await caregiver.save();
      res.status(201).json({ message: "Caregiver registered", name: name, role: role});
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Login
router.post(
  "/login",
  [body("username").notEmpty(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    try {
      const caregiver = await Caregiver.findOne({ username });
      if (!caregiver) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, caregiver.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const accessToken = jwt.sign(
        { id: caregiver._id, username, role: caregiver.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: caregiver._id, username },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        maxAge: 15 * 60 * 1000});
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        maxAge: 24*60*60*1000 });

      // return user info (exclude password)
      res.json({
        message: "Logged in",
        user: {
          id: caregiver._id,
          username: caregiver.username,
          role: caregiver.role,
          name: caregiver.name,
        },
      });
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

    const caregiver = await Caregiver.findById(decoded.id).select("-password");
    if (!caregiver) return res.status(404).json({ message: "User not found" });

    const accessToken = jwt.sign(
      { id: caregiver._id, username: caregiver.username, role: caregiver.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 15 * 60 * 1000});

    res.json({
      user: {
        id: caregiver._id,
        username: caregiver.username,
        role: caregiver.role,
        name: caregiver.name,
      },
    });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
});

module.exports = router;