import React, { useState, useEffect } from "react";
import { Gauge } from '@mui/x-charts/Gauge';

const AQIGauge = ({ value, maxValue, category }) => {
  return (
    <div className="text-center">
      <div className="mx-auto" style={{ width: '100%', maxWidth: '300px' }}>
        <Gauge
          value={value}
          startAngle={-110}
          endAngle={110}
          max={maxValue}
          text={`${value} AQI`}
          valueMin={0}
          sx={{
            [`& .MuiGauge-valueText`]: {
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fill: category.color
            },
            [`& .MuiGauge-referenceArc`]: {
              fill: '#d8d8d8'
            }
          }}
          arc={{
            cornerRadius: 5,
            padding: 0.1,
            colors: [
              '#55A84F', // Good
              '#A3C853', // Moderate
              '#FFF833', // Unhealthy for Sensitive Groups
              '#F29C33', // Unhealthy
              '#E93F33', // Very Unhealthy
              '#AF2D24'  // Hazardous
            ],
            subArcs: [
              { limit: 50 },
              { limit: 100 },
              { limit: 150 },
              { limit: 200 },
              { limit: 300 },
              { limit: 500 }
            ]
          }}
        />
      </div>
      <h3 className="text-xl font-semibold mt-2" style={{ color: category.color }}>
        {category.level}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default AQIGauge;