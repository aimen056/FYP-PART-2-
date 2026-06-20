const express = require('express');
const router = express.Router();
const SensorLocation = require('../models/SensorLocation');
const authMiddleware = require('../middleware/auth');

// Get all sensor locations (public)
router.get('/', async (req, res) => {
  try {
    const locations = await SensorLocation.find().sort({ createdAt: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new sensor location (public — IoT device registration)
router.post('/', async (req, res) => {
  try {
    const { zone, locationName, lat, lon, threshold } = req.body;

    if (!zone || !locationName || !lat || !lon) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newLocation = new SensorLocation({
      zone,
      locationName,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      threshold: threshold || 200
    });

    const savedLocation = await newLocation.save();
    res.status(201).json(savedLocation);
  } catch (err) {
    res.status(400).json({
      message: err.message.includes('validation failed')
        ? 'Invalid data format'
        : err.message
    });
  }
});

// Update sensor location (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { zone, locationName, lat, lon, threshold } = req.body;

    const updatedLocation = await SensorLocation.findByIdAndUpdate(
      req.params.id,
      {
        zone,
        locationName,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        threshold: threshold || 200
      },
      { new: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Sensor location not found' });
    }

    res.json(updatedLocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete sensor location (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedLocation = await SensorLocation.findByIdAndDelete(req.params.id);

    if (!deletedLocation) {
      return res.status(404).json({ message: 'Sensor location not found' });
    }

    res.json({ message: 'Sensor location deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
