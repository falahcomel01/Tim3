import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getCategories  = (params = {}) => api.get('/api/categories', { params });
export const getCategory    = (id)           => api.get(`/api/categories/${id}`);
export const createCategory = (data)         => api.post('/api/categories', data);
export const updateCategory = (id, data)     => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id)           => api.delete(`/api/categories/${id}`);