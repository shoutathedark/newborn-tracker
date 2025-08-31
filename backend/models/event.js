const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  babyId: { type: Schema.Types.ObjectId, ref: 'Baby', required: true },
  caregiverId: { type: Schema.Types.ObjectId, ref: 'Caregiver', required: true },
  type: { 
    type: String, 
    enum: ['feeding', 'sleeping', 'shower', 'diaper', 'milk_expression'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number }, // in minutes, for sleeping
  amount: { type: Number }, // in ml, for feeding or milk_expression
  diaper: {
    type: {
      type: String,
      enum: ['pee', 'poop', 'mixed']
    },
    consistency: {
      type: String,
      enum: ['soft', 'firm', 'runny', 'watery']
    }
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);