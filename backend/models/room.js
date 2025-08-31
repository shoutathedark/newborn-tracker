const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Room", roomSchema);
