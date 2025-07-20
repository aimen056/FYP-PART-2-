import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import HomeMap from "../components/HomeMap";
import {
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaUser,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReports,
  verifyReport,
  resolveReport,
  deleteReport,
} from "../redux/features/repPollutionSlice";

const AdminDashboard = () => {
  const [sensorLocations, setSensorLocations] = useState([]);
  const [alertThreshold, setAlertThreshold] = useState(200);
  const [selectedZone, setSelectedZone] = useState("Zone 1");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [editingSensor, setEditingSensor] = useState(null);
  const [individualThresholds, setIndividualThresholds] = useState({});
  const [isLoading, setIsLoading] = useState({
    sensors: false,
    operations: false,
  });
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode
  const [rejectionModal, setRejectionModal] = useState({ show: false, reportId: null, comment: "" });

  const dispatch = useDispatch();
  const { pollutions: pollutionReports, status: reportsStatus } = useSelector(
    (state) => state.pollution
  );

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const fetchSensorLocations = async () => {
    setIsLoading((prev) => ({ ...prev, sensors: true }));
    setError(null);
    try {
      const response = await axios.get("http://localhost:5002/api/sensor-locations");
      setSensorLocations(response.data);

      const thresholds = {};
      response.data.forEach((sensor) => {
        thresholds[sensor._id] = sensor.threshold || alertThreshold;
      });
      setIndividualThresholds(thresholds);
    } catch (error) {
      setError("Failed to load sensor locations");
      console.error("Error fetching sensor locations:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, sensors: false }));
    }
  };

  const handleThresholdChange = (sensorId, value) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 500) return;

    setIndividualThresholds((prev) => ({
      ...prev,
      [sensorId]: numValue,
    }));
  };

  const handleAddSensorLocation = async () => {
    if (!lat || !lon || !selectedZone || !locationName) {
      setError("Please fill all sensor details");
      toast.error("Please fill all sensor details");
      return;
    }

    setIsLoading((prev) => ({ ...prev, operations: true }));
    setError(null);

    try {
      const newLocation = {
        zone: selectedZone,
        locationName,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        threshold: editingSensor
          ? individualThresholds[editingSensor._id] || alertThreshold
          : alertThreshold,
      };

      if (editingSensor) {
        await axios.put(
          `http://localhost:5002/api/sensor-locations/${editingSensor._id}`,
          newLocation
        );
        toast.success("Sensor updated successfully");
      } else {
        await axios.post("http://localhost:5002/api/sensor-locations", newLocation);
        toast.success("Sensor added successfully");
      }

      await fetchSensorLocations();
      resetSensorForm();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Operation failed";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error processing sensor:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, operations: false }));
    }
  };

  const resetSensorForm = () => {
    setLat("");
    setLon("");
    setLocationName("");
    setSelectedZone("Zone 1");
    setEditingSensor(null);
  };

  const handleEditSensor = (sensor) => {
    setEditingSensor(sensor);
    setLocationName(sensor.locationName);
    setLat(sensor.lat.toString());
    setLon(sensor.lon.toString());
    setSelectedZone(sensor.zone);
    setIndividualThresholds((prev) => ({
      ...prev,
      [sensor._id]: sensor.threshold || alertThreshold,
    }));
  };

  const handleDeleteSensor = async (sensorId) => {
    if (!window.confirm("Are you sure you want to delete this sensor?")) return;

    setIsLoading((prev) => ({ ...prev, operations: true }));
    setError(null);

    try {
      await axios.delete(`http://localhost:5002/api/sensor-locations/${sensorId}`);
      await fetchSensorLocations();
      toast.success("Sensor deleted successfully");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Delete failed";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error deleting sensor:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, operations: false }));
    }
  };

  const handleVerifyReport = async (reportId, status) => {
    setIsLoading((prev) => ({ ...prev, operations: true }));
    try {
      if (status === "rejected") {
        setRejectionModal({ show: true, reportId, comment: "" });
        return;
      }
      await dispatch(verifyReport({ id: reportId, verificationStatus: status })).unwrap();
      await dispatch(fetchReports());
      toast.success(`Report ${status === "verified" ? "verified" : "rejected"} successfully`);
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to update report status");
    } finally {
      setIsLoading((prev) => ({ ...prev, operations: false }));
    }
  };

  const handleRejectWithComment = async () => {
    if (!rejectionModal.comment.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setIsLoading((prev) => ({ ...prev, operations: true }));
    try {
      await dispatch(verifyReport({ 
        id: rejectionModal.reportId, 
        verificationStatus: "rejected",
        rejectionComment: rejectionModal.comment 
      })).unwrap();
      await dispatch(fetchReports());
      toast.success("Report rejected successfully");
      setRejectionModal({ show: false, reportId: null, comment: "" });
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject report");
    } finally {
      setIsLoading((prev) => ({ ...prev, operations: false }));
    }
  };

  const handleResolveReport = async (reportId, resolved) => {
    setIsLoading((prev) => ({ ...prev, operations: true }));
    try {
      await dispatch(resolveReport({ id: reportId, resolved })).unwrap();
    } catch (error) {
      console.error("Resolution error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, operations: false }));
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await dispatch(deleteReport(reportId)).unwrap();
      await dispatch(fetchReports()).unwrap();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  useEffect(() => {
    dispatch(fetchReports());
    fetchSensorLocations();
  }, [dispatch]);

  const getAqiCategory = (aqi) => {
    if (!aqi) return "good";
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "unhealthySensitive";
    if (aqi <= 200) return "unhealthy";
    if (aqi <= 300) return "veryUnhealthy";
    return "hazardous";
  };

  const formattedMarkers = sensorLocations.map((location) => ({
    geocode: [location.lat, location.lon],
    label: location.zone,
    locationName: location.locationName,
    aqi: location.aqi,
    status: getAqiCategory(location.aqi),
    coverageRadius: 150,
  }));

  // Filter archived reports
  const archivedReports = pollutionReports.filter((report) => report.archived);
  const activeReports = pollutionReports.filter((report) => !report.archived);

  // Compute highest AQI among all sensors
  const highestAQI = sensorLocations.reduce((max, loc) => Math.max(max, loc.aqi || 0), 0);
  const highestAqiCategory = getAqiCategory(highestAQI);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16">
      <header className="bg-white dark:bg-gray-800 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <h1 className="font-bold text-xl text-teal-600 dark:text-teal-500 flex items-center">
              <FaMapMarkerAlt className="mr-2" /> Admin Dashboard
            </h1>
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              {error && (
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Emergency AQI Alert Banner */}
      {(highestAqiCategory === "veryUnhealthy" || highestAqiCategory === "hazardous") && (
        <div className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-4 flex items-center justify-center text-center text-lg font-bold shadow-md z-50">
          <span className="mr-3 text-2xl">⚠️</span>
          Emergency: Air quality is {highestAqiCategory === "hazardous" ? "hazardous" : "very unhealthy"}. Avoid all outdoor activity and stay indoors!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-teal-600 dark:text-teal-500">
                Sensor Locations
              </h2>
            </div>
            <div className="relative" style={{ height: "400px" }}>
              <HomeMap markers={formattedMarkers} style={{ width: "100%", height: "100%" }} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-teal-600 dark:text-teal-500">
                Pollution Reports
              </h2>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
              {reportsStatus === "loading" ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500 dark:border-teal-400"></div>
                </div>
              ) : activeReports.length > 0 ? (
                activeReports.map((report) => (
                  <div
                    key={report._id}
                    className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-700 dark:text-gray-200">{report.description}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <FaUser className="mr-1" />
                          <span>Reported by: {report.user || "Anonymous"}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Date: {report.date}
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {report.locationName || report.location}
                        </p>
                        {report.lat && report.lon && (
                          <p className="text-xs text-gray-400 dark:text-gray-400">
                            Coordinates: {report.lat.toFixed(4)}, {report.lon.toFixed(4)}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Type: {report.pollutionType}
                        </p>
                        {report.images?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Images:
                            </p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {report.images.map((image, index) => (
                                <a
                                  key={index}
                                  href={image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-16 w-16"
                                >
                                  <img
                                    src={image}
                                    alt={`Report ${index}`}
                                    className="h-full w-full object-cover rounded border dark:border-gray-600"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 py-1 text-xs rounded-full mb-2 ${
                            report.verificationStatus === "verified"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : report.verificationStatus === "rejected"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                          }`}
                        >
                          {report.verificationStatus === "verified"
                            ? "Verified"
                            : report.verificationStatus === "rejected"
                            ? "Rejected"
                            : "Pending"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            report.resolved
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                              : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400"
                          }`}
                        >
                          {report.resolved ? "Resolved" : "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleVerifyReport(report._id, "verified")}
                        disabled={report.verificationStatus === "verified" || isLoading.operations}
                        className={`flex items-center px-3 py-1 rounded-md ${
                          report.verificationStatus === "verified" || isLoading.operations
                            ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                            : "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white"
                        }`}
                      >
                        <FaCheck className="mr-1" /> Verify
                      </button>
                      <button
                        onClick={() => handleVerifyReport(report._id, "rejected")}
                        disabled={report.verificationStatus === "rejected" || isLoading.operations}
                        className={`flex items-center px-3 py-1 rounded-md ${
                          report.verificationStatus === "rejected" || isLoading.operations
                            ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                            : "bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white"
                        }`}
                      >
                        <FaTimes className="mr-1" /> Reject
                      </button>
                      <button
                        className={`flex items-center px-3 py-1 rounded-md ${
                          isLoading.operations
                            ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                            : "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white"
                        }`}
                        onClick={() => handleResolveReport(report._id, !report.resolved)}
                        disabled={isLoading.operations}
                      >
                        {report.resolved ? (
                          <>
                            <FaUndo className="mr-1" /> Reopen
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="mr-1" /> Resolve
                          </>
                        )}
                      </button>
                      <button
                        className={`flex items-center px-3 py-1 rounded-md ${
                          isLoading.operations
                            ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                            : "bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white"
                        }`}
                        onClick={() => handleDeleteReport(report._id)}
                        disabled={isLoading.operations}
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No pollution reports available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Archive Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-teal-600 dark:text-teal-500">
                Archived Reports
              </h2>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
              {archivedReports.length > 0 ? (
                archivedReports.map((report) => (
                  <div
                    key={report._id}
                    className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 opacity-70"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-700 dark:text-gray-200">{report.description}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <FaUser className="mr-1" />
                          <span>Reported by: {report.user || "Anonymous"}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Date: {report.date}
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {report.locationName || report.location}
                        </p>
                        {report.lat && report.lon && (
                          <p className="text-xs text-gray-400 dark:text-gray-400">
                            Coordinates: {report.lat.toFixed(4)}, {report.lon.toFixed(4)}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Type: {report.pollutionType}
                        </p>
                        {report.images?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Images:
                            </p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {report.images.map((image, index) => (
                                <a
                                  key={index}
                                  href={image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-16 w-16"
                                >
                                  <img
                                    src={image}
                                    alt={`Report ${index}`}
                                    className="h-full w-full object-cover rounded border dark:border-gray-600"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-2 py-1 text-xs rounded-full mb-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300`}
                        >
                          Archived
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    No archived reports
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-4">
          <h2 className="text-xl font-semibold text-teal-600 dark:text-teal-500 mb-4">
            Sensor Management
          </h2>

          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-medium text-teal-600 dark:text-teal-500 mb-2">
              Default Alert Threshold (for new sensors)
            </h3>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                min="0"
                max="500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                (0-500 scale)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <input
              type="text"
              placeholder="Location Name"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              disabled={isLoading.operations}
            />
            <input
              type="number"
              placeholder="Latitude"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              step="any"
              disabled={isLoading.operations}
            />
            <input
              type="number"
              placeholder="Longitude"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              step="any"
              disabled={isLoading.operations}
            />
            <select
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              disabled={isLoading.operations}
            >
              {["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"].map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                className={`flex items-center justify-center flex-1 ${
                  editingSensor
                    ? "bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700"
                    : "bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700"
                } text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50`}
                onClick={handleAddSensorLocation}
                disabled={isLoading.operations}
              >
                {isLoading.operations ? (
                  <span className="animate-spin">Processing...</span>
                ) : editingSensor ? (
                  <>
                    <FaSave className="mr-2" /> Update
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" /> Add
                  </>
                )}
              </button>
              {editingSensor && (
                <button
                  className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  onClick={resetSensorForm}
                  disabled={isLoading.operations}
                >
                  <FaUndo />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            {isLoading.sensors ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500 dark:border-teal-400"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Threshold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sensorLocations.length > 0 ? (
                    sensorLocations.map((sensor) => {
                      const currentThreshold =
                        individualThresholds[sensor._id] !== undefined
                          ? individualThresholds[sensor._id]
                          : sensor.threshold || alertThreshold;

                      return (
                        <tr key={sensor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {sensor.locationName || "Unnamed"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {sensor.zone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {sensor.lat.toFixed(4)}, {sensor.lon.toFixed(4)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              value={currentThreshold}
                              onChange={(e) => handleThresholdChange(sensor._id, e.target.value)}
                              min="0"
                              max="500"
                              disabled={isLoading.operations}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEditSensor(sensor)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3 disabled:opacity-50"
                              disabled={isLoading.operations}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteSensor(sensor._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                              disabled={isLoading.operations}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No sensors found. Add your first sensor above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

        {/* Rejection Modal */}
        {rejectionModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Reject Report
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this report:
              </p>
              <textarea
                value={rejectionModal.comment}
                onChange={(e) => setRejectionModal(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRejectWithComment}
                  disabled={isLoading.operations}
                  className="flex-1 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {isLoading.operations ? "Rejecting..." : "Reject"}
                </button>
                <button
                  onClick={() => setRejectionModal({ show: false, reportId: null, comment: "" })}
                  className="flex-1 bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;