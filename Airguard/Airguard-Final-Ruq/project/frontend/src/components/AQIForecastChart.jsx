import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Chart,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  CategoryScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { parseISO } from 'date-fns';

// Register Chart.js components
Chart.register(
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 p-4">Chart display error. Please try again.</div>;
    }
    return this.props.children;
  }
}

const AQIForecastChart = ({ selectedZone }) => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('arima');
  const chartInstance = useRef(null);
  const canvasRef = useRef(null);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      setError(null);

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const historicalResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/aggregated`, {
        params: { startDate: twentyFourHoursAgo.toISOString() },
        headers: { 'Content-Type': 'application/json' },
      });

      let formattedData;
      if (!historicalResponse.data || !Array.isArray(historicalResponse.data) || historicalResponse.data.length === 0) {
        console.warn('No recent historical data, using fallback data');
        formattedData = [
          { intervalStart: new Date(Date.now() - 60 * 60 * 1000).toISOString(), aqi: 50 },
          { intervalStart: new Date(Date.now() - 50 * 60 * 1000).toISOString(), aqi: 55 },
        ];
      } else {
        formattedData = historicalResponse.data.map((d) => ({
          intervalStart: d.intervalStart,
          aqi: d.aqi,
        }));
      }

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/forecast/train-models`, { data: formattedData }, {
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/forecast`, {
        zone: selectedZone,
        steps: 6,
        historical: {
          timestamps: formattedData.map((d) => d.intervalStart),
          aqi: formattedData.map((d) => d.aqi),
        },
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      setForecastData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch forecast error:', err.message, err.response?.data);
      setError(err.response?.data?.message || `Failed to load forecast data: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, [selectedZone]);

  useEffect(() => {
    if (!forecastData || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      setError('Failed to get canvas context');
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    try {
      const parseTimestamps = (timestamps) => {
        return timestamps.map((ts) => {
          const parsed = parseISO(ts);
          if (isNaN(parsed.getTime())) {
            console.error('Invalid timestamp:', ts);
            return null;
          }
          return parsed;
        }).filter((ts) => ts !== null);
      };

      const historicalTimestamps = parseTimestamps(forecastData.historical.timestamps);
      const forecastTimestamps = parseTimestamps(forecastData.forecast.timestamps);

      if (historicalTimestamps.length === 0 || forecastTimestamps.length === 0) {
        throw new Error('No valid timestamps after parsing');
      }

      const historicalData = {
        timestamps: historicalTimestamps,
        aqi: forecastData.historical.aqi,
      };

      const forecastAqi = selectedModel === 'arima' ? 
        forecastData.forecast.arima : 
        forecastData.forecast.holt_winters;

      const data = {
        labels: [...historicalTimestamps, ...forecastTimestamps],
        datasets: [
          {
            label: 'Historical AQI',
            data: [...historicalData.aqi, ...Array(forecastTimestamps.length).fill(null)],
            borderColor: document.documentElement.classList.contains('dark') ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 1)',
            backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.2,
          },
          {
            label: `${selectedModel.toUpperCase()} Forecast`,
            data: [...Array(historicalTimestamps.length).fill(null), ...forecastAqi],
            borderColor: document.documentElement.classList.contains('dark') ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 99, 132, 1)',
            backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(255, 99, 132, 0.2)' : 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'AQI Forecast with Machine Learning Models',
            color: document.documentElement.classList.contains('dark') ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)',
            font: { size: 16 },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(1);
                }
                return label;
              },
            },
            mode: 'index',
            intersect: false,
          },
          legend: {
            labels: { color: document.documentElement.classList.contains('dark') ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)' },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute',
              displayFormats: {
                minute: 'HH:mm',
                hour: 'HH:mm',
              },
              tooltipFormat: 'MMM dd, HH:mm',
            },
            adapters: {
              date: { locale: enUS },
            },
            title: {
              display: true,
              text: 'Time',
              color: document.documentElement.classList.contains('dark') ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)',
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)',
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            title: {
              display: true,
              text: 'AQI Value',
              color: document.documentElement.classList.contains('dark') ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)',
            },
            ticks: { color: document.documentElement.classList.contains('dark') ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)' },
            beginAtZero: true,
          },
        },
      };

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options,
      });
    } catch (err) {
      console.error('Chart rendering error:', err);
      setError(`Failed to render chart: ${err.message}`);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [forecastData, selectedModel]);

  if (loading) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center h-64 text-gray-800 dark:text-white w-full"
    >
      Loading forecast data...
    </motion.div>
  );
  if (error) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-red-500 p-4 w-full"
    >
      {error}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchForecastData}
        className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </motion.button>
    </motion.div>
  );
  if (!forecastData) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-yellow-500 p-4 w-full"
    >
      No forecast data available
    </motion.div>
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 w-full"
    >
      <motion.div variants={fadeIn} className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-white">
          AQI Forecast (Next Hour)
        </h3>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedModel('arima')}
            className={`px-3 py-1 rounded text-sm ${
              selectedModel === 'arima'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            ARIMA
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedModel('holt_winters')}
            className={`px-3 py-1 rounded text-sm ${
              selectedModel === 'holt_winters'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            Holt-Winters
          </motion.button>
        </div>
      </motion.div>
      <motion.div variants={fadeIn} className="h-64">
        <ChartErrorBoundary>
          <canvas ref={canvasRef} />
        </ChartErrorBoundary>
      </motion.div>
      <motion.div variants={fadeIn} className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <p>The forecast uses {selectedModel === 'arima' ? 'ARIMA' : 'Holt-Winters'} time series models trained on historical data.</p>
        <p className="mt-1">Red dashed line shows the predicted AQI values for {selectedZone}.</p>
      </motion.div>
    </motion.div>
  );
};

export default AQIForecastChart;