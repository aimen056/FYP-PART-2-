import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
});

export const getData = () => API.get('/');
export const getAqiData = (zone) => API.get(`/aqi?zone=${encodeURIComponent(zone)}`);

