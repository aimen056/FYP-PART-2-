const express = require('express');
const router = express.Router();
const axios = require('axios'); // Ensure axios is imported

router.post('/', async (req, res) => {
  // Log raw request body
  console.log('Raw forecast request body:', JSON.stringify(req.body, null, 2));

  // Construct clean payload
  const payload = {
    steps: Number(req.body.steps) || 6,
    zone: req.body.zone || 'Zone 1',
    historical: {
      timestamps: Array.isArray(req.body.historical?.timestamps)
        ? req.body.historical.timestamps.map((ts) => ts.replace(/Z$/, '+00:00')) // Normalize to Flask format
        : [],
      aqi: Array.isArray(req.body.historical?.aqi) ? req.body.historical.aqi.map(Number) : [],
    },
  };

  // Validate payload
  if (!payload.historical.timestamps.length || !payload.historical.aqi.length) {
    console.error('Invalid payload: missing timestamps or aqi');
    return res.status(400).json({ message: 'Invalid payload: missing timestamps or aqi' });
  }

  console.log('Sending forecast payload to Flask:', JSON.stringify(payload, null, 2));

  try {
    const forecastServiceUrl = process.env.FLASK_SERVICE_URL || 'http://localhost:5003';
    const response = await axios.post(`${forecastServiceUrl}/forecast`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15000, // 15s timeout
    });

    console.log('Flask forecast response:', JSON.stringify(response.data, null, 2));
    return res.json(response.data);
  } catch (err) {
    const errorDetails = {
      message: err.message,
      status: err.response?.status,
      response: err.response?.data,
      requestBody: JSON.stringify(payload, null, 2),
    };
    console.error('Forecast request failed:', JSON.stringify(errorDetails, null, 2));

    const errorMessage = err.response?.data?.error || err.message;
    return res.status(err.response?.status || 500).json({
      message: `Error forwarding forecast to ML service: ${errorMessage}`,
    });
  }
});

router.post('/train-models', async (req, res) => {
  try {
    console.log('Raw train-models request from frontend:', JSON.stringify(req.body, null, 2));

    const historicalData = req.body.data;

    if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
      return res.status(400).json({ message: 'Invalid payload: "data" array is missing or empty.' });
    }

    // Corrected Fix: Transform the timestamps within the data array itself.
    const transformedData = historicalData.map(item => ({
      ...item,
      intervalStart: item.intervalStart.replace(/Z$/, '+00:00'),
    }));

    // Wrap the transformed data in the structure Flask expects.
    const payload = {
      data: transformedData,
    };

    console.log('Sending final, fully transformed payload to Flask:', JSON.stringify(payload, null, 2));

    const forecastServiceUrl = process.env.FLASK_SERVICE_URL || 'http://localhost:5003';
    const response = await axios.post(`${forecastServiceUrl}/train`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000, // <-- Increased timeout to 60 seconds
    });
    console.log('Flask train response:', JSON.stringify(response.data, null, 2));
    res.json({ status: 'success' });
  } catch (err) {
    console.error('Train-models error:', err.message, err.response?.data);
    res.status(500).json({ message: `Failed to train models: ${err.message}` });
  }
});

module.exports = router;