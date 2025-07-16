const mongoose = require("mongoose");

const PollutionReportSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    user: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    location: { type: String, required: true },
    locationName: { type: String, required: true }, // Human-readable location name
    pollutionType: { type: String, required: true },
    date: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    images: [{ type: String }],
    lat: { type: Number, required: false }, // Make optional since manual input won't have coordinates
    lon: { type: Number, required: false }, // Make optional since manual input won't have coordinates
  },
  { timestamps: true }
);

module.exports = mongoose.model("PollutionReport", PollutionReportSchema);