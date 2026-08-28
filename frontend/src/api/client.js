import axios from 'axios';

export const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({ baseURL: `${SERVER_URL}/api` });

API.interceptors.request.use((config) => {
  const adminPassword = localStorage.getItem('adminPassword') || localStorage.getItem('sitePassword');
  if (adminPassword) {
    config.headers['x-admin-password'] = adminPassword;
  }
  return config;
});

export default API;