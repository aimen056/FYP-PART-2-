// src/models/AggregatedAQI.js
const mongoose = require('mongoose');

const aggregatedAQISchema = new mongoose.Schema({
  intervalStart: { type: Date, required: true }, // e.g., start of the 10-min window
  intervalEnd: { type: Date, required: true },
  pm2_5_avg: Number,
  pm10_avg: Number,
  aqi: Number , // the max AQI of pm2.5 and pm10
  aqi_pm25: Number,
  aqi_pm10: Number,
  aqi_o3: Number,
  aqi_co: Number,
  aqi_so2: Number,
  aqi_no2: Number,
  pollutant: { type: String } 
});

module.exports = mongoose.model('AggregatedAQI', aggregatedAQISchema);