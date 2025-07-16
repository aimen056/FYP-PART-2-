import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Chart from "chart.js/auto";
import axios from "axios";
import { BsSearch, BsCalendarDay, BsCalendarMinus, BsGeoAlt, BsArrowRepeat } from "react-icons/bs";
import DropletIcon from "../assets/icons/droplet.svg";
import SpeedometerIcon from "../assets/icons/speedometer.svg";
import ThermometerIcon from "../assets/icons/thermometer.svg";
import HomeMap from "../components/HomeMap";
import AqiCard from "../components/Home/AqiCard";
import AQIForecastChart from "../components/AQIForecastChart";
import { useTranslation } from "react-i18next";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 dark:text-red-400 bg-white dark:bg-gray-900 w-full">
          <h3>{t("error.something_went_wrong")}</h3>
          <p>{this.state.error?.message || t("error.unknown")}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t("retry")}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [aqiData, setAqiData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(t("zone.1"));
  const [selectedDate, setSelectedDate] = useState("today");
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formattedMarkers, setFormattedMarkers] = useState([]);
  const [sensorLocations, setSensorLocations] = useState([]);
  const [dominantPollutant, setDominantPollutant] = useState("N/A");
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalError, setHistoricalError] = useState(null);

  const trendChartRef = useRef(null);
  const trendChartInstance = useRef(null);

  const ALERT_THRESHOLD = 200;

  // Updated category colors with better contrast and vibrancy
  const categoryColors = {
    good: "#22C55E", // Green-500
    moderate: "#FBBF24", // Yellow-400
    unhealthySensitive: "#F97316", // Orange-500
    unhealthy: "#EF4444", // Red-500
    veryUnhealthy: "#A21CAF", // Purple-700
    hazardous: "#7F1D1D", // Deep red
  };

  const aqiCategories = {
    good: { min: 0, max: 50 },
    moderate: { min: 51, max: 100 },
    unhealthySensitive: { min: 101, max: 150 },
    unhealthy: { min: 151, max: 200 },
    veryUnhealthy: { min: 201, max: 300 },
    hazardous: { min: 301, max: 500 },
  };

  const getAqiCategory = (aqi) => {
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "unhealthySensitive";
    if (aqi <= 200) return "unhealthy";
    if (aqi <= 300) return "veryUnhealthy";
    return "hazardous";
  };

  const locationToZoneMapping = {
    [t("zone.1")]: { lat: [24.8, 25.0], lon: [67.0, 67.2] },
    [t("zone.2")]: { lat: [33.6, 33.8], lon: [73.0, 73.2] },
    [t("zone.3")]: { lat: [31.5, 31.7], lon: [74.3, 74.5] },
    [t("zone.4")]: { lat: [34.0, 34.2], lon: [71.5, 71.7] },
  };

  const generateRandomTrendData = () => {
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const date = new Date(now);
      date.setHours(date.getHours() - (23 - i));
      return date;
    });

    return hours.map((date) => ({
      timestamp: date.toISOString(),
      aqi: Math.floor(Math.random() * 150) + 50,
    }));
  };

  // Updated PollutantBox with modern circular design
  const PollutantBox = ({ name, value, isDominant }) => (
    <motion.div
      variants={fadeIn}
      className={`flex flex-col items-center justify-center rounded-full border-2 ${
        isDominant ? "border-orange-500" : "border-gray-300 dark:border-gray-600"
      } w-24 h-24 m-3 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300`}
      whileHover={{ scale: 1.1 }}
    >
      <h6 className="font-semibold text-sm text-teal-600 dark:text-teal-400">{name}</h6>
      <p className="text-base font-bold text-gray-800 dark:text-gray-200">{value || "N/A"}</p>
      <small className="text-xs text-gray-500 dark:text-gray-400">µg/m³</small>
      {isDominant && <small className="text-xs text-orange-500 dark:text-orange-400">{t("pollutants.dominant")}</small>}
    </motion.div>
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          determineZone(latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setSelectedZone(t("zone.1"));
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setSelectedZone(t("zone.1"));
    }
  }, [i18n.language]);

  const determineZone = (latitude, longitude) => {
    for (const [zone, range] of Object.entries(locationToZoneMapping)) {
      if (
        latitude >= range.lat[0] &&
        latitude <= range.lat[1] &&
        longitude >= range.lon[0] &&
        longitude <= range.lon[1]
      ) {
        setSelectedZone(zone);
        return;
      }
    }
    setSelectedZone(t("zone.1"));
  };

  useEffect(() => {
    const fetchSensorLocations = async () => {
      try {
        const response = await axios.get("http://localhost:5002/api/sensor-locations");
        setSensorLocations(response.data);

        const formatted = response.data.map((sensor) => ({
          geocode: [sensor.lat, sensor.lon],
          label: sensor.zone,
          locationName: sensor.locationName,
          aqi: sensor.aqi,
          status: getAqiCategory(sensor.aqi),
        }));
        setFormattedMarkers(formatted);
      } catch (error) {
        console.error("Error fetching sensor locations:", error);
        setError(t("error.sensor_locations"));
      }
    };

    fetchSensorLocations();
  }, []);

  const fetchHistoricalData = async (zone, dateFilter) => {
    try {
      setLoading(true);
      setHistoricalError(null);
      let endpoint = "http://localhost:5002/api/aggregated";

      const now = new Date();
      let startDate,
        endDate = now.toISOString();

      if (dateFilter === "today") {
        startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
        endDate = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
      }

      const response = await axios.get(endpoint, {
        params: { zone, startDate, endDate },
      });

      const processedData = response.data.map((item) => ({
        timestamp: item.intervalStart || new Date().toISOString(),
        aqi: item.aqi || 0,
      }));

      setHistoricalData(processedData);
    } catch (error) {
      console.error("Error fetching historical data:", error.message, error.response?.status, error.response?.data);
      setHistoricalData(generateRandomTrendData());
      if (error.response?.status === 404) {
        setHistoricalError(t("error.historical_data_not_available", { zone }));
      } else {
        setHistoricalError(t("error.historical_data_failed", { message: error.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedZone) return;

    const fetchAqiData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentResponse = await axios.get(`http://localhost:5002/api/data/latest`);
        const currentData = currentResponse.data;

        if (!currentData) {
          throw new Error("No AQI data available");
        }

        const newAqiData = {
          overallAQI: currentData.aqi || 0,
          pollutants: {
            pm2_5: { aqi: currentData.aqi_pm25, value: currentData.pm2_5 },
            pm10: { aqi: currentData.aqi_pm10, value: currentData.pm10 },
            o3: { aqi: currentData.aqi_o3, value: currentData.o3 },
            co: { aqi: currentData.aqi_co, value: currentData.co },
            no2: { aqi: currentData.aqi_no2, value: currentData.no2 },
            so2: { aqi: currentData.aqi_so2, value: currentData.so2 },
          },
          trendData: generateRandomTrendData(),
        };

        setAqiData(newAqiData);
        await fetchHistoricalData(selectedZone, selectedDate);
      } catch (error) {
        console.error("Error fetching AQI data:", error);
        setError(t("error.aqi_data"));
        setAqiData({
          overallAQI: 0,
          pollutants: {
            pm2_5: { value: 0 },
            pm10: { value: 0 },
            co: { value: 0 },
            o3: { value: 0 },
          },
          trendData: generateRandomTrendData(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAqiData();
    const interval = setInterval(fetchAqiData, 60000);
    return () => clearInterval(interval);
  }, [selectedZone, selectedDate, i18n.language]);

  useEffect(() => {
    const chartData = historicalData.length > 0 ? historicalData : aqiData?.trendData || generateRandomTrendData();

    const formattedLabels = chartData.map((data) => {
      const date = new Date(data.timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });

    if (trendChartInstance.current) {
      trendChartInstance.current.destroy();
    }

    if (trendChartRef.current && chartData.length > 0 && !historicalError) {
      const ctx = trendChartRef.current.getContext("2d");

      trendChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: formattedLabels,
          datasets: [
            {
              label: t("chart.aqi_trend"),
              data: chartData.map((data) => data.aqi),
              borderColor: "#10B981",
              backgroundColor: document.documentElement.classList.contains("dark")
                ? "rgba(16, 185, 129, 0.2)"
                : "rgba(16, 185, 129, 0.1)",
              fill: true,
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `${t("chart.aqi")}: ${context.raw}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              suggestedMin: 0,
              suggestedMax: 300,
              ticks: {
                stepSize: 50,
                color: document.documentElement.classList.contains("dark") ? "rgb(229, 231, 235)" : "rgb(75, 85, 99)",
              },
              grid: {
                color: document.documentElement.classList.contains("dark")
                  ? "rgba(229, 231, 235, 0.2)"
                  : "rgba(200, 200, 200, 0.2)",
              },
            },
            x: {
              grid: { display: false },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
                color: document.documentElement.classList.contains("dark") ? "rgb(229, 231, 235)" : "rgb(75, 85, 99)",
              },
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
        },
      });
    }
  }, [aqiData, historicalData, historicalError, i18n.language]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const zone = Object.keys(locationToZoneMapping).find((zone) => zone.toLowerCase() === query);
    if (zone) {
      setSelectedZone(zone);
    } else {
      alert(t("error.zone_not_found"));
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchHistoricalData(selectedZone, date);
  };

  const categoryLabels = {
    good: t("category.good"),
    moderate: t("category.moderate"),
    unhealthySensitive: t("category.unhealthySensitive"),
    unhealthy: t("category.unhealthy"),
    veryUnhealthy: t("category.veryUnhealthy"),
    hazardous: t("category.hazardous"),
  };

  const descriptions = {
    good: t("recommendation.good"),
    moderate: t("recommendation.moderate"),
    unhealthySensitive: t("recommendation.unhealthy"),
    unhealthy: t("recommendation.unhealthy"),
    veryUnhealthy: t("recommendation.dangerous"),
    hazardous: t("recommendation.dangerous"),
  };

  const healthImpacts = {
    good: t("recommendation.good"),
    moderate: t("recommendation.moderate"),
    unhealthySensitive: t("recommendation.unhealthy"),
    unhealthy: t("recommendation.unhealthy"),
    veryUnhealthy: t("recommendation.dangerous"),
    hazardous: t("recommendation.dangerous"),
  };

  return (
    <ErrorBoundary t={t}>
      <motion.div
        className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16 w-full"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.header
          variants={fadeIn}
          className="bg-white dark:bg-gray-800 py-4 border-b border-gray-200 dark:border-gray-700 w-full"
        >
          <div className="w-full px-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <h1 className="font-bold text-xl text-teal-600 dark:text-teal-500 flex items-center">
                <span className="mr-2 animate-pulse">🌤️</span> {t("header.title")}
              </h1>
              <motion.div variants={fadeIn} className="mt-4 lg:mt-0 flex items-center space-x-2 w-full lg:w-auto">
                <input
                  type="text"
                  name="search"
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full max-w-md bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 transition-all text-gray-900 dark:text-gray-100"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSearch}
                  className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center shadow-md"
                  title={t("search.button")}
                >
                  <BsSearch className="h-5 w-5" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {error && error !== "Historical data error" && (
          <motion.div
            variants={fadeIn}
            className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 mx-4 my-2 rounded-lg"
          >
            <p>{error}</p>
          </motion.div>
        )}

        <div className="w-full px-4 my-6">
          <motion.div variants={slideUp} className="relative w-full h-[450px]">
            <div className="absolute inset-0 z-0 rounded-xl overflow-hidden shadow-lg">
              <HomeMap markers={formattedMarkers} />
            </div>
            <motion.div
              variants={fadeIn}
              className="absolute top-6 left-6 z-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 max-w-xs"
            >
              <AqiCard 
                selectedZone={selectedZone} 
                aqi={aqiData?.overallAQI} 
                category={getAqiCategory(aqiData?.overallAQI || 0)}
                dominantPollutant={dominantPollutant}
                lastUpdated={new Date().toLocaleTimeString()}
                t={t}
              />
            </motion.div>
            <motion.div
              variants={fadeIn}
              className="absolute right-10 z-15 bg-red-600 text-white p-4 rounded-lg shadow-xl w-48 text-center"
  style={{ bottom: '110px' }}

              whileHover={{ scale: 1.05 }}
            >
              <p className="text-sm">{t("section.air_pollution_stats")}</p>
              <h6 className="text-2xl font-bold my-1">128,000</h6>
              <p className="text-sm">{t("section.deaths_pakistan")}</p>
            </motion.div>
            <motion.ul
              variants={staggerContainer}
              className="absolute bottom-4 left-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2"
            >
              {Object.entries(categoryColors).map(([key, color]) => {
                const category = aqiCategories[key];
                const rangeText = `${category.min}-${category.max}`;
                
                return (
                  <motion.li
                    key={key}
                    variants={fadeIn}
                    className="relative group p-2 rounded-lg text-center border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {categoryLabels[key]}
                    </span>
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block w-72 bg-gray-800 dark:bg-gray-900 text-white rounded-lg p-3 z-50 shadow-xl text-xs"
                    >
                      <div className="font-semibold mb-1">{categoryLabels[key]} ({rangeText})</div>
                      <p>{descriptions[key]}</p>
                      <div className="mt-1 text-gray-400">{t("health_recommendations.loading")}: {healthImpacts[key]}</div>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 w-full">
            <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-4">
              <motion.div
                variants={fadeIn}
                className="p-5 bg-cyan-50 dark:bg-cyan-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 text-center h-[140px] hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <img src={DropletIcon} alt="Droplet" className="mr-2 h-5 w-5 animate-pulse" />
                  {t("weather.humidity")}
                </h3>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">N/A</p>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="p-5 bg-blue-50 dark:bg-blue-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 text-center h-[140px] hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <img src={SpeedometerIcon} alt="Speedometer" className="mr-2 h-5 w-5 animate-pulse" />
                  {t("weather.pressure")}
                </h3>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">N/A</p>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="col-span-2 p-5 bg-gray-100 dark:bg-gray-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 text-center h-[140px] hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <h3 className="font-semibold text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  <img src={ThermometerIcon} alt="Thermometer" className="mr-2 h-5 w-5 animate-pulse" />
                  {t("weather.temperature")}
                </h3>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">N/A</p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={slideUp}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
            >
              <h3 className="font-semibold text-center mb-4 text-teal-600 dark:text-teal-500">
                {t("chart.aqi_trend")} {loading && `(${t("chart.loading")})`}
              </h3>
              <motion.div variants={staggerContainer} className="flex flex-col lg:flex-row items-center gap-4">
                <motion.div
                  variants={fadeIn}
                  className="w-full lg:w-2/5 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-3">{t("filters.title")}</h3>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t("filters.date_label")}:</label>
                  <div className="flex space-x-2 mb-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                        selectedDate === "today"
                          ? "bg-teal-600 text-white shadow-md"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => handleDateChange("today")}
                      title={t("today")}
                    >
                      <BsCalendarDay className="h-4 w-4" />
                      {t("today")}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                        selectedDate === "yesterday"
                          ? "bg-teal-600 text-white shadow-md"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => handleDateChange("yesterday")}
                      title={t("yesterday")}
                    >
                      <BsCalendarMinus className="h-4 w-4" />
                      {t("yesterday")}
                    </motion.button>
                  </div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block flex items-center gap-2">
                    <BsGeoAlt className="h-4 w-4" />
                    {t("filters.zone_label")}:
                  </label>
                  <motion.select
                    whileHover={{ scale: 1.02 }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-400 transition-all"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                  >
                    <option value={t("zone.1")}>{t("zone.1")}</option>
                    <option value={t("zone.2")}>{t("zone.2")}</option>
                    <option value={t("zone.3")}>{t("zone.3")}</option>
                    <option value={t("zone.4")}>{t("zone.4")}</option>
                  </motion.select>
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-full lg:w-3/5 h-64 border border-gray-200 dark:border-gray-600"
                >
                  {loading ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center">{t("chart.loading")}</p>
                  ) : historicalError ? (
                    <div className="text-red-500 dark:text-red-400 text-center">
                      <p>{historicalError}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchHistoricalData(selectedZone, selectedDate)}
                        className="mt-2 px-4 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center gap-2 mx-auto"
                        title={t("retry")}
                      >
                        <BsArrowRepeat className="h-5 w-5" />
                        {t("retry")}
                      </motion.button>
                    </div>
                  ) : historicalData.length > 0 ? (
                    <canvas ref={trendChartRef} className="h-full w-full"></canvas>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">{t("chart.no_data")}</p>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div variants={slideUp} className="mt-6 w-full">
            <AQIForecastChart selectedZone={selectedZone} t={t} />
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 w-full">
            <motion.div
              variants={slideUp}
              className="lg:col-span-2 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <h3 className="text-center font-semibold text-teal-600 dark:text-teal-500 mb-4">{t("pollutants.title")}</h3>
              <motion.div variants={staggerContainer} className="flex flex-wrap justify-around items-center">
                {loading ? (
                  <p className="text-gray-500 dark:text-gray-400">{t("pollutants.loading")}</p>
                ) : aqiData && aqiData.pollutants ? (
                  <>
                    <PollutantBox
                      name={t("pollutants.pm2_5")}
                      value={aqiData.pollutants.pm2_5?.value}
                      isDominant={dominantPollutant === "PM2_5"}
                    />
                    <PollutantBox
                      name={t("pollutants.pm10")}
                      value={aqiData.pollutants.pm10?.value}
                      isDominant={dominantPollutant === "PM10"}
                    />
                    <PollutantBox
                      name={t("pollutants.o3")}
                      value={aqiData.pollutants.o3?.value}
                      isDominant={dominantPollutant === "O3"}
                    />
                    <PollutantBox
                      name={t("pollutants.co")}
                      value={aqiData.pollutants.co?.value}
                      isDominant={dominantPollutant === "CO"}
                    />
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">{t("pollutants.no_data")}</p>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              variants={slideUp}
              className="p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
              style={{
                backgroundColor: categoryColors[getAqiCategory(aqiData?.overallAQI || 0)],
              }}
            >
              <h3 className="text-center font-semibold text-white text-sm mb-3">
                {loading ? t("status.loading") : categoryLabels[getAqiCategory(aqiData?.overallAQI || 0)]}
              </h3>
              <p className="text-center text-white text-sm">
                {loading
                  ? t("health_recommendations.loading")
                  : (aqiData?.overallAQI || 0) > ALERT_THRESHOLD
                  ? `${t("recommendation.dangerous")} (${aqiData?.overallAQI})`
                  : (aqiData?.overallAQI || 0) > aqiCategories.unhealthy.max
                  ? `${t("recommendation.unhealthy")} (${aqiData?.overallAQI})`
                  : (aqiData?.overallAQI || 0) > aqiCategories.moderate.max
                  ? `${t("recommendation.moderate")} (${aqiData?.overallAQI})`
                  : `${t("recommendation.good")} (${aqiData?.overallAQI})`}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default HomePage;