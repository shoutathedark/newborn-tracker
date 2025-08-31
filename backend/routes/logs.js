const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Log = require("../models/log");
const Room = require("../models/Room");
const auth = require("../middleware/auth");

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// Add log
router.post(
  "/:roomId/logs",
  auth,
  [
    param("roomId").isMongoId(),
    body("type").isIn(["feeding", "sleep", "diaper", "note"]),
    body("notes").optional().trim().escape().isLength({ max: 500 }),
    body("timestamp").optional().isISO8601(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const room = await Room.findById(req.params.roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });
      if (!room.members.includes(req.user.id)) return res.status(403).json({ message: "Access denied" });

      const log = new Log({
        roomId: req.params.roomId,
        caregiverId: req.user.id,
        type: req.body.type,
        notes: req.body.notes,
        timestamp: req.body.timestamp || new Date()
      });

      await log.save();
      res.status(201).json(log);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get logs
router.get("/:roomId/logs", auth, [param("roomId").isMongoId()], handleValidationErrors, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!room.members.includes(req.user.id)) return res.status(403).json({ message: "Access denied" });

    const logs = await Log.find({ roomId: req.params.roomId }).populate("caregiverId", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
