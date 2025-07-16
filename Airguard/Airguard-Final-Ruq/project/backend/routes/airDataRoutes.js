const express = require('express');
const router = express.Router();
const AirData = require('../models/AirData');
const { calculateIndex } = require('../utils/calculateAqi');
const moment = require('moment');

// Enable CORS for this router
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// POST endpoint to save new air data
router.post('/', async (req, res) => {
  try {
    const { pm2_5, pm10, co, o3, no2, so2, zone } = req.body;

    if (typeof pm2_5 !== 'number' || typeof pm10 !== 'number') {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const aqi_pm25 = calculateIndex(pm2_5, 'pm25');
    const aqi_pm10 = calculateIndex(pm10, 'pm10');
    const aqi_o3 = calculateIndex(o3 || 0, 'O3');
    const aqi_co = calculateIndex(co || 0, 'CO');
    const aqi_so2 = calculateIndex(so2 || 0, 'SO2');
    const aqi_no2 = calculateIndex(no2 || 0, 'NO2');
    const aqi = Math.max(aqi_pm25, aqi_pm10, aqi_o3, aqi_co, aqi_so2, aqi_no2);

    const newReading = new AirData({
      pm2_5,
      pm10,
      co: co || 0,
      o3: o3 || 0,
      no2: no2 || 0,
      so2: so2 || 0,
      aqi,
      aqi_pm25,
      aqi_pm10,
      aqi_o3,
      aqi_co,
      aqi_so2,
      aqi_no2,
      zone: zone || 'Unknown'
    });

    await newReading.save();
    res.status(200).json({ message: 'Data & AQI saved', aqi, aqi_pm25, aqi_pm10, aqi_o3, aqi_co, aqi_so2, aqi_no2 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET endpoint to fetch latest air data
router.get('/latest', async (req, res) => {
  try {
    console.log('Fetching latest air data...');
    const latestData = await AirData.findOne().sort({ timestamp: -1 }).exec();
    
    if (!latestData) {
      console.log('No data found in database');
      return res.status(200).json({
        aqi: 0,
        pm2_5: 0,
        pm10: 0,
        co: 0,
        o3: 0,
        no2: 0,
        so2: 0,
        message: 'No data available, using defaults'
      });
    }
    
    console.log('Found data:', latestData);
    res.json({
      aqi: latestData.aqi,
      aqi_pm25: latestData.aqi_pm25,
      aqi_pm10: latestData.aqi_pm10,
      aqi_o3: latestData.aqi_o3,
      aqi_co: latestData.aqi_co,
      aqi_so2: latestData.aqi_so2,
      aqi_no2: latestData.aqi_no2,
      pm2_5: latestData.pm2_5,
      pm10: latestData.pm10,
      co: latestData.co,
      o3: latestData.o3,
      no2: latestData.no2,
      so2: latestData.so2,
      zone: latestData.zone,
      timestamp: latestData.timestamp
    });
  } catch (err) {
    console.error('Error in /latest endpoint:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET endpoint for historical data
router.get('/historical', async (req, res) => {
  try {
    const { zone, startDate, endDate } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Build query
    const query = { 
      timestamp: { 
        $gte: start,
        $lte: end 
      } 
    };

    // Add zone filter if provided
    if (zone && zone !== 'all') {
      query.zone = zone;
    }

    // Fetch data from database
    const historicalData = await AirData.find(query)
      .sort({ timestamp: 1 })
      .select('timestamp aqi pm2_5 pm10 co o3 no2 so2 zone aqi_pm25 aqi_pm10 aqi_o3 aqi_co aqi_so2 aqi_no2')
      .lean();

    // Group data by hour (optional, for reducing data points)
    const hourlyData = historicalData.reduce((acc, reading) => {
      const hour = moment(reading.timestamp).startOf('hour').format();
      if (!acc[hour]) {
        acc[hour] = {
          timestamp: hour,
          aqi: reading.aqi,
          aqi_pm25: reading.aqi_pm25,
          aqi_pm10: reading.aqi_pm10,
          aqi_o3: reading.aqi_o3,
          aqi_co: reading.aqi_co,
          aqi_so2: reading.aqi_so2,
          aqi_no2: reading.aqi_no2,
          pm2_5: reading.pm2_5,
          pm10: reading.pm10,
          co: reading.co,
          o3: reading.o3,
          no2: reading.no2,
          so2: reading.so2,
          zone: reading.zone,
          count: 1
        };
      } else {
        // Average values for the hour
        acc[hour].aqi = (acc[hour].aqi * acc[hour].count + reading.aqi) / (acc[hour].count + 1);
        acc[hour].aqi_pm25 = (acc[hour].aqi_pm25 * acc[hour].count + reading.aqi_pm25) / (acc[hour].count + 1);
        acc[hour].aqi_pm10 = (acc[hour].aqi_pm10 * acc[hour].count + reading.aqi_pm10) / (acc[hour].count + 1);
        acc[hour].aqi_o3 = (acc[hour].aqi_o3 * acc[hour].count + reading.aqi_o3) / (acc[hour].count + 1);
        acc[hour].aqi_co = (acc[hour].aqi_co * acc[hour].count + reading.aqi_co) / (acc[hour].count + 1);
        acc[hour].aqi_so2 = (acc[hour].aqi_so2 * acc[hour].count + reading.aqi_so2) / (acc[hour].count + 1);
        acc[hour].aqi_no2 = (acc[hour].aqi_no2 * acc[hour].count + reading.aqi_no2) / (acc[hour].count + 1);
        acc[hour].pm2_5 = (acc[hour].pm2_5 * acc[hour].count + reading.pm2_5) / (acc[hour].count + 1);
        acc[hour].pm10 = (acc[hour].pm10 * acc[hour].count + reading.pm10) / (acc[hour].count + 1);
        acc[hour].count += 1;
      }
      return acc;
    }, {});

    const result = Object.values(hourlyData);

    res.json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (err) {
    console.error('Error fetching historical data:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
});

module.exports = router;