import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5002/api',

});

export const getData = () => API.get('/');
export const getAqiData = (zone) => API.get(`/aqi?zone=${encodeURIComponent(zone)}`);

