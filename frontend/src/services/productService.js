import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProducts = (params = {}) =>
  api.get('/api/products', { params });

export const getCategories = () =>
  api.get('/api/categories').then(res => {
    const raw = res.data?.data ?? res.data ?? [];
    return { ...res, data: { data: Array.isArray(raw) ? raw : [] } };
  });

export const getProduct = (id) =>
  api.get(`/api/products/${id}`);

export const createProduct = (data) =>
  api.post('/api/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id, data) => {
  // Laravel tidak support file via PUT, pakai POST + _method
  data.append('_method', 'PUT');
  return api.post(`/api/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteProduct = (id) =>
  api.delete(`/api/products/${id}`);

export const syncCategories = (productId, categoryIds) =>
  api.put(`/api/products/${productId}/categories`, { categories: categoryIds });