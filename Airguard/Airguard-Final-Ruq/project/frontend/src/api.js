import axios from 'axios';

const API = axios.create({
  baseURL: 'https://airguard-f6mb.onrender.com/api',

});

export const getData = () => API.get('/');
export const getAqiData = (zone) => API.get(`/aqi?zone=${encodeURIComponent(zone)}`);

