const mongoose = require('mongoose');

const SensorLocationSchema = new mongoose.Schema({
  zone: { 
    type: String, 
    required: true,
    enum: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
    index: true
  },
  locationName: {
    type: String,
    required: true,
    trim: true
  },
  lat: { 
    type: Number, 
    required: true 
  },
  lon: { 
    type: Number, 
    required: true 
  },
  threshold: { 
    type: Number, 
    default: 200 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SensorLocation', SensorLocationSchema);