const express = require('express');
const router = express.Router();
const AggregatedAQI = require('../models/AggregatedModel');

router.get('/', async (req, res) => {
  try {
    const { startDate } = req.query;
    const query = startDate ? { intervalStart: { $gte: new Date(startDate) } } : {};
    const data = await AggregatedAQI.find(query).sort({ intervalStart: -1 }).limit(100);
    console.log('Fetched aggregated data:', data); // Log for debugging
    res.json(data); // Always return an array
  } catch (err) {
    console.error('Error fetching aggregated data:', err.message);
    res.status(500).json({ message: `Failed to fetch aggregated data: ${err.message}` });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const [latest, highest] = await Promise.all([
      AggregatedAQI.findOne().sort({ intervalStart: -1 }).select('aqi aqi_pm25 aqi_pm10 aqi_o3 aqi_co aqi_so2 aqi_no2 -_id'),
      AggregatedAQI.findOne().sort({ aqi: -1 }).select('aqi aqi_pm25 aqi_pm10 aqi_o3 aqi_co aqi_so2 aqi_no2 -_id'),
    ]);
    res.json({
      latest: latest || null,
      highest: highest || null
    });
  } catch (err) {
    console.error('Error fetching latest AQI:', err.message);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

module.exports = router;