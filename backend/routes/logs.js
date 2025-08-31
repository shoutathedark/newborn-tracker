const express = require("express");
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
    body("type").isIn(["feeding", "sleeping", "shower", "diaper", "milk_expression"]),
    body("amount").optional().isNumeric(),
    body("duration").optional().isNumeric(),
    body("diaper").optional().custom(value => {
      if (!value.type || !["pee", "poop", "mixed"].includes(value.type)) throw new Error("Invalid diaper type");
      if (!value.consistency || !["soft", "firm", "runny", "watery"].includes(value.consistency)) throw new Error("Invalid diaper consistency");
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
        amount: req.body.amount,
        duration: req.body.duration,
        diaper: req.body.diaper,
        notes: req.body.notes,
        timestamp: req.body.timestamp || new Date()
      });

      await event.save();
      res.status(201).json(event);
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

      const events = await Event.find({ babyId: req.params.babyId }).populate("caregiverId", "name username role");
      res.json(events);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;