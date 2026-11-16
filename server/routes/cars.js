import express from 'express';
import { dbService } from '../db.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = express.Router();

// All car operations require JWT authentication
router.use(authenticateJwt);

// GET /api/cars - Get all dynamic fleet cars
router.get('/', async (req, res) => {
  try {
    const cars = await dbService.getCars();
    return res.json({ success: true, cars });
  } catch (error) {
    console.error('Fetch cars error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch fleet cars.' });
  }
});

// POST /api/cars - Add a new dynamic car (All users have admin powers)
router.post('/', async (req, res) => {
  try {
    const { name, model, plate, color } = req.body;

    if (!name || !plate) {
      return res.status(400).json({ success: false, message: 'Please provide car name and license plate.' });
    }

    const newCar = await dbService.createCar({
      name: name.trim(),
      model: model ? model.trim() : name.trim(),
      plate: plate.toUpperCase().trim(),
      color: color || 'White'
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle added to dynamic fleet successfully',
      car: newCar
    });
  } catch (error) {
    console.error('Add car error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add vehicle.' });
  }
});

// PUT /api/cars/:id - Update dynamic car
router.put('/:id', async (req, res) => {
  try {
    const updated = await dbService.updateCar(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    return res.json({ success: true, message: 'Vehicle updated successfully', car: updated });
  } catch (error) {
    console.error('Update car error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update vehicle.' });
  }
});

// DELETE /api/cars/:id - Delete dynamic car
router.delete('/:id', async (req, res) => {
  try {
    await dbService.deleteCar(req.params.id);
    return res.json({ success: true, message: 'Vehicle removed from fleet' });
  } catch (error) {
    console.error('Delete car error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove vehicle.' });
  }
});

export default router;
