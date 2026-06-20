const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

const THRESHOLD_KEY = 'alertThreshold';
const DEFAULT_THRESHOLD = 200;

// Get alert threshold
router.get('/', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: THRESHOLD_KEY });
    res.json({ threshold: setting ? setting.value : DEFAULT_THRESHOLD });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Set alert threshold
router.put('/', async (req, res) => {
  try {
    const threshold = req.body.threshold;
    await Settings.findOneAndUpdate(
      { key: THRESHOLD_KEY },
      { value: threshold },
      { upsert: true, new: true }
    );
    res.json({ message: 'Alert threshold updated successfully', threshold });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
