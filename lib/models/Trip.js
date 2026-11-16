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
    enum: ['completed', 'in_progress', 'cancelled', 'deferred'],
    default: 'completed'
  },
  deferReason: { type: String, default: '' },
  deferredAt: { type: String, default: '' },
  deferredBy: { type: String, default: '' },
  invoiceNumber: { type: String, default: '' },
  notes: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  time: { type: String, default: () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
  createdAt: { type: Date, default: Date.now }
});

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
