import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['take_me_home', 'chauffeur'],
    default: 'take_me_home',
    required: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientPhone: {
    type: String,
    default: ''
  },
  clientCar: {
    type: String,
    default: ''
  },
  pickup: {
    type: String,
    required: true,
    trim: true
  },
  dropoff: {
    type: String,
    required: true,
    trim: true
  },
  // For Take Me Home (2 Drivers)
  clientDriverId: {
    type: String,
    default: ''
  },
  clientDriverName: {
    type: String,
    default: ''
  },
  chaseDriverId: {
    type: String,
    default: ''
  },
  chaseDriverName: {
    type: String,
    default: ''
  },
  chaseCar: {
    type: String,
    default: 'Car 1 (Mercedes C200 - GP 884-TMH)'
  },
  // For Chauffeur (1 Driver)
  driverId: {
    type: String,
    default: ''
  },
  driverName: {
    type: String,
    default: ''
  },
  car: {
    type: String,
    default: 'Car 2 (BMW 320i - GP 419-DRV)'
  },
  fare: {
    type: Number,
    required: true,
    default: 350
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  // Prominent Notes field for every trip as requested by user
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  createdBy: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
