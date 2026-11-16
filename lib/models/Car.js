import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  plate: { type: String, required: true },
  color: { type: String, required: true },
  status: { type: String, enum: ['active', 'maintenance', 'assigned'], default: 'active' },
  fuelPercent: { type: Number, default: 100 },
  odometerKm: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Car = mongoose.models.Car || mongoose.model('Car', carSchema);
