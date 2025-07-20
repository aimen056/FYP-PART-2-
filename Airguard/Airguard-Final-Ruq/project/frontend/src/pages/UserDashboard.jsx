import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Chart from "chart.js/auto";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchReports } from "../redux/features/repPollutionSlice";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { BsSearch, BsCalendarDay, BsCalendarMinus, BsGeoAlt, BsArrowRepeat } from "react-icons/bs";
import HomeMap from "../components/HomeMap";
import AqiCard from "../components/Home/AqiCard";
import Heatmap from "../components/Home/Heatmap";
import HealthRecommendations from "../components/HealthRecommendations";
import AQIForecastChart from "../components/AQIForecastChart";
import Chatbot from "../components/Chatbot";
import ReportPollution from "./ReportPollution";


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
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 dark:text-red-400 bg-white dark:bg-gray-900 w-full">
          <h3>{this.props.t("error.something_went_wrong")}</h3>
          <p>{this.state.error?.message || this.props.t("error.unknown")}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2 shadow-md"
          >
            <BsArrowRepeat className="h-5 w-5" />
            {this.props.t("retry")}
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

const UserDashboard = () => {
  const { t } = useTranslation();
  const [aqiData, setAqiData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedZone, setSelectedZone] = useState("Zone 1");
  const [selectedDate, setSelectedDate] = useState("today");
  const [highestAQI, setHighestAQI] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [formattedMarkers, setFormattedMarkers] = useState([]);
  const [sensorLocations, setSensorLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dominantPollutant, setDominantPollutant] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalError, setHistoricalError] = useState(null);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState(new Set());

  const gaugeChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const gaugeChartInstance = useRef(null);
  const trendChartInstance = useRef(null);
  const scrollContainerRef = useRef(null);

  const ALERT_THRESHOLD = 200;

  const categoryColors = {
    good: "#22C55E",
    moderate: "#FBBF24",
    unhealthySensitive: "#F97316",
    unhealthy: "#EF4444",
    veryUnhealthy: "#A21CAF",
    hazardous: "#7F1D1D",
  };

  const aqiCategories = {
    good: { min: 0, max: 50 },
    moderate: { min: 51, max: 100 },
    unhealthySensitive: { min: 101, max: 150 },
    unhealthy: { min: 151, max: 200 },
    veryUnhealthy: { min: 201, max: 300 },
    hazardous: { min: 301, max: 500 },
  };

  // Add category labels and descriptions
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

  const pollutantIcons = {
    pm2_5: (
      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="8" fill="#60A5FA">2.5</text></svg>
    ),
    pm10: (
      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="8" fill="#A78BFA">10</text></svg>
    ),
    o3: (
      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="8" fill="#34D399">O₃</text></svg>
    ),
    co: (
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="8" fill="#9CA3AF">CO</text></svg>
    ),
    no2: (
      <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="8" fill="#FBBF24">NO₂</text></svg>
    ),
    so2: (
      <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="8" fill="#F472B6">SO₂</text></svg>
    ),
  };

  // Replace pollutantHealthImpacts with mock data
  const pollutantHealthImpacts = {
    pm2_5: "Fine particles can penetrate deep into lungs, causing respiratory and cardiovascular issues. High exposure increases risk for asthma, heart attacks, and premature death.",
    pm10: "Inhalable particles can irritate airways, worsen asthma, and cause coughing or difficulty breathing, especially in children and elderly.",
    o3: "Ozone can trigger chest pain, coughing, throat irritation, and worsen bronchitis, emphysema, and asthma. High levels harm lung function.",
    co: "Carbon monoxide reduces oxygen delivery to organs and tissues, causing headaches, dizziness, and at high levels, can be life-threatening.",
    no2: "Nitrogen dioxide inflames airways, aggravates respiratory diseases, and increases susceptibility to lung infections.",
    so2: "Sulfur dioxide can cause throat and eye irritation, trigger asthma attacks, and reduce lung function, especially in sensitive groups.",
  };

  const PollutantBox = ({ name, data, isDominant }) => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [tooltipStyle, setTooltipStyle] = React.useState({});
    const [tooltipPosition, setTooltipPosition] = React.useState('top');
    const boxRef = React.useRef();
    const key = name.toLowerCase().replace('.', '_');

    // Position tooltip so it doesn't overflow
    React.useEffect(() => {
      if (showTooltip && boxRef.current) {
        const rect = boxRef.current.getBoundingClientRect();
        const tooltipWidth = 200; // px
        const tooltipHeight = 80; // px (approximate)
        let left = '50%';
        let translateX = '-50%';
        let position = 'top';
        // If not enough space above, show below
        if (rect.top < tooltipHeight + 12) {
          position = 'bottom';
        }
        if (rect.left < tooltipWidth / 2) {
          left = '0';
          translateX = '0';
        } else if (window.innerWidth - rect.right < tooltipWidth / 2) {
          left = '100%';
          translateX = '-100%';
        }
        setTooltipPosition(position);
        setTooltipStyle({ left, transform: `translateX(${translateX})` });
      }
    }, [showTooltip]);

    return (
    <motion.div
        ref={boxRef}
      variants={fadeIn}
        className={`relative flex flex-col items-center justify-center w-24 h-28 m-2 rounded-xl shadow-xl bg-white/70 dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
        isDominant ? "" : ""
      }`}
        whileHover={{ scale: 1.07 }}
        tabIndex={0}
        aria-label={`${name} pollutant, AQI: ${data?.aqi || 'N/A'}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        style={{ boxShadow: isDominant ? '0 4px 24px 0 rgba(255, 140, 0, 0.18)' : '0 2px 12px 0 rgba(0,0,0,0.06)' }}
      >
        {/* Floating crown/star for dominant */}
        {isDominant && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 animate-float">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="drop-shadow-lg">
              now
              <defs>
                <linearGradient id="crownGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFD700"/>
                  <stop offset="1" stopColor="#FFA500"/>
                </linearGradient>
                <filter id="crownShadow" x="-4" y="-4" width="40" height="40" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#FBBF24"/>
                </filter>
              </defs>
            </svg>
          </span>
        )}
        <div className="mb-1 drop-shadow-lg scale-90">{pollutantIcons[key]}</div>
        <h6 className="font-bold text-xs text-gray-700 dark:text-gray-200 mb-0.5 tracking-wide">{name}</h6>
        <p className="text-lg font-extrabold text-gray-900 dark:text-white drop-shadow-sm mb-0.5">{data?.aqi ?? "N/A"}</p>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">µg/m³</span>
        {/* Dominant badge: simple, new teal gradient color */}
        {isDominant && (
          <span className="absolute -top-2 right-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md font-semibold border border-white/40 dark:border-gray-900/40" style={{filter:'blur(0px)'}}>Dominant</span>
        )}
        {/* Tooltip: show above or below based on available space */}
        {showTooltip && (
          <div
            className={`absolute z-[1000] ${tooltipPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} w-[200px] bg-white/95 dark:bg-gray-900/95 text-gray-800 dark:text-gray-100 rounded-xl p-3 shadow-2xl text-xs font-medium border border-gray-200 dark:border-gray-700 pointer-events-none animate-fade-in`}
            style={{ ...tooltipStyle, transition: 'opacity 0.2s', opacity: showTooltip ? 1 : 0 }}
          >
            {pollutantHealthImpacts[key]}
          </div>
        )}
    </motion.div>
  );
  };

  const getDominantPollutant = (pollutants) => {
    if (!pollutants) return null;
    const pollutantValues = [
      { name: "pm2_5", value: pollutants.pm2_5?.aqi || 0 },
      { name: "pm10", value: pollutants.pm10?.aqi || 0 },
      { name: "o3", value: pollutants.o3?.aqi || 0 },
      { name: "co", value: pollutants.co?.aqi || 0 },
      { name: "no2", value: pollutants.no2?.aqi || 0 },
      { name: "so2", value: pollutants.so2?.aqi || 0 },
    ];
    pollutantValues.sort((a, b) => b.value - a.value);
    return pollutantValues[0]?.name || null;
  };

  const getAqiCategory = (aqi) => {
    for (const [category, range] of Object.entries(aqiCategories)) {
      if (aqi >= range.min && aqi <= range.max) {
        return category;
      }
    }
    return "hazardous";
  };

  const locationToZoneMapping = {
    "Zone 1": { lat: [24.8, 25.0], lon: [67.0, 67.2] },
    "Zone 2": { lat: [33.6, 33.8], lon: [73.0, 73.2] },
    "Zone 3": { lat: [31.5, 31.7], lon: [74.3, 74.5] },
    "Zone 4": { lat: [34.0, 34.2], lon: [71.5, 71.7] },
  };

  // Transform historicalData into the format expected by Heatmap
  const heatmapData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    // Create a more comprehensive dataset for the heatmap
    const zones = ["Zone 1", "Zone 2", "Zone 3", "Zone 4"];
    const heatmapData = [];

    // Add current zone data
    historicalData.forEach((item) => {
      heatmapData.push({
      x: new Date(item.timestamp).toLocaleDateString(),
      y: selectedZone,
      value: item.aqi || 0,
        timestamp: item.timestamp,
      });
    });

    // Add sample data for other zones to demonstrate multi-zone functionality
    // In a real implementation, you would fetch data for all zones
    zones.forEach((zone) => {
      if (zone !== selectedZone) {
        // Generate sample data for demonstration
        const baseAQI = Math.random() * 100 + 50; // Random base AQI between 50-150
        historicalData.forEach((item, index) => {
          const variation = (Math.random() - 0.5) * 30; // ±15 variation
          heatmapData.push({
            x: new Date(item.timestamp).toLocaleDateString(),
            y: zone,
            value: Math.max(0, Math.round(baseAQI + variation)),
            timestamp: item.timestamp,
          });
        });
      }
    });

    return heatmapData;
  }, [historicalData, selectedZone]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const zone = Object.keys(locationToZoneMapping).find((zone) => zone.toLowerCase() === query);
    if (zone) {
      setSelectedZone(zone);
    } else {
      toast.error(t("error.zone_not_found"));
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError(t("error.no_token"));
          return;
        }
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setUserData(response.data);
        } else {
          setError(t("error.profile_fetch_failed"));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(t("error.profile_fetch_failed") + ": " + error.message);
      }
    };

    const fetchAqiData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:5002/api/data/latest", {
          params: userData?.city ? { city: userData.city } : { zone: selectedZone },
        });
        const currentData = response.data;
        if (!currentData) throw new Error(t("error.no_data"));

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
        };

        setAqiData(newAqiData);
        setHighestAQI(currentData.aqi);
        setDominantPollutant(getDominantPollutant(newAqiData.pollutants));
        await fetchHistoricalData(userData?.city || selectedZone, selectedDate);
      } catch (error) {
        console.error("Error fetching AQI data:", error);
        setError(t("error.aqi_fetch_failed"));
        setAqiData({
          overallAQI: 0,
          pollutants: {
            pm2_5: { aqi: 0, value: 0 },
            pm10: { aqi: 0, value: 0 },
            o3: { aqi: 0, value: 0 },
            co: { aqi: 0, value: 0 },
            no2: { aqi: 0, value: 0 },
            so2: { aqi: 0, value: 0 },
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchAqiData();
    const interval = setInterval(fetchAqiData, 60000);
    return () => clearInterval(interval);
  }, [userData?.city, selectedZone, selectedDate, t]);

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
          setSelectedZone("Zone 1");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setSelectedZone("Zone 1");
    }
  }, [t]);

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
    setSelectedZone("Zone 1");
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
        setSensorLocations([]);
        setFormattedMarkers([]);
      }
    };
    fetchSensorLocations();
  }, [t]);

  const fetchHistoricalData = async (zone, dateFilter) => {
    try {
      setLoading(true);
      setHistoricalError(null);
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

      const response = await axios.get("http://localhost:5002/api/aggregated", {
        params: { zone, startDate, endDate },
      });

      const processedData = response.data.map((item) => ({
        timestamp: item.intervalStart || new Date().toISOString(),
        aqi: item.aqi || 0,
      }));
      setHistoricalData(processedData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setHistoricalData([]);
      setHistoricalError(
        error.response?.status === 404
          ? t("error.historical_data_not_available", { zone })
          : t("error.historical_data_failed", { message: error.message })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gaugeChartInstance.current) gaugeChartInstance.current.destroy();

    if (gaugeChartRef.current) {
      gaugeChartInstance.current = new Chart(gaugeChartRef.current, {
        type: "doughnut",
        data: {
          labels: Object.keys(categoryColors),
          datasets: [
            {
              data: Object.values(aqiCategories).map(() => 100 / Object.keys(aqiCategories).length),
              backgroundColor: Object.values(categoryColors),
              borderWidth: 0,
            },
          ],
        },
        options: {
          rotation: 270,
          circumference: 180,
          cutout: "80%",
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
        },
      });
    }

    const chartData = historicalData.length > 0 ? historicalData : [];
    const formattedLabels = chartData.map((data) =>
      new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    if (trendChartInstance.current) trendChartInstance.current.destroy();

    if (trendChartRef.current && chartData.length > 0 && !historicalError) {
      trendChartInstance.current = new Chart(trendChartRef.current, {
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
  }, [aqiData, historicalData, historicalError, t]);

  const dispatch = useDispatch();
  const { pollutions, status } = useSelector((state) => state.pollution);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const scrollReports = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const userReports = pollutions.filter((r) => r?.user === user?.name);

  // Reference to the ReportPollution form (if rendered as a modal or child)
  const reportPollutionRef = useRef();

  const handleEdit = (report) => {
    // If ReportPollution is rendered as a modal or child, call its edit handler directly
    if (reportPollutionRef.current && reportPollutionRef.current.handleEdit) {
      reportPollutionRef.current.handleEdit(report);
    } else {
      // Fallback: navigate to the report page with the report ID for editing
    window.location.href = `/report?edit=${report._id}`;
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm(t("reports.confirm_delete"))) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`http://localhost:5002/api/reports/${reportId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          toast.success(t("reports.report_deleted"));
          dispatch(fetchReports()); // Refresh reports after deletion
        } else {
          toast.error(t("reports.delete_failed"));
        }
      } catch (error) {
        console.error("Error deleting report:", error);
        toast.error(t("reports.delete_failed") + ": " + error.message);
      }
    }
  };

  const toggleCard = (cardType) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardType)) {
        newSet.delete(cardType);
      } else {
        newSet.add(cardType);
      }
      return newSet;
    });
  };

  // Compute highest AQI category for emergency alert
  const highestAqiCategory = getAqiCategory(highestAQI);

  // Debug: Log AQI and category
  console.log("highestAQI", highestAQI, "category", highestAqiCategory);

  return (
    <ErrorBoundary t={t}>
      <motion.div
        className="pt-16 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 text-gray-800 dark:text-white"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <style>
          {`
            .dashboard-container {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 1.5rem;
              max-width: 1400px;
              margin: 0 auto;
            }
            @media (max-width: 1200px) {
              .dashboard-container {
                grid-template-columns: 1fr 1fr;
              }
            }
            @media (max-width: 768px) {
              .dashboard-container {
                grid-template-columns: 1fr;
              }
            }
            .modern-card {
              background: rgba(255, 255, 255, 0.9);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(148, 163, 184, 0.2);
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
            }
            .dark .modern-card {
              background: rgba(30, 41, 59, 0.8);
              border: 1px solid rgba(148, 163, 184, 0.1);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            .modern-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
              border-color: rgba(139, 92, 246, 0.3);
            }
            .dark .modern-card:hover {
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }
            .accent-gradient {
              background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%);
            }
            .neon-glow {
              box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
            }
            .pollutant-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 1rem;
            }
            .pollutant-item {
              background: rgba(248, 250, 252, 0.8);
              border: 1px solid rgba(148, 163, 184, 0.3);
              border-radius: 12px;
              padding: 1rem;
              text-align: center;
              transition: all 0.3s ease;
            }
            .dark .pollutant-item {
              background: rgba(51, 65, 85, 0.6);
              border: 1px solid rgba(148, 163, 184, 0.2);
            }
            .pollutant-item:hover {
              background: rgba(241, 245, 249, 0.9);
              border-color: rgba(139, 92, 246, 0.5);
              transform: scale(1.05);
            }
            .dark .pollutant-item:hover {
              background: rgba(71, 85, 105, 0.8);
            }
            .dominant-pollutant {
              background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
              border-color: rgba(139, 92, 246, 0.6);
              box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
            }
            .dark .dominant-pollutant {
              background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2));
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1rem;
            }
            .stat-card {
              background: rgba(248, 250, 252, 0.6);
              border-radius: 12px;
              padding: 1.5rem;
              text-align: center;
              border: 1px solid rgba(148, 163, 184, 0.2);
            }
            .dark .stat-card {
              background: rgba(51, 65, 85, 0.4);
              border: 1px solid rgba(148, 163, 184, 0.1);
            }
            .chart-container {
              background: rgba(248, 250, 252, 0.8);
              border-radius: 12px;
              padding: 1rem;
              border: 1px solid rgba(148, 163, 184, 0.2);
            }
            .dark .chart-container {
              background: rgba(30, 41, 59, 0.6);
              border: 1px solid rgba(148, 163, 184, 0.1);
            }
            .floating-header {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              border-bottom: 1px solid rgba(148, 163, 184, 0.2);
            }
            .dark .floating-header {
              background: rgba(15, 23, 42, 0.9);
              border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            }
            .health-card {
              background: rgba(248, 250, 252, 0.6);
              border-radius: 12px;
              padding: 1rem;
              border: 1px solid rgba(148, 163, 184, 0.2);
            }
            .dark .health-card {
              background: rgba(51, 65, 85, 0.4);
              border: 1px solid rgba(148, 163, 184, 0.1);
            }
          `}
        </style>

        {/* Modern Header */}
        <motion.header
          variants={fadeIn}
          className="floating-header py-4 px-6"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="flex items-center gap-3 mb-2 lg:mb-0">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-lg">🌤️</span>
              </div>
              <h1 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {t("header.title")}
              </h1>
            </div>
              <motion.form
                variants={fadeIn}
                onSubmit={handleSearch}
                className="flex items-center gap-3 w-full lg:w-auto"
              >
                <div className="flex items-center w-full lg:w-80 gap-2">
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/80 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder={t("search.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center shadow-md"
                    title={t("search.button")}
                  >
                    <BsSearch className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.form>
          </div>
        </motion.header>

        {error && (
          <motion.div
            variants={fadeIn}
            className="mx-6 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-500/30 rounded-xl text-yellow-800 dark:text-yellow-200"
          >
            <p>{error}</p>
          </motion.div>
        )}

        <div className="p-6">
          <div className="dashboard-container">
                        {/* Map with AQI Card Overlay */}
            <motion.div variants={slideUp} className="modern-card p-6 col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {t("greeting", { name: user?.name || "User" })}
                  </h2>
                  <p className="text-gray-600 dark:text-slate-300">Air Quality Map</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-slate-400">Last Updated</div>
                  <div className="text-sm text-gray-700 dark:text-slate-300">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
              
              <div className="relative h-96 rounded-xl overflow-hidden">
                <HomeMap markers={formattedMarkers} fullscreen={false} />
                <div className="absolute top-4 left-4 z-10">
                  <AqiCard
                    aqiData={aqiData}
                    highestAQI={aqiData?.overallAQI || highestAQI}
                    categoryColors={categoryColors}
                    getAqiCategory={getAqiCategory}
                    selectedZone={selectedZone}
                  />
                </div>
              </div>
              
              {/* Category Legend */}
              <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(categoryColors).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-gray-700 dark:text-slate-300">{categoryLabels[key]}</span>
                        </div>
                ))}
              </div>
            </motion.div>

            {/* Health Recommendations Cards */}
            <motion.div variants={slideUp} className="modern-card p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Health Insights
                <div className="relative group">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <p>Quick health insights based on current air quality. Get immediate advice on activities, health tips, and safety recommendations for today's conditions.</p>
                    </div>
                  </div>
              </h3>
              
              <div className="space-y-4">
                {/* Current AQI Status */}
                <div className="health-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">💚</span>
                    </div>
                    <div>
                      <h4 className="text-gray-800 dark:text-white font-semibold">Current Status</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">{t(`category.${getAqiCategory(highestAQI)}`)}</p>
                  </div>
                  </div>
                  <p className="text-gray-700 dark:text-slate-300 text-sm">
                      {highestAQI > ALERT_THRESHOLD
                      ? "Air quality is hazardous. Avoid outdoor activities and use air purifiers indoors."
                        : highestAQI > aqiCategories.unhealthy.max
                      ? "Air quality is unhealthy. Limit outdoor activities, especially for sensitive groups."
                        : highestAQI > aqiCategories.moderate.max
                      ? "Air quality is moderate. Sensitive individuals should consider reducing outdoor activities."
                      : "Air quality is good. Enjoy outdoor activities safely."}
                  </p>
                </div>

                {/* Health Tips */}
                <div className="health-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">💡</span>
                    </div>
                    <div>
                      <h4 className="text-gray-800 dark:text-white font-semibold">Health Tips</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">Stay healthy today</p>
                    </div>
                  </div>
                  <ul className="text-gray-700 dark:text-slate-300 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Stay hydrated and maintain good indoor air circulation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Consider wearing a mask if air quality is poor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Monitor symptoms if you have respiratory conditions</span>
                    </li>
                  </ul>
                </div>

                {/* Activity Recommendations */}
                <div className="health-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🏃</span>
                    </div>
                    <div>
                      <h4 className="text-gray-800 dark:text-white font-semibold">Activities</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">Recommended for today</p>
                    </div>
                  </div>
                  <div className="text-gray-700 dark:text-slate-300 text-sm">
                    {highestAQI > ALERT_THRESHOLD ? (
                      <span className="text-red-600 dark:text-red-400">❌ Avoid outdoor activities</span>
                    ) : highestAQI > aqiCategories.unhealthy.max ? (
                      <span className="text-yellow-600 dark:text-yellow-400">⚠️ Limit outdoor activities</span>
                    ) : highestAQI > aqiCategories.moderate.max ? (
                      <span className="text-orange-600 dark:text-orange-400">🤔 Moderate outdoor activities</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">✅ Safe for outdoor activities</span>
                    )}
                  </div>
                </div>


              </div>
                  </motion.div>

            {/* Personalized Health Recommendations - Accordion Style */}
            {userData && userData.wantsAlerts && (
              <motion.div variants={slideUp} className="modern-card p-4 relative">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Your Personalized Health Plan
                  <div className="relative group">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <p>Get personalized health advice based on your age, medical conditions, and current air quality. Each category provides specific recommendations to protect your health.</p>
                </div>
                  </div>
                </h3>
                <div className="space-y-3">
                  {/* Only show sections based on userData.diseases, or all if none selected */}
                  {((userData.diseases && userData.diseases.length === 0) || !userData.diseases) && (
                    <div className="health-card p-3 text-gray-700 dark:text-slate-300">
                      <p>No specific health conditions selected. Here are general recommendations for everyone:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Stay hydrated and maintain good indoor air circulation.</li>
                        <li>Consider wearing a mask if air quality is poor.</li>
                        <li>Monitor symptoms if you have respiratory or heart conditions.</li>
                        <li>Limit outdoor activities during high pollution days.</li>
                      </ul>
                    </div>
                  )}
                  {userData.diseases && userData.diseases.includes('Respiratory conditions') && (
                    <motion.div 
                      className="health-card"
                      initial={false}
                    >
                      <div 
                        className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => toggleCard('respiratory')}
                      >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🫁</span>
                </div>
                        <div>
                          <h4 className="text-gray-800 dark:text-white font-semibold">Respiratory Health</h4>
                          <p className="text-gray-600 dark:text-slate-400 text-sm">Lung & breathing care</p>
                        </div>
                      </div>
                          <motion.svg 
                            className="w-5 h-5 text-gray-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ rotate: expandedCards.has('respiratory') ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </motion.svg>
                    </div>
                               </div>
                    </motion.div>
                  )}
                  {userData.diseases && userData.diseases.includes('Cardiovascular disease') && (
                    <motion.div 
                      className="health-card"
                      initial={false}
                    >
                      <div 
                        className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => toggleCard('heart')}
                      >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">❤️</span>
                        </div>
                        <div>
                          <h4 className="text-gray-800 dark:text-white font-semibold">Heart Health</h4>
                          <p className="text-gray-600 dark:text-slate-400 text-sm">Cardiovascular care</p>
                        </div>
                      </div>
                          <motion.svg 
                            className="w-5 h-5 text-gray-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ rotate: expandedCards.has('heart') ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </motion.svg>
                    </div>
                               </div>
                    </motion.div>
                  )}
                  {userData.diseases && userData.diseases.includes('Chronic Diseases & Other Conditions') && (
                    <motion.div 
                      className="health-card"
                      initial={false}
                    >
                      <div 
                        className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => toggleCard('chronic')}
                      >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🏥</span>
                        </div>
                        <div>
                          <h4 className="text-gray-800 dark:text-white font-semibold">Chronic Conditions</h4>
                          <p className="text-gray-600 dark:text-slate-400 text-sm">Diabetes, inflammation & more</p>
                        </div>
                      </div>
                          <motion.svg 
                            className="w-5 h-5 text-gray-500" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ rotate: expandedCards.has('chronic') ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </motion.svg>
                    </div>
                               </div>
                    </motion.div>
                     )}
                  </div>

                {/* Modal overlays positioned relative to the parent card */}
                {expandedCards.has('respiratory') && (
                  <div className="absolute inset-0 z-[999999] flex items-center justify-center bg-black/20 rounded-xl">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl shadow-2xl max-w-md w-full mx-4"
                      style={{ maxHeight: '80vh', overflowY: 'auto' }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm">🫁</span>
                            </div>
                            <div>
                              <h4 className="text-gray-800 dark:text-white font-semibold">Respiratory Health</h4>
                              <p className="text-gray-600 dark:text-slate-400 text-sm">Asthma, COPD & more</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleCard('respiratory')}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 text-2xl font-bold"
                          >
                            &times;
                          </button>
                        </div>
                        {/* AQI health info for respiratory */}
                        <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 text-sm font-medium">
                          {(() => {
                            const cat = getAqiCategory(highestAQI);
                            if (cat === 'good') return 'Air quality is excellent. No impact on respiratory health. Enjoy outdoor activities! (EPA/WHO)';
                            if (cat === 'moderate') return 'Air quality is acceptable. If you have asthma or lung disease, consider reducing prolonged outdoor exertion. (EPA/WHO)';
                            if (cat === 'unhealthySensitive') return 'People with asthma or lung disease: Limit outdoor activity, avoid heavy exercise, and monitor for symptoms. (EPA/WHO)';
                            if (cat === 'unhealthy') return 'Increased risk of symptoms for those with lung disease. Avoid outdoor exertion, stay indoors, and monitor your health. (EPA/WHO)';
                            if (cat === 'veryUnhealthy') return 'Serious risk: Everyone, especially those with lung disease, should avoid all outdoor activity. Remain indoors and seek care if symptoms worsen. (EPA/WHO)';
                            return 'Emergency: Dangerous air for respiratory health. Remain indoors, keep activity low, and seek immediate medical help if you have symptoms. (EPA/WHO)';
                          })()}
                        </div>
                         <div className="text-gray-700 dark:text-slate-300 text-sm space-y-2">
                          <p>• Use inhalers as prescribed during high AQI.</p>
                          <p>• Avoid outdoor exercise if air is poor.</p>
                          <p>• See a doctor if breathing worsens.</p>
                          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <h5 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">What's Affected:</h5>
                            <ul className="space-y-1 text-sm">
                              <li>Asthma attacks</li>
                              <li>COPD flare-ups</li>
                              <li>Bronchitis</li>
                              <li>Shortness of breath</li>
                            </ul>
                               </div>
                               </div>
                         </div>
                    </motion.div>
                       </div>
                     )}

                {expandedCards.has('heart') && (
                  <div className="absolute inset-0 z-[999999] flex items-center justify-center bg-black/20 rounded-xl">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-xl shadow-2xl max-w-md w-full mx-4"
                      style={{ maxHeight: '80vh', overflowY: 'auto' }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm">❤️</span>
                        </div>
                        <div>
                              <h4 className="text-gray-800 dark:text-white font-semibold">Heart Health</h4>
                              <p className="text-gray-600 dark:text-slate-400 text-sm">Heart disease & more</p>
                        </div>
                      </div>
                          <button
                            onClick={() => toggleCard('heart')}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-300 text-2xl font-bold"
                          >
                            &times;
                          </button>
                    </div>
                        {/* AQI health info for heart */}
                        <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-200 text-sm font-medium">
                          {(() => {
                            const cat = getAqiCategory(highestAQI);
                            if (cat === 'good') return 'Air quality is excellent. No impact on heart health. Enjoy outdoor activities! (EPA/WHO)';
                            if (cat === 'moderate') return 'Air quality is acceptable. If you have heart disease, consider reducing prolonged or heavy exertion outdoors. (EPA/WHO)';
                            if (cat === 'unhealthySensitive') return 'People with heart disease: Limit outdoor activity, avoid strenuous exercise, and monitor for chest pain or palpitations. (EPA/WHO)';
                            if (cat === 'unhealthy') return 'Increased risk of heart symptoms for those with heart disease. Avoid outdoor exertion, stay indoors, and monitor your condition. (EPA/WHO)';
                            if (cat === 'veryUnhealthy') return 'Serious risk: Everyone, especially those with heart disease, should avoid all outdoor activity. Remain indoors and seek care if symptoms worsen. (EPA/WHO)';
                            return 'Emergency: Dangerous air for heart health. Remain indoors, keep activity low, and seek immediate medical help if you have symptoms. (EPA/WHO)';
                          })()}
                        </div>
                         <div className="text-gray-700 dark:text-slate-300 text-sm space-y-2">
                          <p>• Monitor blood pressure more often during high AQI.</p>
                          <p>• Avoid strenuous outdoor activities.</p>
                          <p>• Seek care if chest pain or palpitations occur.</p>
                          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <h5 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">What's Affected:</h5>
                            <ul className="space-y-1 text-sm">
                              <li>Heart attacks</li>
                              <li>Arrhythmias</li>
                              <li>Chest pain</li>
                              <li>High blood pressure</li>
                            </ul>
                               </div>
                               </div>
                         </div>
                    </motion.div>
                       </div>
                     )}

                {expandedCards.has('chronic') && (
                  <div className="absolute inset-0 z-[999999] flex items-center justify-center bg-black/20 rounded-xl">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-800 rounded-xl shadow-2xl max-w-md w-full mx-4"
                      style={{ maxHeight: '80vh', overflowY: 'auto' }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm">🏥</span>
                          </div>
                          <div>
                              <h4 className="text-gray-800 dark:text-white font-semibold">Chronic Conditions</h4>
                              <p className="text-gray-600 dark:text-slate-400 text-sm">Diabetes, inflammation & more</p>
                          </div>
                        </div>
                          <button
                            onClick={() => toggleCard('chronic')}
                            className="text-gray-400 hover:text-orange-600 dark:hover:text-orange-300 text-2xl font-bold"
                          >
                            &times;
                          </button>
                      </div>
                        {/* AQI health info for chronic */}
                        <div className="mb-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200 text-sm font-medium">
                          {(() => {
                            const cat = getAqiCategory(highestAQI);
                            if (cat === 'good') return 'Air quality is excellent. No impact on chronic conditions. Enjoy outdoor activities! (EPA/WHO)';
                            if (cat === 'moderate') return 'Air quality is acceptable. If you have diabetes or other chronic conditions, consider reducing prolonged outdoor exertion. (EPA/WHO)';
                            if (cat === 'unhealthySensitive') return 'People with chronic conditions: Limit outdoor activity, avoid heavy exercise, and monitor for symptoms. (EPA/WHO)';
                            if (cat === 'unhealthy') return 'Increased risk of symptoms for those with chronic conditions. Avoid outdoor exertion, stay indoors, and monitor your health. (EPA/WHO)';
                            if (cat === 'veryUnhealthy') return 'Serious risk: Everyone, especially those with chronic conditions, should avoid all outdoor activity. Remain indoors and seek care if symptoms worsen. (EPA/WHO)';
                            return 'Emergency: Dangerous air for chronic conditions. Remain indoors, keep activity low, and seek immediate medical help if you have symptoms. (EPA/WHO)';
                          })()}
                        </div>
                          <div className="text-gray-700 dark:text-slate-300 text-sm space-y-2">
                          <p>• Monitor your condition more closely during high AQI days.</p>
                          <p>• Stay indoors and use air purifiers if possible.</p>
                          <p>• Contact your healthcare provider if symptoms worsen.</p>
                          
                          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <h5 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Chronic Conditions Affected:</h5>
                            <ul className="space-y-1 text-sm">
                              <li><strong>Diabetes:</strong> Worsens blood sugar control</li>
                              <li><strong>Autoimmune:</strong> Lupus, arthritis, MS flare-ups</li>
                              <li><strong>Kidney/Liver:</strong> Function decline</li>
                              <li><strong>Mental Health:</strong> Depression, anxiety</li>
                              <li><strong>IBD:</strong> Crohn's, colitis symptoms</li>
                            </ul>
                              </div>
                              </div>
                          </div>
                    </motion.div>
                        </div>
                      )}
            </motion.div>
            )}

            {/* Pollutants Grid */}
            <motion.div variants={slideUp} className="modern-card p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                {t("pollutants.title")}
                <div className="relative group">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <p className="font-semibold mb-2">What are these pollutants?</p>
                    <ul className="space-y-1">
                      <li><strong>PM2.5:</strong> Tiny particles that can enter your lungs and bloodstream</li>
                      <li><strong>PM10:</strong> Larger particles that irritate your nose and throat</li>
                      <li><strong>O₃ (Ozone):</strong> Gas that forms in sunlight, irritates lungs</li>
                      <li><strong>CO (Carbon Monoxide):</strong> Gas from vehicles, reduces oxygen in blood</li>
                      <li><strong>NO₂:</strong> Gas from traffic and industry, causes breathing problems</li>
                      <li><strong>SO₂:</strong> Gas from burning fuels, irritates airways</li>
                    </ul>
                  </div>
                </div>
              </h3>
              <div className="pollutant-grid">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="pollutant-item animate-pulse">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded mb-1"></div>
                      <div className="h-6 bg-gray-300 dark:bg-slate-600 rounded"></div>
                </div>
                  ))
                ) : aqiData ? (
                  <>
                    {[
                      { key: "pm2_5", icon: "🌫️", label: "PM2.5" },
                      { key: "pm10", icon: "💨", label: "PM10" },
                      { key: "o3", icon: "☁️", label: "O₃" },
                      { key: "co", icon: "🚗", label: "CO" },
                      { key: "no2", icon: "🏭", label: "NO₂" },
                      { key: "so2", icon: "⚡", label: "SO₂" },
                    ].map(({ key, icon, label }) => {
                      if (!aqiData.pollutants[key]) return null;
                      const aqi = aqiData.pollutants[key]?.aqi ?? null;
                      const category = aqi !== null ? getAqiCategory(aqi) : null;
                      // Define pastel background colors for each category
                      const pastelCategoryBg = {
                        good: '#d1fae5', // emerald-100
                        moderate: '#fef9c3', // yellow-100
                        unhealthySensitive: '#fde68a', // orange-100
                        unhealthy: '#fecaca', // red-100
                        veryUnhealthy: '#f3e8ff', // purple-100
                        hazardous: '#fee2e2', // rose-100
                      };
                      const tooltipBg = category ? pastelCategoryBg[category] : '#f3f4f6';
                      return (
                        <div
                          key={key}
                          className={`pollutant-item ${dominantPollutant === key ? "dominant-pollutant" : ""} group relative`}
                        >
                          <div className="text-2xl mb-2">{icon}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-400">{label}</div>
                          <div className="text-xl font-bold text-gray-800 dark:text-white">{aqi !== null ? aqi : "N/A"}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">AQI</div>
                          {/* Tooltip */}
                          <div
                            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ background: tooltipBg }}
                          >
                            <div className="mb-1">
                              <span className="font-semibold">Category: </span>
                              <span>{category ? categoryLabels[category] : "N/A"}</span>
                    </div>
                            <div>
                              {pollutantHealthImpacts[key]}
                    </div>
                    </div>
                    </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-slate-400 col-span-full text-center">{t("pollutants.no_data")}</p>
                )}
              </div>
            </motion.div>

            {/* AQI Trend Chart */}
            <motion.div variants={slideUp} className="modern-card p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t("chart.aqi_trend")}
                <div className="relative group">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <p>View how air quality has changed over the last 24 hours. This helps you understand patterns and plan your activities based on historical trends.</p>
                  </div>
                </div>
              </h3>
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedDate("today")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDate === "today"
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedDate("yesterday")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDate === "yesterday"
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-700"
                  }`}
                >
                  Yesterday
                </button>
                <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                  className="px-3 py-2 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg text-sm border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Zone 1">{t("zone.1")}</option>
                    <option value="Zone 2">{t("zone.2")}</option>
                    <option value="Zone 3">{t("zone.3")}</option>
                    <option value="Zone 4">{t("zone.4")}</option>
                </select>
              </div>
              
              <div className="chart-container h-64">
                  {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                  ) : historicalError ? (
                  <div className="text-center text-red-600 dark:text-red-400">
                    <p className="mb-2">{historicalError}</p>
                    <button
                        onClick={() => fetchHistoricalData(userData?.city || selectedZone, selectedDate)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                      Retry
                    </button>
                    </div>
                  ) : historicalData.length > 0 ? (
                    <canvas ref={trendChartRef} className="h-full w-full"></canvas>
                  ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-slate-400">
                    No data available
              </div>
                )}
              </div>
            </motion.div>

            {/* AQI Forecast */}
            <motion.div variants={slideUp} className="modern-card p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  {t("section.aqi_forecast")}
                  <div className="relative group">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <p>See predicted air quality for the next few days. Use this to plan outdoor activities, travel, or health precautions in advance.</p>
                </div>
                  </div>
              </h3>
              <div className="chart-container">
                  <AQIForecastChart selectedZone={selectedZone} />
              </div>
            </motion.div>

            {/* Heatmap - 2 Column Grid */}
            <motion.div
              variants={slideUp}
              className={`modern-card p-4 ${userData && userData.wantsAlerts ? 'col-span-2' : 'col-span-3'}`}
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  {t("section.heatmap")}
                  <div className="relative group">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <p>Visual map showing air quality across different zones. Darker colors indicate worse air quality. Use this to identify cleaner areas for activities.</p>
                    </div>
                  </div>
              </h3>
              <div className="chart-container">
                  {loading ? (
                  <div className="flex items-center justify-center h-24 text-gray-500 dark:text-slate-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  </div>
                  ) : historicalError ? (
                  <div className="text-center text-red-600 dark:text-red-400 p-4">
                    <p className="mb-2 text-sm">{historicalError}</p>
                    <button
                        onClick={() => fetchHistoricalData(userData?.city || selectedZone, selectedDate)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                      Retry
                    </button>
                    </div>
                  ) : (
                    <Heatmap data={heatmapData} selectedZone={selectedZone} />
                  )}
              </div>
            </motion.div>

            {/* Pollution Reports */}
            <motion.div variants={slideUp} className="modern-card p-6 col-span-2">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {t("section.pollution_reports")}
                <div className="relative group">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <p>View your submitted pollution reports and their verification status. Help the community by reporting pollution incidents you observe.</p>
                  </div>
                </div>
              </h3>
              
              {status === "loading" ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : userReports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-slate-400 mb-4">{t("reports.empty")}</p>
                  <NavLink 
                    to="/report" 
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all"
                  >
                    {t("reports.report_now")}
                  </NavLink>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentReportIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentReportIndex === 0}
                    className="p-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex-1 bg-gray-100 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{t("reports.pollution_type")}</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{t(`pollution_type.${userReports[currentReportIndex].pollutionType}`)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{t("location")}</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {userReports[currentReportIndex]?.location && userReports[currentReportIndex].location.length > 40
                            ? userReports[currentReportIndex].location.slice(0, 40) + '...'
                            : userReports[currentReportIndex].location}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{t("reports.date")}</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{userReports[currentReportIndex]?.date}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                          className={`px-3 py-1 text-sm rounded-full ${
                                    userReports[currentReportIndex]?.verificationStatus === "verified"
                              ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border border-green-500/30"
                                      : userReports[currentReportIndex]?.verificationStatus === "rejected"
                              ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-500/30"
                              : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30"
                                  }`}
                                >
                                  {userReports[currentReportIndex]?.verificationStatus === "verified"
                                    ? "Verified"
                                    : userReports[currentReportIndex]?.verificationStatus === "rejected"
                                    ? "Rejected"
                                    : "Pending"}
                                </span>
                                {userReports[currentReportIndex]?.verificationStatus === "rejected" && (
                                  <button
                                    onClick={() => handleEdit(userReports[currentReportIndex])}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                  >
                            Edit
                                  </button>
                                )}
                              </div>
                            </div>
                    
                            {userReports[currentReportIndex]?.verificationStatus === "rejected" && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Rejection Reason:</p>
                                <p className="text-sm text-red-700 dark:text-red-300">
                          {userReports[currentReportIndex].rejectionComment || "No specific reason provided."}
                                </p>
                            </div>
                            )}
                    
                    <div className="mt-4 text-center text-sm text-gray-500 dark:text-slate-400">
                      {currentReportIndex + 1} of {userReports.length}
                          </div>
                              </div>
                  
                  <button
                    onClick={() => setCurrentReportIndex((prev) => Math.min(prev + 1, userReports.length - 1))}
                    disabled={currentReportIndex === userReports.length - 1}
                    className="p-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={slideUp} className="modern-card p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                {t("section.leaderboard")}
                <div className="relative group">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <p>See top community contributors who report pollution incidents. Verified reports help improve air quality monitoring and community awareness.</p>
                  </div>
                </div>
              </h3>
              <div className="w-full">
                {(() => {
                  // Count verified reports per user and their pollution types
                  const userStats = {};
                  pollutions.forEach(r => {
                    if (r.user && r.verificationStatus === "verified") {
                      if (!userStats[r.user]) userStats[r.user] = { count: 0, types: {}, first: r.date };
                      userStats[r.user].count++;
                      if (r.pollutionType) userStats[r.user].types[r.pollutionType] = (userStats[r.user].types[r.pollutionType] || 0) + 1;
                      if (!userStats[r.user].first || new Date(r.date) < new Date(userStats[r.user].first)) userStats[r.user].first = r.date;
                    }
                  });
                  const totalReports = Object.values(userStats).reduce((sum, u) => sum + u.count, 0);
                  const totalUsers = Object.keys(userStats).length;
                  const sorted = Object.entries(userStats).sort((a, b) => b[1].count - a[1].count);
                  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?';
                  const trophy = [
                    <span key="gold" title="1st" className="ml-1 text-yellow-400">🥇</span>,
                    <span key="silver" title="2nd" className="ml-1 text-gray-400">🥈</span>,
                    <span key="bronze" title="3rd" className="ml-1 text-amber-700">🥉</span>
                  ];
                  const currentUser = user?.name;
                  const userRank = sorted.findIndex(([u]) => u === currentUser);
                  return (
                    <>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>Reporters: <span className="font-semibold text-blue-600 dark:text-blue-400">{totalUsers}</span></span>
                        <span>Verified: <span className="font-semibold text-green-600 dark:text-green-400">{totalReports}</span></span>
                      </div>
                      <ol className="space-y-1">
                        {sorted.slice(0, 5).map(([username, stat], idx) => {
                          const isCurrent = username === currentUser;
                          return (
                            <li
                              key={username}
                              className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-shadow ${isCurrent ? 'ring-2 ring-blue-400 dark:ring-blue-300' : ''} ${!isCurrent ? 'hover:shadow-md' : ''}`}
                            >
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base border-2 ${idx === 0 ? 'border-yellow-400' : idx === 1 ? 'border-gray-400' : idx === 2 ? 'border-amber-700' : 'border-slate-300 dark:border-slate-700'} bg-slate-100 dark:bg-slate-800 text-blue-900 dark:text-blue-100`}>
                                {getInitials(username)}
                              </span>
                              <span className="w-6 text-center text-lg">
                                {trophy[idx] || <span className="text-xs text-gray-400">{idx + 1}</span>}
                              </span>
                              <span className="flex-1 truncate font-medium text-gray-800 dark:text-white text-sm">{username}</span>
                              <span className="ml-auto px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">{stat.count}</span>
                            </li>
                          );
                        })}
                      </ol>
                      {userRank >= 5 && (
                        <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 text-xs flex items-center gap-2 ring-2 ring-blue-300 dark:ring-blue-700">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-base border-2 border-blue-400 dark:border-blue-300 bg-slate-100 dark:bg-slate-800 text-blue-900 dark:text-blue-100">
                            {getInitials(currentUser)}
                          </span>
                          <span>Your rank: <span className="font-bold">{userRank + 1}</span></span>
                          <span className="ml-auto px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">{userStats[currentUser]?.count || 0}</span>
                    </div>
                  )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
                    </div>
                </div>

        {/* Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
            <Chatbot aqiData={aqiData} pollutants={aqiData?.pollutants} />
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default UserDashboard;