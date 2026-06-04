import axios from 'axios';

const API = '/api';

/**
 * Upload gambar produk.
 * Body: FormData dengan field `image` (file).
 * Endpoint: POST /products/{product}/images
 */
export const uploadImage = (productId, formData) =>
  axios.post(`${API}/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Perbarui data gambar (misal: set is_primary, sort_order).
 * Body: { url?, is_primary?, sort_order? }
 * Endpoint: PUT /products/{product}/images/{image}
 */
export const updateImage = (productId, imageId, data) =>
  axios.put(`${API}/products/${productId}/images/${imageId}`, data);

/**
 * Hapus gambar produk.
 * Endpoint: DELETE /products/{product}/images/{image}
 */
export const deleteImage = (productId, imageId) =>
  axios.delete(`${API}/products/${productId}/images/${imageId}`);