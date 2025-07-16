import React from "react";

const AqiRecommendations = ({ aqi }) => {
  const getRecommendations = (aqi) => {
    if (aqi >= 0 && aqi <= 50) {
      return {
        level: "Good",
        message: "Air quality is considered satisfactory, and air pollution poses little or no risk.",
        actions: "Enjoy outdoor activities as usual. No precautions necessary."
      };
    } else if (aqi >= 51 && aqi <= 100) {
      return {
        level: "Moderate",
        message: "Air quality is acceptable; however, some pollutants may be a concern for unusually sensitive individuals.",
        actions: "Sensitive individuals should reduce prolonged or heavy exertion outdoors. Consider staying indoors during peak pollution hours."
      };
    } else if (aqi >= 101 && aqi <= 150) {
      return {
        level: "Unhealthy for Sensitive Groups",
        message: "Members of sensitive groups may experience health effects; the general public is less likely to be affected.",
        actions: "People with lung diseases, children, older adults, and those active outdoors should limit prolonged or heavy exertion. Reduce outdoor activities if you have breathing difficulties."
      };
    } else if (aqi >= 151 && aqi <= 200) {
      return {
        level: "Unhealthy",
        message: "Some members of the general public may experience health effects; sensitive groups may experience more severe effects.",
        actions: "Everyone should reduce outdoor activities. Sensitive groups should avoid prolonged exertion and stay indoors as much as possible. Use air purifiers if necessary."
      };
    } else if (aqi >= 201 && aqi <= 300) {
      return {
        level: "Very Unhealthy",
        message: "Health alert: Everyone may experience more serious health effects.",
        actions: "Everyone should avoid outdoor activities. Sensitive groups should remain indoors with windows closed. Avoid heavy exertion, and use air filters where possible."
      };
    } else if (aqi >= 301) {
      return {
        level: "Hazardous",
        message: "Health warning: Emergency conditions. Everyone is more likely to be affected.",
        actions: "Stay indoors, keep windows and doors closed, use air filtration, and avoid outdoor exertion. If you experience breathing difficulty, seek medical attention immediately."
      };
    } else {
      return {
        level: "Unknown",
        message: "Unable to determine air quality recommendations.",
        actions: "Check local AQI sources for updated information."
      };
    }
  };

  const { level, message, actions } = getRecommendations(aqi);

  return (
    <div className="p-4 shadow-2xl rounded-lg">
      <h3 className="text-lg font-semibold text-center uppercase mb-2 text-gray-800">
        Air Quality Recommendations
      </h3>
      <div className="text-center">
        <p className={`text-xl font-bold text-primaryText}`}>{level}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{message}</p>
        <p className="text-sm font-medium text-primaryText">{actions}</p>
      </div>
    </div>
  );
};

export default AqiRecommendations;