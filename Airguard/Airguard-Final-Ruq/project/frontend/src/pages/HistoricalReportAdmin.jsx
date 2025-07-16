import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

const HistoricalReportAdmin = () => {
  const [historicalData, setHistoricalData] = useState(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistoricalData = async (retryCount = 3, delay = 1000) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching historical data...');
      // Calculate start date based on time range
      const now = new Date();
      let startDate;
      if (timeRange === "24h") {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (timeRange === "7d") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Fetch data from the API
      const response = await axios.get("http://localhost:5002/api/aggregated", {
        params: startDate ? { startDate: startDate.toISOString() } : {},
        timeout: 5000,
      });

      console.log('API response:', response.data.length, 'records');

      // Transform API data to match the expected format
      const transformedData = response.data.map((item) => {
        const aqi = item.aqi || 0;
        let category;
        if (aqi <= 50) category = "Good";
        else if (aqi <= 100) category = "Moderate";
        else if (aqi <= 150) category = "Unhealthy for Sensitive Groups";
        else if (aqi <= 200) category = "Unhealthy";
        else if (aqi <= 300) category = "Very Unhealthy";
        else category = "Hazardous";

        return {
          zone: selectedZone === "All Zones" ? "All Zones" : "Zone 1",
          locationName: selectedZone === "All Zones" ? "City-Wide Aggregation" : "CUST",
          timestamp: item.intervalStart,
          pollutants: {
            pm2_5: { concentration: item.pm2_5_avg || 0, aqi: Math.round((item.pm2_5_avg || 0) * 2.5) },
            pm10: { concentration: item.pm10_avg || 0, aqi: Math.round((item.pm10_avg || 0) * 1.5) },
            o3: { concentration: 0, aqi: 0 },
            no2: { concentration: 0, aqi: 0 },
            so2: { concentration: 0, aqi: 0 },
            co: { concentration: 0, aqi: 0 },
          },
          overallAQI: aqi,
          category,
          dominantPollutant: item.pollutant || "pm2_5",
          meteorologicalData: {
            temperature: 0,
            humidity: 0,
            windSpeed: 0,
            pressure: 0,
          },
        };
      });

      console.log('Transformed data:', transformedData.length, 'records');

      // Filter data based on selected zone
      const filteredData = selectedZone === "All Zones"
        ? transformedData
        : transformedData.filter((item) => item.zone === "Zone 1");

      setHistoricalData(filteredData);
    } catch (err) {
      console.error("Error fetching historical data:", err.message, err.response);
      if (retryCount > 0 && err.code === "ECONNREFUSED") {
        console.log(`Retrying... (${retryCount} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchHistoricalData(retryCount - 1, delay * 2);
      }
      setError(
        err.code === "ECONNREFUSED"
          ? "Cannot connect to server at http://localhost:5002. Ensure the backend is running and try again."
          : `Failed to load historical data: ${err.message}`
      );
      setHistoricalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!historicalData || historicalData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Historical Air Quality Report (Admin)", 20, 20);
    doc.setFontSize(12);
    doc.text(`Zone: ${selectedZone}`, 20, 30);
    doc.text(`Time Range: ${timeRange === "24h" ? "Last 24 Hours" : timeRange === "7d" ? "Last 7 Days" : "All Data"}`, 20, 40);

    let y = 50;
    historicalData.forEach((report) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(`${report.zone} - ${report.locationName}`, 20, y);
      doc.setFontSize(10);
      y += 10;
      doc.text(`Timestamp: ${new Date(report.timestamp).toLocaleString()}`, 20, y);
      y += 10;
      doc.text(`AQI: ${report.overallAQI} (${report.category})`, 20, y);
      y += 10;
      doc.text(`Dominant Pollutant: ${report.dominantPollutant}`, 20, y);
      y += 10;

      doc.text("Pollutants (μg/m³):", 20, y);
      y += 10;
      Object.entries(report.pollutants).map(([key, value]) => {
        doc.text(`${key.replace("_", " ")}: ${value.concentration} (AQI: ${value.aqi})`, 30, y);
        y += 10;
      });

      doc.text("Weather Conditions:", 20, y);
      y += 10;
      const weather = report.meteorologicalData;
      doc.text(`Temperature: ${weather.temperature} °C`, 30, y);
      y += 10;
      doc.text(`Humidity: ${weather.humidity}%`, 30, y);
      y += 10;
      doc.text(`Wind Speed: ${weather.windSpeed} m/s`, 30, y);
      y += 10;
      doc.text(`Pressure: ${weather.pressure} hPa`, 30, y);
      y += 20;
    });

    doc.save(`Historical_Air_Quality_Report_Admin_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange, selectedZone]);

  return (
    <div className="pt-16 bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Historical Air Quality Reports
          </h1>
          <button 
  onClick={downloadPDF}
  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
  disabled={isLoading || !historicalData || historicalData.length === 0}
>
  Download PDF
</button>

        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/2">
            <label htmlFor="zone-select" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Select Zone
            </label>
            <select
              id="zone-select"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="All Zones">All Zones</option>
              <option value="Zone 1">Zone 1 - CUST</option>
            </select>
          </div>
          <div className="w-full sm:w-1/2">
            <label htmlFor="time-range" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Time Range
            </label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="all">All Data</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-10 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Data Display */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-700 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading historical data...</p>
          </div>
        ) : historicalData ? (
          historicalData.length > 0 ? (
            <div className="space-y-6">
              {historicalData.map((report, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {report.zone} - {report.locationName}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          report.overallAQI <= 50
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : report.overallAQI <= 100
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                            : report.overallAQI <= 150
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                            : report.overallAQI <= 200
                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400"
                        }`}
                      >
                        AQI: {report.overallAQI} ({report.category})
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pollutants */}
                    <div>
                      <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-100">
                        Pollutants (μg/m³)
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(report.pollutants).map(([key, value]) => (
                          <div
                            key={key}
                            className="border border-gray-200 dark:border-gray-600 p-2 rounded"
                          >
                            <div className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                              {key.replace("_", " ")}
                            </div>
                            <div className="text-lg text-gray-800 dark:text-gray-100">
                              {value.concentration}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              AQI: {value.aqi}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Dominant Pollutant:</span>{" "}
                        {report.dominantPollutant}
                      </div>
                    </div>

                    {/* Weather Data */}
                    <div>
                      <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-100">
                        Weather Conditions
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border border-gray-200 dark:border-gray-600 p-2 rounded">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Temperature
                          </div>
                          <div className="text-lg text-gray-800 dark:text-gray-100">
                            {report.meteorologicalData.temperature} °C
                          </div>
                        </div>
                        <div className="border border-gray-200 dark:border-gray-600 p-2 rounded">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Humidity
                          </div>
                          <div className="text-lg text-gray-800 dark:text-gray-100">
                            {report.meteorologicalData.humidity}%
                          </div>
                        </div>
                        <div className="border border-gray-200 dark:border-gray-600 p-2 rounded">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Wind Speed
                          </div>
                          <div className="text-lg text-gray-800 dark:text-gray-100">
                            {report.meteorologicalData.windSpeed} m/s
                          </div>
                        </div>
                        <div className="border border-gray-200 dark:border-gray-600 p-2 rounded">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pressure
                          </div>
                          <div className="text-lg text-gray-800 dark:text-gray-100">
                            {report.meteorologicalData.pressure} hPa
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                No historical data available for the selected filters.
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Initializing...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalReportAdmin;