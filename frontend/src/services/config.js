// ─── Single source of truth untuk URL backend ─────────────────────────────
// Ganti .env variables kalo deploy ke server lain.
// Contoh:
//   VITE_API_BASE=http://localhost:8000
//   VITE_STORAGE_BASE=https://cdn.sibermerch.com (jika beda domain)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const STORAGE_BASE = import.meta.env.VITE_STORAGE_BASE || API_BASE;

export const API_URL = `${API_BASE}/api`;
export const STORAGE_URL = STORAGE_BASE;

/**
 * Helper: ubah path storage (contoh: "/storage/products/foto.jpg")
 * jadi URL absolut. Kalo udah URL lengkap, biarin.
 * Kalo falsy, return placeholder.
 */
export function storageUrl(path) {
  if (!path) return 'https://via.placeholder.com/500x500?text=No+Image';
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE}${path}`;
}
