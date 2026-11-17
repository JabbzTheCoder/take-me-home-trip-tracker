import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['take_me_home', 'chauffeur'],
    required: true
  },
  clientName: { type: String, required: true },
  clientPhone: { type: String, default: '' },
  clientCar: { type: String, default: '' },
  pickup: { type: String, required: true },
  dropoff: { type: String, required: true },
  // Take Me Home has 2 drivers: Lead Driver in client's car + Chase Driver in escort car
  clientDriverName: { type: String, default: '' },
  chaseDriverName: { type: String, default: '' },
  chaseCar: { type: String, default: '' },
  // Chauffeur has 1 driver + 1 fleet car
  driverName: { type: String, default: '' },
  car: { type: String, default: '' },
  fare: { type: Number, required: true },
  status: {
    type: String,
    enum: ['completed', 'deferred', 'cancelled', 'paused', 'cancelled_paused'],
    default: 'completed'
  },
  deferReason: { type: String, default: '' },
  deferredAt: { type: String, default: '' },
  deferredBy: { type: String, default: '' },
  invoiceNumber: { type: String, default: '' },
  profile: { type: String, default: 'profile1' },
  // Extra costs incurred on trip (Fuel, tolls, wash, etc.)
  extraCosts: [
    {
      id: { type: String },
      category: { type: String, default: 'fuel' },
      amount: { type: Number, required: true },
      description: { type: String, default: '' },
      paidBy: { type: String, default: '' },
      createdAt: { type: String, default: () => new Date().toISOString() }
    }
  ],
  totalExtraCosts: { type: Number, default: 0 },
  netFare: { type: Number, default: 0 },
  // Driver fare splits
  splits: {
    splitType: { type: String, default: 'equal_50_50' },
    leadDriverAmount: { type: Number, default: 0 },
    chaseDriverAmount: { type: Number, default: 0 },
    companyAmount: { type: Number, default: 0 },
    leadDriverPercent: { type: Number, default: 50 },
    chaseDriverPercent: { type: Number, default: 50 },
    notes: { type: String, default: '' }
  },
  splitStops: [{ type: String }],
  notes: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  time: { type: String, default: () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
  createdAt: { type: Date, default: Date.now }
});

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
