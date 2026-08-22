import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Indirizzo base per caricare le immagini dal server Node
export const SERVER_URL = 'http://localhost:5000';

export default API;