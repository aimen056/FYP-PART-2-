const axios = require('axios');

const FORECAST_SERVICE_URL = 'http://localhost:5003';

class ForecastService {
  async trainModel(data) {
    try {
      console.log('Sending train request:', JSON.stringify({ data }, null, 2));
      const response = await axios.post(`${FORECAST_SERVICE_URL}/train`, { data }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      console.log('Model training response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error training model:', error.message, error.response?.data);
      throw new Error(`Failed to train forecasting models: ${error.message}`);
    }
  }

  async getForecast(data, steps = 6, zone = 'Zone 1') {
    try {
      if (!data.timestamps || !data.aqi || data.timestamps.length !== data.aqi.length) {
        throw new Error('Invalid historical data');
      }
      console.log('Sending forecast request:', JSON.stringify({ historical: data, steps, zone }, null, 2));
      const response = await axios.post(`${FORECAST_SERVICE_URL}/forecast`, {
        historical: data,
        steps,
        zone,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      console.log('Forecast response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting forecast:', error.message, error.response?.data);
      throw new Error(`Failed to generate forecast: ${error.message}`);
    }
  }
}

module.exports = new ForecastService();