import axios from 'axios';

const API = '/api';

/**
 * Buat varian produk baru.
 * Body: { name, price, stock, status_id }
 * Endpoint: POST /products/{product}/variants
 */
export const createVariant = (productId, data) =>
  axios.post(`${API}/products/${productId}/variants`, data);

/**
 * Perbarui varian produk.
 * Body: { name?, price?, stock?, status_id? }
 * Endpoint: PUT /products/{product}/variants/{variant}
 */
export const updateVariant = (productId, variantId, data) =>
  axios.put(`${API}/products/${productId}/variants/${variantId}`, data);

/**
 * Hapus varian produk.
 * Endpoint: DELETE /products/{product}/variants/{variant}
 */
export const deleteVariant = (productId, variantId) =>
  axios.delete(`${API}/products/${productId}/variants/${variantId}`);