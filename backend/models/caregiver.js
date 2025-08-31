const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const caregiverSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true , unique: true},
  role: { 
    type: String, 
    enum: ['parent', 'grandparent', 'nanny', 'other'], 
    default: 'parent' 
  },
  password: { type: String, required: true }
}, { timestamps: true });

// Hash password before saving
caregiverSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
caregiverSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Caregiver', caregiverSchema);
