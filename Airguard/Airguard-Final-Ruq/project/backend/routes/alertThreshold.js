const express = require('express');
const router = express.Router();

let alertThreshold = 200;

// Get alert threshold
router.get('/', (req, res) => {
  res.json({ threshold: alertThreshold });
});

// Set alert threshold
router.put('/', (req, res) => {
  alertThreshold = req.body.threshold;
  res.json({ message: 'Alert threshold updated successfully', threshold: alertThreshold });
});

module.exports = router;