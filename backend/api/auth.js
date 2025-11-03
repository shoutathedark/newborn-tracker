import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult, body } from "express-validator";
import Caregiver from "../models/caregiver.js";
import connectDB from "../config/db.js";
import cookie from "cookie";

const isProd = process.env.NODE_ENV === "production";

// helper: send cookies manually (since no res.cookie in serverless)
function setCookies(res, cookies) {
  const serialized = cookies.map((c) => cookie.serialize(c.name, c.value, c.options));
  res.setHeader("Set-Cookie", serialized);
}

function validateRequest(req, res, validations) {
  for (const v of validations) {
    try {
      v.run(req);
    } catch (err) {
      return res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ errors: result.array() });
    return false;
  }
  return true;
}

async function parseJSONBody(req) {
  if (req.method === "POST" || req.method === "PUT") {
    try {
      return await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => (data += chunk));
        req.on("end", () => {
          if (!data) return resolve({});
          resolve(JSON.parse(data));
        });
        req.on("error", err => reject(err));
      });
    } catch {
      return null;
    }
  }
  return {};
}

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;
  const bodyData = await parseJSONBody(req);
  if (bodyData === null) return res.status(400).json({ message: "Invalid JSON" });

  //
  // --- REGISTER ---
  //
  if (method === "POST" && req.query.action === "register") {
    const valid = validateRequest(req, res, [
      body("name").notEmpty(),
      body("username").notEmpty(),
      body("password").isLength({ min: 6 }),
      body("role").optional().isIn(["parent", "grandparent", "nanny", "other"]),
    ]);
    if (!valid) return;

    const { name, username, password, role } = req.body;

    try {
      let caregiver = await Caregiver.findOne({ username });
      if (caregiver)
        return res.status(400).json({ message: "Username already taken" });

      caregiver = new Caregiver({
        name,
        username,
        role: role || "parent",
        password,
      });

      await caregiver.save();
      res.status(201).json({
        message: "Caregiver registered",
        name,
        role: role || "parent",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    //
    // --- LOGIN ---
    //
  } else if (method === "POST" && req.query.action === "login") {
    const valid = validateRequest(req, res, [
      body("username").notEmpty(),
      body("password").exists(),
    ]);
    if (!valid) return;

    const { username, password } = req.body;
    try {
      const caregiver = await Caregiver.findOne({ username });
      if (!caregiver)
        return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, caregiver.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

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

      setCookies(res, [
        {
          name: "token",
          value: accessToken,
          options: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000,
            path: "/",
          },
        },
        {
          name: "refreshToken",
          value: refreshToken,
          options: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
          },
        },
      ]);

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

    //
    // --- REFRESH TOKEN ---
    //
  } else if (method === "POST" && req.query.action === "refresh") {
    const cookies = cookie.parse(req.headers.cookie || "");
    const refreshToken = cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token" });

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const caregiver = await Caregiver.findById(decoded.id).select("-password");
      if (!caregiver)
        return res.status(404).json({ message: "User not found" });

      const accessToken = jwt.sign(
        { id: caregiver._id, username: caregiver.username, role: caregiver.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      setCookies(res, [
        {
          name: "token",
          value: accessToken,
          options: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000,
            path: "/",
          },
        },
      ]);

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

    //
    // --- INVALID METHOD OR ACTION ---
    //
  } else {
    res.status(405).json({ message: "Method or action not allowed" });
  }
}

/*const express = require("express");
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

module.exports = router;*/