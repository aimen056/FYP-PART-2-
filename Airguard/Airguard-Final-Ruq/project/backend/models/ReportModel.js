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
    pollutionType: { type: String, required: true },
    date: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    images: [{ type: String }], // Array to store image URLs
    lat: { type: Number },
    lon: { type: Number },
  },
  { timestamps: true }
);

const PollutionReport =
  mongoose.models.PollutionReport ||
  mongoose.model("PollutionReport", PollutionReportSchema);

module.exports = PollutionReport;