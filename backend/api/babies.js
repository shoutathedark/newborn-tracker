import connectDB from "../config/db.js";
import Baby from "../models/baby.js";
import auth from "../middleware/auth.js";
import { validationResult, body, param } from "express-validator";

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

  const user = await auth(req, res);
  if (!user) return;

  const bodyData = await parseJSONBody(req);
  if (bodyData === null) return res.status(400).json({ message: "Invalid JSON" });

  // --- CREATE BABY (POST /api/babies) ---
  if (req.method === "POST") {
    const valid = validateRequest(req, res, [
      body("name").notEmpty().withMessage("Baby name is required"),
      body("dob").isISO8601().withMessage("Valid date of birth required"),
      body("gender").isIn(["male", "female", "other"]).withMessage("Invalid gender"),
    ]);
    if (!valid) return;

    try {
      const baby = new Baby({
        name: req.body.name,
        dob: req.body.dob,
        gender: req.body.gender,
        caregiverIds: [user.id],
      });

      await baby.save();
      res.status(201).json(baby);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    // --- FETCH ALL BABIES (GET /api/babies) ---
  } else if (req.method === "GET" && !req.query.babyId) {
    try {
      const babies = await Baby.find(
        { caregiverIds: user.id },
        "id name dob gender"
      );
      res.json(babies);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    // --- FETCH SPECIFIC BABY (GET /api/babies?babyId=123) ---
  } else if (req.method === "GET" && req.query.babyId) {
    const valid = validateRequest(req, res, [param("babyId").isMongoId()]);
    if (!valid) return;

    const { babyId } = req.query;
    try {
      const baby = await Baby.findById(babyId);
      if (!baby) return res.status(404).json({ message: "Baby not found" });

      if (!baby.caregiverIds.includes(user.id))
        return res.status(403).json({ message: "Access denied" });

      res.json(baby);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    // --- UNSUPPORTED METHOD ---
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

/*const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Baby = require("../models/baby");
const auth = require("../middleware/auth");

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// Create baby (logged-in caregiver becomes linked)
router.post(
  "/",
  auth,
  [
    body("name").notEmpty().withMessage("Baby name is required"),
    body("dob").isISO8601().withMessage("Valid date of birth required"),
    body("gender").isIn(["male", "female", "other"]).withMessage("Invalid gender")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const baby = new Baby({
        name: req.body.name,
        dob: req.body.dob,
        gender: req.body.gender,
        caregiverIds: [req.user.id] // link logged-in caregiver as parent
      });

      await baby.save();
      res.status(201).json(baby);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Fetch all babies for logged-in caregiver (only return id, names, date of birth and gender)
router.get("/", auth, async (req, res) => {
  try {
    const babies = await Baby.find(
      { caregiverIds: req.user.id },
      "id name dob gender"
    );
    res.json(babies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch specific baby by ID, logged in user must be a caregiver
router.get("/:babyId/", auth,[param("babyId").isMongoId()],handleValidationErrors, async(req,res)=>{
      try {
        const baby = await Baby.findById(req.params.babyId);
        if (!baby) return res.status(404).json({ message: "Baby not found" });
  
        // Only caregivers of this baby can fetch this baby info
        if (!baby.caregiverIds.includes(req.user.id))
          return res.status(403).json({ message: "Access denied" });
  
        res.json(baby);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
})

module.exports = router; */