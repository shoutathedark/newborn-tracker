import connectDB from "../config/db.js";
import Event from "../models/event.js";
import Baby from "../models/baby.js";
import auth from "../middleware/auth.js";
import Caregiver from "../models/caregiver.js";
import { validationResult, body, param } from "express-validator";
import { formatInTimeZone } from 'date-fns-tz';

function validateRequest(req, res, validations) {
  const errors = [];
  for (const v of validations) {
    try {
      v.run(req);
    } catch (err) {
      errors.push({ msg: err.message });
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

  const { babyId } = req.query; // Vercel sends params via query
  if (!babyId) return res.status(400).json({ message: "Missing babyId" });

  const bodyData = await parseJSONBody(req);
  if (bodyData === null) return res.status(400).json({ message: "Invalid JSON" });

  // POST: Add an event TO ADD BACKEND CONVERSION OF DATES HERE ASSUMING IT IS SENT IN LOCAL TIME
  if (req.method === "POST") {
    const valid = validateRequest(req, res, [
      param("babyId").isMongoId(),
      body("type").isIn(["feeding", "sleeping", "shower", "diaper"]),
      body("subtype")
        .optional()
        .isIn(["bottle", "breastfeeding_left", "breastfeeding_right", "breastfeeding_both"]),
      body("amount").optional().isNumeric(),
      body("diaper").optional().custom(value => {
        if (!value.type || !["pee", "poop", "mixed"].includes(value.type))
          throw new Error("Invalid diaper type");
        if (["poop", "mixed"].includes(value.type)) {
          if (!value.consistency || !["soft", "firm", "runny", "watery"].includes(value.consistency))
            throw new Error("Invalid diaper consistency");
        }
        return true;
      }),
      body("notes").optional().trim().escape().isLength({ max: 500 }),
      body("timestamp").optional().isISO8601(),
    ]);

    if (!valid) return;

    try {
      const baby = await Baby.findById(babyId);
      if (!baby) return res.status(404).json({ message: "Baby not found" });

      if (!baby.caregiverIds.includes(user.id))
        return res.status(403).json({ message: "Access denied" });
      const toUTCISOString = (localString) => {
          if (!localString) return null;
          return utcDate = formatInTimeZone(localString, "-8");
        };
      const event = new Event({
        babyId,
        caregiverId: user.id,
        type: req.body.type,
        subtype: req.body.subtype,
        amount: req.body.amount,
        sleep_start: toUTCISOString(req.body.sleep_start),
        sleep_end: toUTCISOString(req.body.sleep_end),
        diaper: req.body.diaper,
        notes: req.body.notes,
        timestamp: toUTCISOString(req.body.timestamp) || new Date(),
      });

      await event.save();

      const populatedEvent = await Event.findById(event._id).populate("caregiverId", "name");
      res.status(201).json(populatedEvent);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

    // GET: Fetch events
  } else if (req.method === "GET") {
    try {
      const baby = await Baby.findById(babyId);
      if (!baby) return res.status(404).json({ message: "Baby not found" });

      if (!baby.caregiverIds.includes(user.id))
        return res.status(403).json({ message: "Access denied" });

      const isFetchSummary = req.query.isFetchSummary === "true";
      const dateParam = req.query.date ? new Date(req.query.date) : new Date();

      if (isNaN(dateParam.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const start = new Date(dateParam.setHours(0, 0, 0, 0));
      const end = new Date(dateParam.setHours(23, 59, 59, 999));

      const query = { babyId, timestamp: { $gte: start, $lte: end } };
      const events = await Event.find(query)
        .populate("caregiverId", "name")
        .sort({ timestamp: -1 });

      if (isFetchSummary) {
        let feedings = 0;
        let sleepingHours = 0;
        let diapers = 0;

        events.forEach(e => {
          if (e.type === "feeding") feedings++;
          else if (e.type === "sleeping") {
            const start = new Date(e.sleep_start);
            const end = new Date(e.sleep_end);
            sleepingHours += (end - start) / (1000 * 60 * 60);
          } else if (e.type === "diaper") diapers++;
        });

        const summary = {
          feedings,
          sleepingHours: parseFloat(sleepingHours.toFixed(1)),
          diapers,
        };

        return res.json({ events, summary });
      }

      res.json(events);
    } catch (err) {
      res.status(500).json({ message: "Error fetching events" });
    }

  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

/*const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Event = require("../models/event");
const Baby = require("../models/baby");
const auth = require("../middleware/auth");

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// Add an event for a baby
router.post(
  "/:babyId/events",
  auth,
  [
    param("babyId").isMongoId(),
    body("type").isIn(["feeding", "sleeping", "shower", "diaper"]),
    body("subtype").optional().isIn(["bottle", "breastfeeding_left", "breastfeeding_right", "breastfeeding_both"]),
    body("amount").optional().isNumeric(),
    body("diaper").optional().custom(value => {
      if (!value.type || !["pee", "poop", "mixed"].includes(value.type)) throw new Error("Invalid diaper type");
      if (["poop", "mixed"].includes(value.type)) {if (!value.consistency || !["soft", "firm", "runny", "watery"].includes(value.consistency)) {throw new Error("Invalid diaper consistency");
    }
  }
      return true;
    }),
    body("notes").optional().trim().escape().isLength({ max: 500 }),
    body("timestamp").optional().isISO8601()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const baby = await Baby.findById(req.params.babyId);
      if (!baby) return res.status(404).json({ message: "Baby not found" });

      // Only caregivers of this baby can add events
      if (!baby.caregiverIds.includes(req.user.id))
        return res.status(403).json({ message: "Access denied" });

      const event = new Event({
        babyId: req.params.babyId,
        caregiverId: req.user.id,
        type: req.body.type,
        subtype: req.body.subtype,
        amount: req.body.amount,
        sleep_start: req.body.sleep_start,
        sleep_end: req.body.sleep_end,
        diaper: req.body.diaper,
        notes: req.body.notes,
        timestamp: req.body.timestamp || new Date()
      });

      await event.save();

      const populatedEvent = await Event.findById(event._id).populate("caregiverId", "name");
      res.status(201).json(populatedEvent);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get events for a baby
router.get(
  "/:babyId/events",
  auth,
  [param("babyId").isMongoId()],
  handleValidationErrors,
  async (req, res) => {
    try {
      const baby = await Baby.findById(req.params.babyId);
      if (!baby) return res.status(404).json({ message: "Baby not found" });

      // Only caregivers of this baby can fetch events
      if (!baby.caregiverIds.includes(req.user.id))
        return res.status(403).json({ message: "Access denied" });

      const isFetchSummary = req.query.isFetchSummary === "true";
      const dateParam = req.query.date ? new Date(req.query.date) : new Date();

      if (isNaN(dateParam.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const start = new Date(
          dateParam.getFullYear(),
          dateParam.getMonth(),
          dateParam.getDate(),
          0, 0, 0, 0
      );

      const end = new Date(
          dateParam.getFullYear(),
          dateParam.getMonth(),
          dateParam.getDate(),
          23, 59, 59, 999
      );
      const query = { babyId: req.params.babyId, timestamp: { $gte: start, $lte: end } };


      const events = await Event.find(query).populate("caregiverId", "name").sort({timestamp: -1});

      if (isFetchSummary) {
        let feedings = 0;
        let sleepingHours = 0;
        let diapers = 0;

        events.forEach((e) => {
          if (e.type === "feeding") {
            feedings++;
          } else if (e.type === "sleeping") {
            const start = new Date(e.sleep_start);
            const end = new Date(e.sleep_end);
            const diffMs = end - start;
            sleepingHours = diffMs / (1000 * 60 * 60);
          } else if (e.type === "diaper") {
            diapers++;
          }
        });

        const summary = {
          feedings,
          sleepingHours: parseFloat(sleepingHours.toFixed(1)), // round to 1 decimal
          diapers,
        };

        return res.json({ events, summary });
      }
      res.json(events);
    } catch (err) {
      res.status(500).json({ message: "error fetching events" });
    }
  }
);

module.exports = router; */