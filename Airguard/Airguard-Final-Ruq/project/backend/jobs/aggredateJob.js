// src/jobs/aggregateJob.js
const cron = require('node-cron');
const AirData = require('../models/AirData');
const AggregatedAQI = require('../models/AggregatedModel');
const { calculateIndex } = require('../utils/calculateAqi.js');

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const readings = await AirData.find({
    timestamp: { $gte: tenMinAgo, $lte: now }
  });

  if (!readings.length) return;

  const avg_pm25 = readings.reduce((sum, r) => sum + r.pm2_5, 0) / readings.length;
  const avg_pm10 = readings.reduce((sum, r) => sum + r.pm10, 0) / readings.length;
  const avg_o3 = readings.reduce((sum, r) => sum + (r.o3 || 0), 0) / readings.length;
  const avg_co = readings.reduce((sum, r) => sum + (r.co || 0), 0) / readings.length;
  const avg_so2 = readings.reduce((sum, r) => sum + (r.so2 || 0), 0) / readings.length;
  const avg_no2 = readings.reduce((sum, r) => sum + (r.no2 || 0), 0) / readings.length;

  const aqi_pm25 = calculateIndex(avg_pm25, 'pm25');
  const aqi_pm10 = calculateIndex(avg_pm10, 'pm10');
  const aqi_o3 = calculateIndex(avg_o3, 'O3');
  const aqi_co = calculateIndex(avg_co, 'CO');
  const aqi_so2 = calculateIndex(avg_so2, 'SO2');
  const aqi_no2 = calculateIndex(avg_no2, 'NO2');
  const max_aqi = Math.max(aqi_pm25, aqi_pm10, aqi_o3, aqi_co, aqi_so2, aqi_no2);
  let mainPollutant = 'PM2.5';
  const pollutantAqis = { aqi_pm25, aqi_pm10, aqi_o3, aqi_co, aqi_so2, aqi_no2 };
  for (const [key, value] of Object.entries(pollutantAqis)) {
    if (value === max_aqi) {
      mainPollutant = key.replace('aqi_', '').toUpperCase();
      break;
    }
  }

  const agg = new AggregatedAQI({
    intervalStart: tenMinAgo,
    intervalEnd: now,
    pm2_5_avg: avg_pm25,
    pm10_avg: avg_pm10,
    aqi: max_aqi,
    aqi_pm25,
    aqi_pm10,
    aqi_o3,
    aqi_co,
    aqi_so2,
    aqi_no2,
    pollutant: mainPollutant
  });

  await agg.save();
  console.log(`Saved 10-min average: AQI=${max_aqi}, Main Pollutant: ${mainPollutant}`);
});
