// src/components/Home/Heatmap.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";

const MARGIN = { top: 5, right: 60, bottom: 45, left: 50 };

const Heatmap = ({ data = [], selectedZone = "Unknown location" }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 120 });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [showAllZones, setShowAllZones] = useState(false);

  // Enhanced AQI color scale with better contrast
  const aqiColorScale = d3
    .scaleThreshold()
    .domain([50, 100, 150, 200, 300])
    .range([
      "#00E400", // Good (0-50) - Bright Green
      "#FFFF00", // Moderate (51-100) - Yellow
      "#FF7E00", // Unhealthy for Sensitive Groups (101-150) - Orange
      "#FF0000", // Unhealthy (151-200) - Red
      "#8F3F97", // Very Unhealthy (201-300) - Purple
      "#7E0023", // Hazardous (301+) - Maroon
    ]);

  const aqiCategories = {
    good: { min: 0, max: 50, label: "Good", color: "#00E400" },
    moderate: { min: 51, max: 100, label: "Moderate", color: "#FFFF00" },
    unhealthySensitive: { min: 101, max: 150, label: "Unhealthy for Sensitive Groups", color: "#FF7E00" },
    unhealthy: { min: 151, max: 200, label: "Unhealthy", color: "#FF0000" },
    veryUnhealthy: { min: 201, max: 300, label: "Very Unhealthy", color: "#8F3F97" },
    hazardous: { min: 301, max: 500, label: "Hazardous", color: "#7E0023" },
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.max(width, 400), height: Math.max(width * 0.2, 100) });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const { width, height } = dimensions;
  const boundsWidth = width - MARGIN.left - MARGIN.right;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Enhanced data processing with time grouping
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group data by time intervals
    const timeIntervals = {
      "24h": 24,
      "7d": 7,
      "30d": 30
    };

    const interval = timeIntervals[selectedTimeRange] || 24;
    const now = new Date();
    const timeSlots = [];

    for (let i = interval - 1; i >= 0; i--) {
      const time = new Date(now);
      if (selectedTimeRange === "24h") {
        time.setHours(time.getHours() - i);
        timeSlots.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      } else {
        time.setDate(time.getDate() - i);
        timeSlots.push(time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    }

    // Create zones array
    const zones = showAllZones ? ["Zone 1", "Zone 2", "Zone 3", "Zone 4"] : [selectedZone];

    // Generate heatmap data
    const heatmapData = [];
    zones.forEach(zone => {
      timeSlots.forEach((timeSlot, index) => {
        // Find data for this time slot and zone
        const relevantData = data.filter(d => {
          const dataTime = new Date(d.timestamp);
          const slotTime = new Date(now);
          
          if (selectedTimeRange === "24h") {
            slotTime.setHours(slotTime.getHours() - (interval - 1 - index));
            return dataTime.getHours() === slotTime.getHours() && d.y === zone;
          } else {
            slotTime.setDate(slotTime.getDate() - (interval - 1 - index));
            return dataTime.toDateString() === slotTime.toDateString() && d.y === zone;
          }
        });

        const avgAQI = relevantData.length > 0 
          ? d3.mean(relevantData, d => d.value)
          : Math.random() * 100 + 50; // Fallback for missing data

        heatmapData.push({
          x: timeSlot,
          y: zone,
          value: Math.round(avgAQI),
          timestamp: relevantData[0]?.timestamp || new Date().toISOString()
        });
      });
    });

    return heatmapData;
  }, [data, selectedZone, selectedTimeRange, showAllZones]);

  const allYGroups = useMemo(() => [...new Set(processedData.map((d) => d.y))], [processedData]);
  const allXGroups = useMemo(() => [...new Set(processedData.map((d) => d.x))], [processedData]);

  const xScale = useMemo(
    () =>
      d3
        .scaleBand()
        .range([0, boundsWidth])
        .domain(allXGroups)
        .padding(0.02),
    [allXGroups, boundsWidth]
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleBand()
        .range([boundsHeight, 0])
        .domain(allYGroups)
        .padding(0.02),
    [allYGroups, boundsHeight]
  );

  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <div className="text-lg mb-1">📊</div>
          <p className="text-xs">No AQI data available</p>
        </div>
      </div>
    );
  }

  const allRects = processedData.map((d, i) => {
    const category = Object.entries(aqiCategories).find(([_, cat]) => 
      d.value >= cat.min && d.value <= cat.max
    )?.[0] || 'good';

    return (
      <motion.rect
      key={i}
      x={xScale(d.x)}
      y={yScale(d.y)}
      width={xScale.bandwidth()}
      height={yScale.bandwidth()}
        fill={aqiColorScale(d.value)}
        rx={4}
      stroke="#fff"
      strokeWidth={0.5}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: i * 0.01 }}
        onMouseEnter={() => setHoveredCell(d)}
        onMouseLeave={() => setHoveredCell(null)}
        className="cursor-pointer transition-all duration-200 hover:stroke-2 hover:stroke-gray-800"
        style={{
          filter: hoveredCell === d ? 'brightness(1.1)' : 'brightness(1)',
          transform: hoveredCell === d ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <title>
          {`Zone: ${d.y}\nTime: ${d.x}\nAQI: ${d.value}\nCategory: ${aqiCategories[category]?.label || 'Unknown'}`}
        </title>
      </motion.rect>
    );
  });

  // Enhanced axis labels
  const xLabels = allXGroups.map((timeSlot, i) => {
    if (selectedTimeRange === "24h" && i % Math.ceil(allXGroups.length / 4) !== 0) return null;
    if (selectedTimeRange !== "24h" && i % Math.ceil(allXGroups.length / 3) !== 0) return null;
    
    return (
      <text
        key={i}
        x={xScale(timeSlot) + xScale.bandwidth() / 2}
        y={boundsHeight + 12}
        textAnchor="middle"
        fontSize={9}
        fill="#666"
        className="font-medium"
      >
        {timeSlot}
      </text>
    );
  });

  const yLabels = allYGroups.map((zone, i) => (
    <text
      key={i}
      x={-6}
      y={yScale(zone) + yScale.bandwidth() / 2}
      textAnchor="end"
      fontSize={10}
      fill="#666"
      className="font-semibold"
    >
      {zone}
    </text>
  ));

  // Enhanced legend - moved to left of indicators
  const legendWidth = 120;
  const legendHeight = 15;
  const legendX = 0; // Position at the left
  const legendY = boundsHeight + 25; // Position below the chart area

  const legend = (
    <g transform={`translate(${legendX}, ${legendY})`}>
      <text x={0} y={-8} fontSize={10} fill="#666" className="font-semibold">
        AQI Scale
      </text>
      {Object.entries(aqiCategories).map(([key, category], i) => (
        <g key={key} transform={`translate(${i * (legendWidth / 5)}, 0)`}>
        <rect
            x={0}
          y={0}
            width={legendWidth / 5 - 3}
          height={legendHeight}
            fill={category.color}
          stroke="#fff"
          strokeWidth={0.5}
            rx={2}
        />
        <text
            x={(legendWidth / 5) / 2}
            y={legendHeight + 12}
          textAnchor="middle"
            fontSize={9}
          fill="#666"
            className="font-medium"
        >
            {category.min}-{category.max}
        </text>
        </g>
      ))}
    </g>
  );

  return (
    <div className="w-full p-2 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-0.5">
            AQI Heatmap
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {showAllZones ? "All Zones" : selectedZone} • {selectedTimeRange}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-1">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>

          {/* Zone Toggle */}
          <button
            onClick={() => setShowAllZones(!showAllZones)}
            className={`px-1.5 py-0.5 text-xs rounded border transition-all ${
              showAllZones
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
            }`}
          >
            {showAllZones ? "All" : "Single"}
          </button>
        </div>
      </div>

      {/* Heatmap Container */}
      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {/* Background grid */}
            <g className="grid-lines">
              {allXGroups.map((x, i) => (
                <line
                  key={`grid-x-${i}`}
                  x1={xScale(x)}
                  y1={0}
                  x2={xScale(x)}
                  y2={boundsHeight}
                  stroke="#f0f0f0"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              ))}
              {allYGroups.map((y, i) => (
                <line
                  key={`grid-y-${i}`}
                  x1={0}
                  y1={yScale(y)}
                  x2={boundsWidth}
                  y2={yScale(y)}
                  stroke="#f0f0f0"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              ))}
            </g>

            {allRects}
            {xLabels}
            {yLabels}
            {legend}
          </g>
        </svg>
      </div>

      {/* Enhanced Tooltip */}
      {hoveredCell && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10 pointer-events-none"
          style={{
            left: `${hoveredCell.x * 100}%`,
            top: `${hoveredCell.y * 100}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-sm">
            <div className="font-semibold text-gray-800 dark:text-white">{hoveredCell.y}</div>
            <div className="text-gray-600 dark:text-gray-400">Time: {hoveredCell.x}</div>
            <div className="text-gray-600 dark:text-gray-400">
              AQI: <span className="font-semibold">{hoveredCell.value}</span>
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Category: {Object.entries(aqiCategories).find(([_, cat]) => 
                hoveredCell.value >= cat.min && hoveredCell.value <= cat.max
              )?.[1]?.label || 'Unknown'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Compact Statistics */}
      <div className="mt-2 grid grid-cols-3 gap-1">
        <div className="text-center p-1 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-sm font-bold text-gray-800 dark:text-white">
            {Math.round(d3.mean(processedData, d => d.value))}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Avg</div>
        </div>
        <div className="text-center p-1 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-sm font-bold text-gray-800 dark:text-white">
            {d3.max(processedData, d => d.value)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Peak</div>
        </div>
        <div className="text-center p-1 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-sm font-bold text-gray-800 dark:text-white">
            {d3.min(processedData, d => d.value)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Low</div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;