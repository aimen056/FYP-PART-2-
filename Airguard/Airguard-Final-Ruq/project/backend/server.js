const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/airguard', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const pollutionReports = require('./routes/pollutionReports');
const sensorLocations = require('./routes/sensorLocations');
const alertThreshold = require('./routes/alertThreshold');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const airDataRoutes = require('./routes/airDataRoutes');
const aggregatedRoutes = require('./routes/aggregatedRoutes');
const aqiSensorRoutes = require('./routes/aqiSensorRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const forecastRouter = require('./routes/forecastRouter');

// Import aggregation job
require('./jobs/aggredateJob');

app.use('/auth/forecast', forecastRouter);
app.use('/auth', authRoutes);
app.use('/auth/chatbot', chatbotRoutes); // Mount at /auth/chatbot
app.use('/api/aqi-sensor', aqiSensorRoutes);
app.use('/api/pollution-reports', pollutionReports);
app.use('/api/sensor-locations', sensorLocations);
app.use('/api/alert-threshold', alertThreshold);
app.use('/auth/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/data', airDataRoutes);
app.use('/api/aggregated', aggregatedRoutes);

// Log all routes
console.log('Registered routes:');
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`Route: ${r.route.path}, Methods: ${Object.keys(r.route.methods)}`);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: `Internal server error: ${err.message}` });
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));