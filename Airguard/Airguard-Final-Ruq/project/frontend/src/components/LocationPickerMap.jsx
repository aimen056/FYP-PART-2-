import React from "react";
import { MapContainer, TileLayer, Marker, ZoomControl, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import gpsIcon from "../assets/gps.png";

const LocationPickerHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e);
      }
    },
  });
  return null;
};

const LocationPickerMap = ({ selectedLocation, onMapClick }) => {
  const markerIcon = new Icon({
    iconUrl: gpsIcon,
    iconSize: [36, 36],
  });

  return (
    <div style={{ position: "relative", height: "50vh", width: "100%" }}>
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
        <LocationPickerHandler onMapClick={onMapClick} />
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={markerIcon} />
        )}
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap; 