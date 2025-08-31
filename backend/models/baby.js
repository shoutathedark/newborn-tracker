const mongoose = require('mongoose');
const { Schema } = mongoose;

const babySchema = new Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  caregiverIds: [{ type: Schema.Types.ObjectId, ref: 'Caregiver' }]
}, { timestamps: true });

module.exports = mongoose.model('Baby', babySchema);