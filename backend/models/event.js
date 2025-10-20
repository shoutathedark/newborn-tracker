import mongoose from "mongoose";
const { Schema } = mongoose;

const eventSchema = new Schema({
  babyId: { type: Schema.Types.ObjectId, ref: 'Baby', required: true },
  caregiverId: { type: Schema.Types.ObjectId, ref: 'Caregiver', required: true },
  type: { 
    type: String, 
    enum: ['feeding', 'sleeping', 'shower', 'diaper'], 
    required: true 
  },
  subtype:{
    type: String,
    enum: ['bottle', 'breastfeeding_left', 'breastfeeding_right', 'breastfeeding_both']
  },
  timestamp: { type: Date, default: Date.now },
  sleep_start: { type: Date },
  sleep_end: {type: Date},
  amount: { type: Number },
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

const Event = mongoose.model.Event || mongoose.model("Event", eventSchema);
export default Event;