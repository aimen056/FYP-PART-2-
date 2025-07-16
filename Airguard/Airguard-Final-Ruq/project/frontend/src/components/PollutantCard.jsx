
import React, { useState, useEffect } from "react";

const PollutantCard = ({ name, value, unit, aqi }) => {
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#55A84F';
    if (aqi <= 100) return '#A3C853';
    if (aqi <= 150) return '#FFF833';
    if (aqi <= 200) return '#F29C33';
    if (aqi <= 300) return '#E93F33';
    return '#AF2D24';
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-700">{name}</h4>
          <p className="text-2xl font-bold mt-1">
            {value.toFixed(2)} <span className="text-sm font-normal">{unit}</span>
          </p>
        </div>
        <span 
          className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: getAQIColor(aqi) + '20', color: getAQIColor(aqi) }}
        >
          AQI {aqi}
        </span>
      </div>
      <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full"
          style={{ 
            width: `${Math.min(100, (aqi / 500) * 100)}%`,
            backgroundColor: getAQIColor(aqi)
          }}
        ></div>
      </div>
    </div>
  );
};

export default PollutantCard;