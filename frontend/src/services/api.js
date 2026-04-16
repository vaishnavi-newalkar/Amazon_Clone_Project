/**
 * API Service - Centralized Axios instance
 * Handles base URL, auth headers, and error interceptors
 */
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally - redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data)  => api.post('/auth/signup', data),
  login:  (data)  => api.post('/auth/login', data),
  me:     ()      => api.get('/auth/me'),
  update: (data)  => api.put('/auth/me', data),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params) => api.get('/products', { params }),
  featured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  detail: (id) => api.get(`/products/${id}`),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesAPI = {
  list: () => api.get('/categories'),
};

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get:    ()              => api.get('/cart'),
  add:    (data)          => api.post('/cart/add', data),
  update: (itemId, data)  => api.put(`/cart/${itemId}`, data),
  remove: (itemId)        => api.delete(`/cart/${itemId}`),
  clear:  ()              => api.delete('/cart'),
};

// ── Wishlist ──────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get:    ()          => api.get('/wishlist'),
  add:    (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersAPI = {
  place:   (data)    => api.post('/orders/place', data),
  history: ()        => api.get('/orders'),
  detail:  (orderId) => api.get(`/orders/${orderId}`),
  cancel:  (orderId) => api.put(`/orders/${orderId}/cancel`),
};

export default api;
