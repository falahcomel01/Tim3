import api from './api';

export const getProducts = (params = {}) =>
  api.get('/products', { params });

export const getProduct = (id) =>
  api.get(`/products/${id}`);

export const createProduct = (data) =>
  api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id, data) => {
  // Laravel tidak support file via PUT, pakai POST + _method
  data.append('_method', 'PUT');
  return api.post(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

export const syncCategories = (productId, categoryIds) =>
  api.put(`/products/${productId}/categories`, { categories: categoryIds });