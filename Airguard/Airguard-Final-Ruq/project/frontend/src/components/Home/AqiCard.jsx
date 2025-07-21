import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { getAqiCategory } from "../../constants/aqiColors";

const AqiCard = ({ aqi, selectedZone = "Unknown location", dominantPollutant }) => {
  // Gauge configuration
  const categories = [
    { name: "Good", value: 50, color: "#10B981" },
    { name: "Moderate", value: 50, color: "#F59E0B" },
    { name: "Unhealthy for Sensitive Groups", value: 50, color: "#F97316" },
    { name: "Unhealthy", value: 50, color: "#EF4444" },
    { name: "Very Unhealthy", value: 50, color: "#8B5CF6" },
    { name: "Hazardous", value: 50, color: "#7F1D1D" },
  ];

  const RADIAN = Math.PI / 180;
  const cx = 75;
  const cy = 75;
  const iR = 50;
  const oR = 70;
  const totalAQI = categories.length * 50;
  const angle = 180 * (1 - Math.min(aqi || 0, 300) / totalAQI);
  const needleLength = (iR + oR) / 2;
  const x1 = cx + needleLength * Math.cos(-RADIAN * angle);
  const y1 = cy + needleLength * Math.sin(-RADIAN * angle);

  // Get category info from shared util
  const categoryInfo = getAqiCategory(aqi || 0);
  const categoryLabel = categoryInfo.label;

  // Gradient and bg classes for styling
  const gradientClass = {
    "Good": "from-emerald-400 to-green-500",
    "Moderate": "from-yellow-400 to-orange-500",
    "Unhealthy for Sensitive Groups": "from-orange-400 to-red-500",
    "Unhealthy": "from-red-400 to-pink-500",
    "Very Unhealthy": "from-purple-400 to-indigo-500",
    "Hazardous": "from-red-800 to-gray-900"
  }[categoryLabel] || "from-gray-400 to-gray-600";
  const bgClass = {
    "Good": "bg-emerald-500/20",
    "Moderate": "bg-yellow-500/20",
    "Unhealthy for Sensitive Groups": "bg-orange-500/20",
    "Unhealthy": "bg-red-500/20",
    "Very Unhealthy": "bg-purple-500/20",
    "Hazardous": "bg-red-800/20"
  }[categoryLabel] || "bg-gray-500/20";

  // Helper function for emojis
  function getEmoji(label) {
    const emojiMap = {
      "Good": "😊",
      "Moderate": "😐",
      "Unhealthy for Sensitive Groups": "😷",
      "Unhealthy": "😨",
      "Very Unhealthy": "😱",
      "Hazardous": "☠️"
    };
    return emojiMap[label] || "—";
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
          <span className="text-xl drop-shadow-sm">{getEmoji(categoryLabel)}</span>
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
            {aqi ?? "--"}
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
              className="text-xs font-medium text-white-500 dark:text-white mt-1"
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

export default AqiCard;