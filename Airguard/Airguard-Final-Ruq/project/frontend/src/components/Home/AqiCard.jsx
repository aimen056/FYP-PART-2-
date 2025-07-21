import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

const AqiCard = ({ selectedZone = "Unknown location", dominantPollutant }) => {
  const [aqiData, setAqiData] = useState({
    aqi: null,
    loading: true,
    error: null
  });
  // Add this to any component (like App.jsx or Home.jsx) temporarily
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('All env vars:', import.meta.env);

  // AQI category configuration with enhanced colors
  const categoryColors = {
    good: "from-emerald-400 to-green-500",
    moderate: "from-yellow-400 to-orange-500",
    unhealthySensitive: "from-orange-400 to-red-500",
    unhealthy: "from-red-400 to-pink-500",
    veryUnhealthy: "from-purple-400 to-indigo-500",
    hazardous: "from-red-800 to-gray-900"
  };

  const categoryBgColors = {
    good: "bg-emerald-500/20",
    moderate: "bg-yellow-500/20",
    unhealthySensitive: "bg-orange-500/20",
    unhealthy: "bg-red-500/20",
    veryUnhealthy: "bg-purple-500/20",
    hazardous: "bg-red-800/20"
  };

  // Function to determine AQI category
  const getAqiCategory = (aqi) => {
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "unhealthySensitive";
    if (aqi <= 200) return "unhealthy";
    if (aqi <= 300) return "veryUnhealthy";
    return "hazardous";
  };

  useEffect(() => {
    const fetchAQI = async () => {
      try {
        console.log('Fetching AQI data...');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/aggregated`);
        
        // Find the most recent entry with an AQI value
        const latestWithAqi = res.data.find(item => item.aqi !== undefined);
        
        setAqiData({
          aqi: latestWithAqi?.aqi || 0,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error("Failed to fetch AQI", err.response || err);
        setAqiData(prev => ({
          ...prev,
          loading: false,
          error: err.response?.data?.message || err.message
        }));
      }
    };
    fetchAQI();
  }, []);

  // Gauge configuration
  const categories = [
    { name: "Good", value: 50, color: "#10B981" },
    { name: "Moderate", value: 50, color: "#F59E0B" },
    { name: "UnhealthySensitive", value: 50, color: "#F97316" },
    { name: "Unhealthy", value: 50, color: "#EF4444" },
    { name: "VeryUnhealthy", value: 50, color: "#8B5CF6" },
    { name: "Hazardous", value: 50, color: "#7F1D1D" },
  ];

  const RADIAN = Math.PI / 180;
  const cx = 75;
  const cy = 75;
  const iR = 50;
  const oR = 70;
  const totalAQI = categories.length * 50;
  const angle = 180 * (1 - Math.min(aqiData.aqi || 0, 300) / totalAQI);
  const needleLength = (iR + oR) / 2;
  const x1 = cx + needleLength * Math.cos(-RADIAN * angle);
  const y1 = cy + needleLength * Math.sin(-RADIAN * angle);

  // Format category name for display
  const formatCategoryName = (category) => {
    return category
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  if (aqiData.loading) return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl flex items-center justify-center"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Loading AQI...</p>
      </div>
    </motion.div>
  );

  if (aqiData.error) return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full p-4 rounded-2xl bg-red-50/90 dark:bg-red-900/20 backdrop-blur-md border border-red-200/20 dark:border-red-800/20 shadow-2xl flex items-center justify-center"
    >
      <div className="text-center text-red-600 dark:text-red-400">
        <p className="text-sm">Error: {aqiData.error}</p>
      </div>
    </motion.div>
  );

  const currentCategory = getAqiCategory(aqiData.aqi || 0);
  const categoryLabel = formatCategoryName(currentCategory);
  const gradientClass = categoryColors[currentCategory] || "from-gray-400 to-gray-600";
  const bgClass = categoryBgColors[currentCategory] || "bg-gray-500/20";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full p-4 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-100/50 to-blue-100/50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-full -translate-y-10 translate-x-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full translate-y-8 -translate-x-8 animate-pulse delay-1000"></div>

      {/* Header with enhanced styling */}
      <div className="relative z-10 flex justify-between items-center mb-4">
        <div className="flex-1">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          >
            Air Quality Index
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px] font-medium"
          >
            {selectedZone}
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className={`p-3 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg flex-shrink-0 w-12 h-12 flex items-center justify-center backdrop-blur-sm`}
        >
          <span className="text-xl drop-shadow-sm">{getEmoji(currentCategory)}</span>
        </motion.div>
      </div>

      {/* Enhanced Gauge */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex-grow flex items-center justify-center relative my-3"
      >
        <div className="relative">
          <PieChart width={150} height={130} className="-mt-2 -mb-3">
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={categories}
              cx={cx}
              cy={cy}
              innerRadius={iR}
              outerRadius={oR}
              stroke="none"
            >
              {categories.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
              ))}
            </Pie>
            {/* Enhanced Needle and center dot */}
            <g>
              <circle cx={cx} cy={cy} r={5} fill="white" className="drop-shadow-lg" />
              <circle cx={cx} cy={cy} r={3} fill="gray" className="dark:fill-gray-300" />
              <path
                d={`M${cx} ${cy} L${x1} ${y1}`}
                stroke="white"
                strokeWidth={3}
                className="drop-shadow-lg"
                strokeLinecap="round"
              />
              <path
                d={`M${cx} ${cy} L${x1} ${y1}`}
                stroke="gray"
                strokeWidth={1.5}
                className="dark:stroke-gray-300"
                strokeLinecap="round"
              />
            </g>
          </PieChart>
        </div>
      </motion.div>

      {/* Enhanced AQI value display */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`mt-3 p-3 rounded-xl bg-gradient-to-r ${gradientClass} bg-opacity-20 dark:bg-opacity-30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 flex justify-center shadow-lg`}
      >
        <div className="text-center">
          <motion.h2 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            className="text-4xl font-bold text-gray-800 dark:text-white drop-shadow-sm"
          >
            {aqiData.aqi ?? "--"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            {categoryLabel}
          </motion.p>
          {dominantPollutant && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1"
            >
              Major Pollutant: {getPollutantLabel(dominantPollutant)}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Enhanced Legend */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center gap-2 mt-3"
      >
        {categories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + index * 0.1 }}
            className="w-4 h-4 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
            style={{ backgroundColor: category.color }}
            title={category.name}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// Helper function for emojis
function getEmoji(category) {
  const emojiMap = {
    good: "😊",
    moderate: "😐",
    unhealthySensitive: "😷",
    unhealthy: "😨",
    veryUnhealthy: "😱",
    hazardous: "☠️"
  };
  return emojiMap[category] || "—";
}

// Helper function for pollutant label
function getPollutantLabel(key) {
  const labels = {
    pm2_5: "PM2.5",
    pm10: "PM10",
    o3: "O₃",
    co: "CO",
    no2: "NO₂",
    so2: "SO₂"
  };
  return labels[key] || key;
}

export default AqiCard;