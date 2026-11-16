import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    default: ''
  },
  plate: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: 'White'
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'standby'],
    default: 'active'
  },
  fuelPercent: {
    type: Number,
    default: 85
  },
  odometerKm: {
    type: Number,
    default: 45000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Car = mongoose.models.Car || mongoose.model('Car', carSchema);
