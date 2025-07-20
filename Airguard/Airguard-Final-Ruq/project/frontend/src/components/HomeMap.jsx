import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl,
  Circle,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./HomeMap.css";
import { Icon } from "leaflet";
import axios from "axios";
import { BsFullscreen } from "react-icons/bs";
import { NavLink } from "react-router-dom";

// Icons
import gpsIcon from "../assets/gps.png";
import trashIcon from "../assets/trash.png";
import factoryIcon from "../assets/factory.png";
import carIcon from "../assets/car.png";
import dustIcon from "../assets/dust.png";
import indoorIcon from "../assets/indoor.png";
import otherIcon from "../assets/other.png";

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e); // Pass the Leaflet event to the parent
      }
    },
  });
  return null;
};

const HomeMap = ({ markers = [], fullscreen = false, onMapClick }) => {
  const [zoneData, setZoneData] = useState([]);
  const [error, setError] = useState(null);
  const [enrichedMarkers, setEnrichedMarkers] = useState([]);

  const categoryColors = {
    good: "#70E000",
    moderate: "#FEDD00",
    unhealthySensitive: "#FE7434",
    unhealthy: "#F41C34",
    veryUnhealthy: "#B4418E",
    hazardous: "#7B0D1E",
    unknown: "#CCCCCC",
  };

  const SENSOR_COVERAGE_RADIUS = 150;
  const ZONE_RADIUS = 1000;

const pollutionIcons = {
  "Burning of Waste": new Icon({ iconUrl: trashIcon, iconSize: [36, 36] }),
  "Industrial Emissions": new Icon({ iconUrl: factoryIcon, iconSize: [36, 36] }),
  "Vehicle Emissions": new Icon({ iconUrl: carIcon, iconSize: [36, 36] }),
  "Construction Dust": new Icon({ iconUrl: dustIcon, iconSize: [36, 36] }),
  "Indoor Air Quality Issues": new Icon({ iconUrl: indoorIcon, iconSize: [36, 36] }),
  "Other": new Icon({ iconUrl: otherIcon, iconSize: [36, 36] }),
};

  const defaultSensorIcon = new Icon({
    iconUrl: gpsIcon,
    iconSize: [36, 36],
  });

  const getAqiCategory = (aqi) => {
    if (!aqi || isNaN(aqi) || aqi < 0) return "unknown";
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "unhealthySensitive";
    if (aqi <= 200) return "unhealthy";
    if (aqi <= 300) return "veryUnhealthy";
    return "hazardous";
  };

  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        const [aqiResponse, sensorResponse, reportsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/aggregated`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/sensor-locations`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reports`),
        ]);

        console.log("Reports response:", reportsResponse.data); // Debug log

        const latestAqiReadings = aqiResponse.data.reduce((acc, reading) => {
          if (!acc.latest || new Date(reading.intervalEnd) > new Date(acc.latest.intervalEnd)) {
            return { ...acc, latest: reading };
          }
          return acc;
        }, {}).latest;

        const zonesWithAqi = sensorResponse.data.map((sensor) => ({
          zone: sensor.zone,
          geocode: [sensor.lat, sensor.lon],
          aqi: latestAqiReadings ? latestAqiReadings.aqi : null,
          status: latestAqiReadings ? getAqiCategory(latestAqiReadings.aqi) : "unknown",
        }));

        // Update the filter
const reportMarkers = reportsResponse.data
  .filter((report) => {
    const isVerified = report.verificationStatus === "verified";
    const hasValidCoords = report.lat && report.lon && !isNaN(report.lat) && !isNaN(report.lon);
    const isActive = report.resolved === false; // Only show unresolved reports
    return isVerified && hasValidCoords && isActive;
  })
  .map((report) => {
    console.log("Creating marker for:", report.pollutionType);
    return {
      geocode: [report.lat, report.lon],
      pollutionType: report.pollutionType,
      locationName: report.location,
      status: "pollution",
      description: report.description,
      user: report.user,
      date: report.date,
    };
  });

        console.log("Report markers:", reportMarkers); // Debug log

        const enriched = [...markers, ...reportMarkers].map((marker) => {
          if (marker.pollutionType || marker.aqi !== undefined) return marker;

          const sensor = sensorResponse.data.find(
            (s) => s.locationName === marker.locationName || s.zone === marker.zone
          );

          if (sensor) {
            return {
              ...marker,
              aqi: latestAqiReadings ? latestAqiReadings.aqi : null,
              status: latestAqiReadings ? getAqiCategory(latestAqiReadings.aqi) : "unknown",
            };
          }

          return marker;
        });

        setZoneData(zonesWithAqi);
        setEnrichedMarkers(enriched);
      } catch (err) {
        console.error("Error fetching zone data:", err);
        setError("Failed to fetch zone data.");
      }
    };

    fetchZoneData();
  }, [markers]);

  const validMarkers = enrichedMarkers.filter(
    (marker) =>
      Array.isArray(marker.geocode) &&
      marker.geocode.length === 2 &&
      !isNaN(marker.geocode[0]) &&
      !isNaN(marker.geocode[1])
  );

  return (
    <div style={{ position: "relative", height: fullscreen ? "100vh" : "50vh", width: "100%" }}>
      {!fullscreen && (
        <NavLink to="/fullscreenMap">
          <button className="flex items-center gap-2 absolute top-2 right-2 z-[10] p-2 ring-2 bg-secBtnBg text-secBtnText dark:bg-secBtnBg dark:text-secBtnText rounded-md">
            <BsFullscreen />
            Fullscreen Map
          </button>
        </NavLink>
      )}

      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={[33.5468, 73.184]}
        zoom={12}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapClickHandler onMapClick={onMapClick} />

        {error && <Popup position={[33.5468, 73.184]}>{error}</Popup>}

        {zoneData.map((zone, i) => (
          <Circle
            key={`zone-${i}`}
            center={zone.geocode}
            radius={ZONE_RADIUS}
            pathOptions={{
              fillColor: categoryColors[zone.status],
              color: categoryColors[zone.status],
              fillOpacity: 0.2,
              weight: 1,
            }}
          >
            <Popup>
              <div className="flex flex-col">
                <span className="font-bold">{zone.zone}</span>
                <span>AQI: {zone.aqi !== null ? zone.aqi : "N/A"}</span>
                <span>Status: {zone.status}</span>
              </div>
            </Popup>
          </Circle>
        ))}

        {validMarkers.map((marker, i) => {
          const isPollutionReport = marker.pollutionType;
          const icon = isPollutionReport
            ? pollutionIcons[marker.pollutionType] || pollutionIcons["Other"]
            : defaultSensorIcon;

          return (
            <React.Fragment key={i}>
              <Marker position={marker.geocode} icon={icon}>
                <Tooltip permanent direction="bottom" offset={[0, 15]} className="custom-tooltip">
                  {isPollutionReport ? marker.pollutionType : marker.label || "Unknown"}
                </Tooltip>
                <Popup>
                  <div className="flex flex-col">
                    {isPollutionReport ? (
                      <>
                        <span className="font-bold">Pollution Report</span>
                        <span>Type: {marker.pollutionType}</span>
                        <span>Location: {marker.locationName}</span>
                        {marker.description && <span>Description: {marker.description}</span>}
                        {marker.user && <span>Reported by: {marker.user}</span>}
                        {marker.date && <span>Date: {marker.date}</span>}
                      </>
                    ) : (
                      <>
                        <span className="font-bold">{marker.locationName || "Unnamed Location"}</span>
                        <span>AQI: {marker.aqi !== null ? marker.aqi : "N/A"}</span>
                        <span>Status: {marker.status}</span>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default HomeMap;