

import React, { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
// import { useObservations } from "../../context/AirObservationContext";

const AqiPieChart = () => {
  // const { observationData, error } = useObservations();
  const chartRef = useRef(null);
  const [chartSize, setChartSize] = useState({ width: 400, height: 300 });

  useEffect(() => {
    const updateSize = () => {
      if (chartRef.current) {
        const { width } = chartRef.current.getBoundingClientRect();
        setChartSize({ width, height: width * 0.75 }); // Maintain aspect ratio
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // if (!observationData || !Array.isArray(observationData)) {
  //   return <p className="text-red-500">No AQI data available.</p>;
  // }

  // List of pollutants to display
  const pollutants = ["PM2.5", "PM10", "OZONE", "NO2", "CO"];

  // Function to determine AQI color category
  // const getColor = (aqi) => {
  //   if (aqi <= 50) return "#00e400"; // Green (Good)
  //   if (aqi <= 100) return "#ffff00"; // Yellow (Moderate)
  //   if (aqi <= 150) return "#ff7e00"; // Orange (Unhealthy for Sensitive Groups)
  //   if (aqi <= 200) return "#ff0000"; // Red (Unhealthy)
  //   if (aqi <= 300) return "#8f3f97"; // Purple (Very Unhealthy)
  //   return "#7e0023"; // Maroon (Hazardous)
  // };

  // Extract highest AQI value for each pollutant
  // const highestAqiData = pollutants
  //   .map((pollutant) => {
  //     const matchingEntries = observationData.filter(
  //       (item) => item.parameter.toUpperCase() === pollutant.toUpperCase()
  //     );

  //     if (matchingEntries.length === 0) return null;

  //     const highestAqiEntry = matchingEntries.reduce((max, item) =>
  //       item.aqi > max.aqi ? item : max
  //     );

  //     return {
  //       name: pollutant,
  //       value: highestAqiEntry.aqi,
  //       color: getColor(highestAqiEntry.aqi),
  //     };
  //   })
  //   .filter(Boolean); // Remove null values

  // return (
  //   <div ref={chartRef} className="">
  //     <h2 className="text-lg font-bold mb-2 text-center">AQI Pollutants Chart</h2>
  //     {error ? (
  //       <p className="text-red-500">Error fetching AQI data.</p>
  //     ) : highestAqiData.length === 0 ? (
  //       <p className="text-gray-500">No relevant AQI data available.</p>
  //     ) : (
  //       <ResponsiveContainer width="100%" height={chartSize.height}>
  //         <PieChart>
  //           {/* <Pie data={highestAqiData} dataKey="value" cx="50%" cy="50%" outerRadius="50%" label>
  //             {highestAqiData.map((entry, index) => (
  //               <Cell key={`cell-${index}`} fill={entry.color} />
  //             ))}
  //           </Pie> */}
  //           <Tooltip formatter={(value) => `AQI: ${value}`} />
  //           <Legend />
  //         </PieChart>
  //       </ResponsiveContainer>
  //     )}
  //   </div>
  // );
};

export default AqiPieChart;