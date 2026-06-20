const express = require('express');
const router = express.Router();
const AirData = require('../models/AirData');
const { calculateIndex } = require('../utils/calculateAqi');

router.post('/', async (req, res) => {
  try {
const { pm25, pm10, co, o3, so2, no2, zone, locationName } = req.body;

if (typeof pm25 !== 'number' || typeof pm10 !== 'number') {
  return res.status(400).json({ message: 'Invalid PM data' });
}

const aqi_pm25 = calculateIndex(pm25, 'pm25');
const aqi_pm10 = calculateIndex(pm10, 'pm10');
const aqi_o3 = calculateIndex(o3 || 0, 'O3');
const aqi_co = calculateIndex(co || 0, 'CO');
const aqi_so2 = calculateIndex(so2 || 0, 'SO2');
const aqi_no2 = calculateIndex(no2 || 0, 'NO2');
const aqi = Math.max(aqi_pm25, aqi_pm10, aqi_o3, aqi_co, aqi_so2, aqi_no2);

const newReading = new AirData({
  pm2_5: pm25,  // Save as pm2_5 if your schema uses this
  pm10,
  aqi,
  aqi_pm25,
  aqi_pm10,
  aqi_o3,
  aqi_co,
  aqi_so2,
  aqi_no2,
  co,
  o3,
  so2,
  no2,
  zone,
  locationName
});


    await newReading.save();
    res.status(200).json({ message: 'Sensor data saved', aqi, aqi_pm25, aqi_pm10, aqi_o3, aqi_co, aqi_so2, aqi_no2 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
