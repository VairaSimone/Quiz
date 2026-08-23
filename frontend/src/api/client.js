import axios from 'axios';

export const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({ baseURL: `${SERVER_URL}/api` });

// Inietta la password Admin presente nel localStorage in ogni richiesta
API.interceptors.request.use((config) => {
  const adminPassword = localStorage.getItem('adminPassword');
  if (adminPassword) {
    config.headers['x-admin-password'] = adminPassword;
  }
  return config;
});

export default API;