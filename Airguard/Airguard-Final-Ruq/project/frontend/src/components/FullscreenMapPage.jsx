import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeMap from "../components/HomeMap";
import { BsArrowLeft } from "react-icons/bs";
import axios from "axios";

const FullscreenMapPage = () => {
  const [zoneData, setZoneData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAqiCategory = (aqi) => {
    if (!aqi || isNaN(aqi) || aqi < 0) return "unknown";
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "unhealthySensitive";
    if (aqi <= 200) return "unhealthy";
    if (aqi <= 300) return "veryUnhealthy";
    return "hazardous";
  };

  const getAqiColor = (aqi) => {
    if (!aqi || isNaN(aqi) || aqi < 0) return "bg-gray-500";
    if (aqi <= 50) return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    return "bg-red-500";
  };

  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        const [aqiResponse, sensorResponse] = await Promise.all([
          axios.get("http://localhost:5002/api/aggregated"),
          axios.get("http://localhost:5002/api/sensor-locations"),
        ]);

        const latestAqiReadings = aqiResponse.data.reduce((acc, reading) => {
          if (!acc.latest || new Date(reading.intervalEnd) > new Date(acc.latest.intervalEnd)) {
            return { ...acc, latest: reading };
          }
          return acc;
        }, {}).latest;

        const zonesWithAqi = sensorResponse.data.map((sensor) => ({
          name: sensor.zone,
          locationName: sensor.locationName || sensor.zone,
          aqi: latestAqiReadings ? latestAqiReadings.aqi : null,
          status: latestAqiReadings ? getAqiCategory(latestAqiReadings.aqi) : "unknown",
          geocode: [sensor.lat, sensor.lon],
        }));

        // Sort zones by AQI in descending order
        zonesWithAqi.sort((a, b) => (b.aqi || 0) - (a.aqi || 0));

        setZoneData(zonesWithAqi);
      } catch (err) {
        console.error("Error fetching zone data:", err);
        setError("Failed to fetch zone data.");
      }
    };

    fetchZoneData();
  }, []);

  return (
    <div className="w-screen h-screen bg-background dark:bg-background dark:text-[#E4E4E7] relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute bottom-0 left-0 bg-blue-600 text-white p-3 rounded-full z-30"
      >
        <BsArrowLeft size={24} />
      </button>

      {/* AQI Ranking Table (always visible) */}
      <div className="absolute pt-20 bg-surfaceColor shadow-lg p-4 rounded-lg w-64 z-10">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="w-full table-auto text-sm">
            <thead>
              <tr>
                <th className="text-left px-2 py-1">Zone</th>
                <th className="text-left px-2 py-1">AQI</th>
              </tr>
            </thead>
            <tbody>
              {zoneData.map((zone, index) => (
                <tr key={index}>
                  <td className="px-2 py-1">{zone.name}</td>
                  <td className="px-2 py-1 flex items-center">
                    <div
                      className={`inline-block w-2 h-2 mr-2 rounded-full ${getAqiColor(
                        zone.aqi
                      )}`}
                    ></div>
                    {zone.aqi !== null ? zone.aqi : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Map Component with Markers */}
      <HomeMap fullscreen={true} markers={zoneData} />
    </div>
  );
};

export default FullscreenMapPage;