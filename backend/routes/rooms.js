const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Room = require("../models/Room");
const auth = require("../middleware/auth");

const router = express.Router();

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// Create room (user becomes admin)
router.post("/", auth, [body("name").notEmpty()], handleValidationErrors, async (req, res) => {
  try {
    const room = new Room({ name: req.body.name, admins: [req.user.id], members: [req.user.id] });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Invite caregiver (admin only)
router.post("/:roomId/invite", auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.admins.includes(req.user.id)) return res.status(403).json({ message: "Admins only" });

    const { caregiverId } = req.body;
    if (!caregiverId) return res.status(400).json({ message: "Caregiver ID required" });

    if (!room.members.includes(caregiverId)) {
      room.members.push(caregiverId);
      await room.save();
    }

    res.json({ message: "Caregiver invited", room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
