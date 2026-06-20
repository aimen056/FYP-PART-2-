require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later." },
});
app.use(["/auth/login", "/auth/register"], authLimiter);

// MongoDB Connection
mongoose;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const authRoutes = require("./routes/auth");
const pollutionReports = require("./routes/pollutionReports");
const sensorLocations = require("./routes/sensorLocations");
const alertThreshold = require("./routes/alertThreshold");
const alertRoutes = require("./routes/alertRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const airDataRoutes = require("./routes/airDataRoutes");
const aggregatedRoutes = require("./routes/aggregatedRoutes");
const aqiSensorRoutes = require("./routes/aqiSensorRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const forecastRouter = require("./routes/forecastRouter");

// Import aggregation job
require("./jobs/aggredateJob");

app.use("/auth/forecast", forecastRouter);
app.use("/auth", authRoutes);
app.use("/auth/chatbot", chatbotRoutes);
app.use("/api/aqi-sensor", aqiSensorRoutes);
app.use("/api/pollution-reports", pollutionReports);
app.use("/api/sensor-locations", sensorLocations);
app.use("/api/alert-threshold", alertThreshold);
app.use("/auth/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/user", userRoutes);
app.use("/api/data", airDataRoutes);
app.use("/api/aggregated", aggregatedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: `Internal server error: ${err.message}` });
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);
