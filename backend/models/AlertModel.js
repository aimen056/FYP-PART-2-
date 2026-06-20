const { Schema, model } = require("mongoose");

const AlertSchema = new Schema({
  alertName: {
    type: String,
    required: true,
    maxlength: 100,
  },
  location: {
    type: String,
    required: true,
  },
  pollutantName: {
    type: String,
    required: true,
  },
  thresholdType: {
    type: String,
    enum: ["AQI"],
    required: true,
  },
  aqiCondition: {
    type: String,
    enum: ["greater"],
    required: true,
  },
  aqiValue: {
    type: Number,
    required: true,
    min: [0, "AQI must be at least 0"],
    max: [500, "AQI must not exceed 500"],
  },
  status: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Alert", AlertSchema);


