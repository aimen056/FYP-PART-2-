import { FaSmileBeam, FaSkull, FaBiohazard } from "react-icons/fa"; 
import { MdSentimentNeutral, MdWarning, MdSick } from "react-icons/md"; 

export const getAqiCategory = (aqi) => {
  if (aqi <= 50) {
    return { label: "Good", className: "bg-aqi-good", icon: FaSmileBeam };
  } else if (aqi <= 100) {
    return { label: "Moderate", className: "bg-aqi-moderate", icon: MdSentimentNeutral };
  } else if (aqi <= 150) {
    return { label: "Unhealthy for Sensitive Groups", className: "bg-aqi-unhealthySensitive", icon: MdWarning };
  } else if (aqi <= 200) {
    return { label: "Unhealthy", className: "bg-aqi-unhealthy", icon: MdSick };
  } else if (aqi <= 300) {
    return { label: "Very Unhealthy", className: "bg-aqi-veryUnhealthy", icon: FaSkull };
  } else {
    return { label: "Hazardous", className: "bg-aqi-hazardous", icon: FaBiohazard };
  }
};