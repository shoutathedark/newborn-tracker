const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["feeding", "sleep", "diaper", "note"], required: true },
  notes: { type: String, maxlength: 500 },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
