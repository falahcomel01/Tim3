// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', 
});

// Tambahkan token otomatis di setiap request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // sesuaikan key-nya
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;