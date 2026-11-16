import express from 'express';
import { dbService } from '../db.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = express.Router();

// All trip routes require JWT authentication
router.use(authenticateJwt);

// GET /api/trips - Retrieve all trips
router.get('/', async (req, res) => {
  try {
    const trips = await dbService.getTrips();
    return res.json({ success: true, trips });
  } catch (error) {
    console.error('Fetch trips error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch trips.' });
  }
});

// POST /api/trips - Create a new trip (with notes field!)
router.post('/', async (req, res) => {
  try {
    const {
      type,
      clientName,
      clientPhone,
      clientCar,
      pickup,
      dropoff,
      clientDriverId,
      clientDriverName,
      chaseDriverId,
      chaseDriverName,
      chaseCar,
      driverId,
      driverName,
      car,
      fare,
      status,
      notes
    } = req.body;

    if (!clientName || !pickup || !dropoff) {
      return res.status(400).json({ success: false, message: 'Please provide client name, pickup and dropoff.' });
    }

    const newTrip = await dbService.createTrip({
      type: type || 'take_me_home',
      clientName: clientName.trim(),
      clientPhone: clientPhone || '',
      clientCar: clientCar || '',
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      clientDriverId: clientDriverId || '',
      clientDriverName: clientDriverName || '',
      chaseDriverId: chaseDriverId || '',
      chaseDriverName: chaseDriverName || '',
      chaseCar: chaseCar || 'Car 1 (Mercedes C200 - GP 884-TMH)',
      driverId: driverId || '',
      driverName: driverName || '',
      car: car || 'Car 2 (BMW 320i - GP 419-DRV)',
      fare: parseFloat(fare) || 350,
      status: status || 'in_progress',
      notes: notes || '', // Notes field for every trip
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Trip logged successfully',
      trip: newTrip
    });
  } catch (error) {
    console.error('Create trip error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save trip to database.' });
  }
});

// PUT /api/trips/:id - Update trip status or notes
router.put('/:id', async (req, res) => {
  try {
    const updated = await dbService.updateTrip(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }
    return res.json({ success: true, message: 'Trip updated successfully', trip: updated });
  } catch (error) {
    console.error('Update trip error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update trip.' });
  }
});

// DELETE /api/trips/:id - Remove trip
router.delete('/:id', async (req, res) => {
  try {
    await dbService.deleteTrip(req.params.id);
    return res.json({ success: true, message: 'Trip removed successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete trip.' });
  }
});

export default router;
