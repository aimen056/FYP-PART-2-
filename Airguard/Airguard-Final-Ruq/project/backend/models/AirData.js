const mongoose = require('mongoose');
const airDataSchema = new mongoose.Schema({
  pm2_5: { type: Number, required: true },
  pm10: { type: Number, required: true },
  aqi: { type: Number, required: true },
  co: { type: Number, default: 0 },
  o3: { type: Number, default: 0 },
  aqi_pm25: { type: Number, default: 0 },
  aqi_pm10: { type: Number, default: 0 },
  aqi_o3: { type: Number, default: 0 },
  aqi_co: { type: Number, default: 0 },
  aqi_so2: { type: Number, default: 0 },
  aqi_no2: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});


module.exports = mongoose.model('AirData', airDataSchema);